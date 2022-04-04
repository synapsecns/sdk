import _ from "lodash";
import {
    ChainId,
    supportedChainIds
} from "@chainid";
import {Networks}      from "@networks";
import type {Token}    from "@token";
import {Tokens}        from "@tokens";
import {SwapPools}     from "@swappools";
import {rejectPromise} from "@common/utils";

import {BridgeConfigV3ContractInstance} from "@entities";

import {
    SwapContract,
    SwapFactory,
    type BridgeConfigV3Contract
} from "@contracts";

import {SwapType, mintBurnSwapTypes} from "@internal/swaptype";
import {rpcProviderForChain} from "@internal/rpcproviders";

import {
    BigNumber,
    type BigNumberish
} from "@ethersproject/bignumber";

import type {PopulatedTransaction} from "@ethersproject/contracts";

export namespace UnsupportedSwapErrors {
    export enum UnsupportedSwapErrorKind {
        UnsupportedToken,
        UnsupportedTokenNetFrom,
        UnsupportedTokenNetTo,
        NonmatchingSwapTypes,
        UnsupportedMultiJEWELMigration,
    }

    export interface UnsupportedSwapErrorArgs {
        reason:    string;
        errorKind: UnsupportedSwapErrorKind;
    }

    export class UnsupportedSwapError extends Error {
        readonly reason:    string;
        readonly errorKind: UnsupportedSwapErrorKind;

        constructor({reason, errorKind}: UnsupportedSwapErrorArgs) {
            super(reason);

            this.name = this.constructor.name;
            Error.captureStackTrace(this, this.constructor);

            this.reason    = reason;
            this.errorKind = errorKind;
        }
    }

    export const tokenNotSupported = (t: {symbol: string}, netName: string): UnsupportedSwapError => new UnsupportedSwapError({
        reason:    `Token ${t.symbol} not supported on network ${netName}`,
        errorKind:  UnsupportedSwapErrorKind.UnsupportedToken,
    });

    export const tokenNotSupportedNetFrom = (t: {symbol: string}, netName: string): UnsupportedSwapError => new UnsupportedSwapError({
        reason:    `Token ${t.symbol} not supported on 'from' network ${netName}`,
        errorKind:  UnsupportedSwapErrorKind.UnsupportedTokenNetFrom,
    });

    export const tokenNotSupportedNetTo = (t: {symbol: string}, netName: string): UnsupportedSwapError => new UnsupportedSwapError({
        reason:    `Token ${t.symbol} not supported on 'to' network ${netName}`,
        errorKind:  UnsupportedSwapErrorKind.UnsupportedTokenNetTo,
    });

    export const nonMatchingSwapTypes = (): UnsupportedSwapError => new UnsupportedSwapError({
        reason:    "Token swap types don't match",
        errorKind:  UnsupportedSwapErrorKind.NonmatchingSwapTypes,
    });

    export const unsupportedMultiJEWELMigration = (): UnsupportedSwapError => new UnsupportedSwapError({
        reason:    "Migrating multiJEWEL from Avalanche to Harmony is not supported",
        errorKind: UnsupportedSwapErrorKind.UnsupportedMultiJEWELMigration,
    });
}

export namespace TokenSwap {
    const BRIDGE_CONFIG_INSTANCE: BridgeConfigV3Contract = BridgeConfigV3ContractInstance();

    export interface SwapParams {
        chainId:       number;
        tokenFrom:     Token;
        tokenTo:       Token;
        amountIn:      BigNumberish;
        swapData?:     SwapSetup;
    }

    export interface SwapTokensParams extends SwapParams {
        minAmountOut: BigNumberish;
        deadline?:    number;
    }

    export interface BridgeSwapSupportedParams {
        tokenFrom:   Token;
        tokenTo:     Token;
        chainIdFrom: number;
        chainIdTo:   number;
    }

    export type EstimatedSwapRate = {
        amountOut: BigNumber
    }

    export type IntermediateSwapTokens = {
        intermediateToken?:            Token;
        bridgeConfigIntermediateToken: Token;
    }

    export type SwapSupportedResult = {
        swapSupported:       boolean;
        reasonNotSupported?: UnsupportedSwapErrors.UnsupportedSwapError;
    }

    export type DetailedTokenSwapMap = {
        [chainId: number]: {
            token: Token;
            [chainId: number]: Token[];
        }[];
    }

    interface TokenSwapMap {
        token: Token;
        [chainId: number]: Token[];
    }

    export function swapSupported(args: SwapParams): SwapSupportedResult {
        const {tokenFrom, tokenTo, chainId} = args;
        return checkCanSwap(tokenFrom, tokenTo, chainId)
    }

    export function bridgeSwapSupported(args: BridgeSwapSupportedParams): SwapSupportedResult {
        const {tokenFrom, tokenTo, chainIdFrom, chainIdTo} = args;
        return checkCanSwap(tokenFrom, tokenTo, chainIdFrom, chainIdTo);
    }

    export async function calculateSwapRate(args: SwapParams): Promise<EstimatedSwapRate> {
        const {swapSupported: canSwap, reasonNotSupported} = swapSupported(args);
        if (!canSwap) {
            return rejectPromise(reasonNotSupported)
        }

        return resolveSwapData(args)
            .then(({swapInstance, tokenIndexFrom, tokenIndexTo}) =>
                swapInstance
                    .calculateSwap(tokenIndexFrom, tokenIndexTo, args.amountIn)
                    .then((res): EstimatedSwapRate => ({amountOut: res}))
            )
            .catch(rejectPromise)
    }

    export async function buildSwapTokensTransaction(args: SwapTokensParams): Promise<PopulatedTransaction> {
        const {swapSupported: canSwap, reasonNotSupported} = swapSupported(args);
        if (!canSwap) {
            return rejectPromise(reasonNotSupported)
        }

        return resolveSwapData(args)
            .then(populateSwapTransaction(args))
            .catch(rejectPromise)
    }

    async function resolveSwapData(args: SwapTokensParams|SwapParams): Promise<SwapSetup> {
        const {swapData} = args;
        return Promise.resolve(swapData ? swapData : await swapSetup(args.tokenFrom, args.tokenTo, args.chainId))
    }

    function populateSwapTransaction(args: SwapTokensParams): (swapSetup: SwapSetup) => Promise<PopulatedTransaction> {
        return (swapSetup: SwapSetup): Promise<PopulatedTransaction> => {
            let {deadline} = args;
            const {swapInstance, tokenIndexFrom, tokenIndexTo} = swapSetup;

            deadline = deadline ?? Math.round((new Date().getTime() / 1000) + 60 * 10)

            const overrides: any = args.tokenFrom.isEqual(Tokens.ETH) ? {value:args.amountIn} : {};

            return swapInstance.populateTransaction.swap(
                tokenIndexFrom,
                tokenIndexTo,
                args.amountIn,
                args.minAmountOut,
                deadline,
                overrides
            )
        }
    }

    export function intermediateTokens(chainId: number, token: Token): IntermediateSwapTokens {
        if (mintBurnSwapTypes.includes(token.swapType)) {
            if (token.swapType === SwapType.JEWEL) {
                let bridgeConfigIntermediate: Token = chainId === ChainId.HARMONY
                    ? Tokens.SYN_JEWEL
                    : Tokens.JEWEL;

                return {intermediateToken: Tokens.JEWEL, bridgeConfigIntermediateToken: bridgeConfigIntermediate}
            }

            return {intermediateToken: token, bridgeConfigIntermediateToken: token}
        }

        let
            intermediateToken:             Token,
            bridgeConfigIntermediateToken: Token;

        switch (token.swapType) {
            case SwapType.SYN:
                intermediateToken = Tokens.SYN;
                break;
            case SwapType.FRAX:
                bridgeConfigIntermediateToken = chainId === ChainId.ETH ? Tokens.FRAX : Tokens.SYN_FRAX;
                break;
            case SwapType.ETH:
                intermediateToken             = Tokens.NETH;
                bridgeConfigIntermediateToken = chainId === ChainId.ETH ? Tokens.WETH : Tokens.NETH;
                break;
            case SwapType.AVAX:
                intermediateToken             = Tokens.WAVAX;
                bridgeConfigIntermediateToken = chainId === ChainId.HARMONY ? Tokens.SYN_AVAX : Tokens.WAVAX;
                break;
            case SwapType.MOVR:
                intermediateToken = Tokens.WMOVR;
                break;
            default:
                intermediateToken = Tokens.NUSD;
                break;
        }

        bridgeConfigIntermediateToken = bridgeConfigIntermediateToken ?? intermediateToken;

        return {intermediateToken, bridgeConfigIntermediateToken}
    }

    export function detailedTokenSwapMap(): DetailedTokenSwapMap {
        let res: DetailedTokenSwapMap = {};

        const allChainIds = supportedChainIds();

        for (const c1 of allChainIds) {
            let n1: Networks.Network = Networks.fromChainId(c1);
            let networkTokens: Token[] = n1.tokens;

            const chainGasToken = Tokens.gasTokenForChain(c1);

            res[c1] = networkTokens.map((t: Token) => {
                let swapType = t.swapType;

                if (!_.isNull(chainGasToken)) {
                    const gasWrapper = Tokens.gasTokenWrapper(chainGasToken);
                    if (gasWrapper.isEqual(t)) {
                        return
                    }
                }

                let tokSwapMap: TokenSwapMap = {
                    token: t,
                }

                for (const c2 of allChainIds) {
                    if (c1 === c2) continue

                    if (c1 === ChainId.AVALANCHE && t.isEqual(Tokens.MULTIJEWEL) && c2 !== ChainId.DFK) {
                        continue
                    }

                    const chain2GasToken = Tokens.gasTokenForChain(c2);
                    let outToks: Token[] = SwapPools.tokensForChainBySwapGroup(c2, swapType);
                    if (outToks.length === 0) continue

                    outToks = outToks.filter((t2: Token) => {
                        if (!_.isNull(chain2GasToken)) {
                            return !Tokens.gasTokenWrapper(chain2GasToken).isEqual(t2)
                        }

                        return true
                    })

                    tokSwapMap[c2] = outToks;
                }

                return tokSwapMap
            }).filter(t => !_.isUndefined(t))
        }

        return res
    }

    interface SwapSetup {
        swapInstance:   SwapContract,
        tokenIndexFrom: number,
        tokenIndexTo:   number,
    }

    async function swapContract(token: Token, chainId: number): Promise<SwapContract> {
        const lpToken = _intermediateToken(token, chainId);

        return BRIDGE_CONFIG_INSTANCE.getPoolConfig(lpToken.address(chainId), chainId)
            .then(({poolAddress}) => SwapFactory.connect(poolAddress, rpcProviderForChain(chainId)))
            .catch(rejectPromise)
    }

    export async function swapSetup(tokenFrom: Token, tokenTo: Token, chainId: number): Promise<SwapSetup> {
        const swapInstance = await swapContract(tokenFrom, chainId);

        return Promise.all([
                swapInstance.getTokenIndex(tokenFrom.address(chainId)),
                swapInstance.getTokenIndex(tokenTo.address(chainId)),
        ]).then(([tokenIndexFrom, tokenIndexTo]) => ({
            swapInstance,
            tokenIndexFrom,
            tokenIndexTo,
        })).catch(rejectPromise)
    }

    function _intermediateToken(token: Token, chainId: number): Token {
        const {intermediateToken, bridgeConfigIntermediateToken} = intermediateTokens(chainId, token);

        return intermediateToken ?? bridgeConfigIntermediateToken
    }

    function checkCanSwap(tokenFrom: Token, tokenTo: Token, chainFrom: number, chainTo?: number): SwapSupportedResult {
        const
            tokensCanSwap   = checkTokensCanSwap(tokenFrom, tokenTo),
            tokensSupported = checkTokensSupported(tokenFrom, tokenTo, chainFrom, chainTo);

        if (!tokensSupported.swapSupported) {
            return tokensSupported
        } else if (!tokensCanSwap.swapSupported) {
            return tokensCanSwap
        }

        return {swapSupported: true}
    }

    function checkTokensCanSwap(tokenFrom: Token, tokenTo: Token): SwapSupportedResult {
        let
            swapSupported: boolean = true,
            reasonNotSupported: UnsupportedSwapErrors.UnsupportedSwapError;

        if (tokenFrom.swapType !== tokenTo.swapType) {
            swapSupported = false;
            reasonNotSupported = UnsupportedSwapErrors.nonMatchingSwapTypes();
        }

        return {swapSupported, reasonNotSupported}
    }

    function checkTokensSupported(
        tokenFrom:   Token,
        tokenTo:     Token,
        chainIdFrom: number,
        chainIdTo?:  number
    ): SwapSupportedResult {
        const hasDestChain: boolean = !_.isUndefined(chainIdTo);

        const
            unsupportedFromErr = hasDestChain ? UnsupportedSwapErrors.tokenNotSupportedNetFrom : UnsupportedSwapErrors.tokenNotSupported,
            unsupportedToErr   = hasDestChain ? UnsupportedSwapErrors.tokenNotSupportedNetTo   : UnsupportedSwapErrors.tokenNotSupported;

        const
            netFrom = Networks.fromChainId(chainIdFrom),
            netTo   = hasDestChain ? Networks.fromChainId(chainIdTo) : netFrom;

        if (hasDestChain) {
            if (tokenFrom.isEqual(Tokens.MULTIJEWEL) && chainIdTo !== ChainId.DFK) {
                return {swapSupported: false, reasonNotSupported: UnsupportedSwapErrors.unsupportedMultiJEWELMigration()}
            }
        }

        let
            swapSupported: boolean = true,
            reasonNotSupported: UnsupportedSwapErrors.UnsupportedSwapError;

        if (!netFrom.supportsToken(tokenFrom)) {
            swapSupported = false;
            reasonNotSupported = unsupportedFromErr(tokenFrom, netFrom.name);
        } else if (!netTo.supportsToken(tokenTo)) {
            swapSupported = false;
            reasonNotSupported = unsupportedToErr(tokenTo, netTo.name);
        }

        return {swapSupported, reasonNotSupported}
    }
}