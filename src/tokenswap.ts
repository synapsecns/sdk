import type {Token}    from "@token";
import {Tokens}        from "@tokens";
import {SwapPools}     from "@swappools";
import {rejectPromise} from "@common/utils";

import {SynapseEntities} from "@entities";
import {
    SwapContract,
    SwapFactory,
} from "@contracts";

import type {BridgeConfigV3Contract} from "@contracts";

import {Networks}                   from "@networks";
import {ChainId, supportedChainIds} from "@chainid";

import {SwapType}              from "@internal/swaptype";
import {rpcProviderForNetwork} from "@internal/rpcproviders";

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
    }

    export interface UnsupportedSwapError {
        errorKind: UnsupportedSwapErrorKind,
        reason:    string,
    }

    export const tokenNotSupported = (t: {symbol: string}, netName: string): UnsupportedSwapError => ({
        errorKind:  UnsupportedSwapErrorKind.UnsupportedToken,
        reason:    `Token ${t.symbol} not supported on network ${netName}`,
    });

    export const tokenNotSupportedNetFrom = (t: {symbol: string}, netName: string): UnsupportedSwapError => ({
        errorKind:  UnsupportedSwapErrorKind.UnsupportedTokenNetFrom,
        reason:    `Token ${t.symbol} not supported on 'from' network ${netName}`,
    });

    export const tokenNotSupportedNetTo = (t: {symbol: string}, netName: string): UnsupportedSwapError => ({
        errorKind:  UnsupportedSwapErrorKind.UnsupportedTokenNetTo,
        reason:    `Token ${t.symbol} not supported on 'to' network ${netName}`,
    });

    export const nonMatchingSwapTypes = (): UnsupportedSwapError => ({
        errorKind:  UnsupportedSwapErrorKind.NonmatchingSwapTypes,
        reason:    "Token swap types don't match",
    });
}

export namespace TokenSwap {
    const BRIDGE_CONFIG_INSTANCE: BridgeConfigV3Contract = SynapseEntities.bridgeConfigV3();

    export interface SwapParams {
        chainId:       number,
        tokenFrom:     Token,
        tokenTo:       Token,
        amountIn:      BigNumberish,
        swapData?:     SwapSetup,
    }

    export interface SwapTokensParams extends SwapParams {
        minAmountOut: BigNumberish,
        deadline?:    number,
    }

    export interface BridgeSwapSupportedParams {
        tokenFrom:   Token,
        tokenTo:     Token,
        chainIdFrom: number,
        chainIdTo:   number,
    }

    export interface EstimatedSwapRate {
        amountOut: BigNumber
    }

    export interface IntermediateSwapTokens {
        intermediateToken?:            Token,
        bridgeConfigIntermediateToken: Token
    }

    export interface SwapSupportedResult {
        swapSupported:       boolean,
        reasonNotSupported?: UnsupportedSwapErrors.UnsupportedSwapError,
    }

    export interface DetailedTokenSwapMap {
        [chainId: number]: {
            token: Token,
            [chainId: number]: Token[],
        }[],
    }

    interface TokenSwapMap {
        token: Token,
        [chainId: number]: Token[],
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
                swapInstance.calculateSwap(tokenIndexFrom, tokenIndexTo, args.amountIn)
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
                intermediateToken = Tokens.WAVAX;
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

            res[c1] = networkTokens.map((t: Token) => {
                let swapType = t.swapType;

                let tokSwapMap: TokenSwapMap = {
                    token: t,
                }

                for (const c2 of allChainIds) {
                    if (c1 === c2) continue

                    let outToks: Token[] = SwapPools.bridgeSwappableTypePoolsByChain[c2][swapType]?.poolTokens || [];
                    if (outToks.length === 0) continue

                    tokSwapMap[c2] = outToks;
                }

                return tokSwapMap
            })
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
            .then(({poolAddress}) => SwapFactory.connect(poolAddress, rpcProviderForNetwork(chainId)))
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

    const mintBurnSwapTypes = [
        SwapType.HIGH, SwapType.DOG, SwapType.JUMP,
        SwapType.NFD,  SwapType.OHM, SwapType.SOLAR,
        SwapType.GMX,
    ];

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
        const isSameNet: boolean = typeof chainIdTo === "undefined";

        const
            unsupportedFromErr = isSameNet ? UnsupportedSwapErrors.tokenNotSupported : UnsupportedSwapErrors.tokenNotSupportedNetFrom,
            unsupportedToErr   = isSameNet ? UnsupportedSwapErrors.tokenNotSupported : UnsupportedSwapErrors.tokenNotSupportedNetTo;

        const
            netFrom = Networks.fromChainId(chainIdFrom),
            netTo   = (typeof chainIdTo !== "undefined" ? Networks.fromChainId(chainIdTo) : netFrom);

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