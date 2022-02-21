import {Token} from "./token";
import {Tokens} from "./tokens";
import {SwapPools} from "./swappools";
import {rejectPromise} from "./common/utils";

import {SynapseEntities} from "./entities";
import {SwapContract, SwapFactory} from "./contracts";

import {ChainId, supportedChainIds} from "./common/chainid";
import {Networks} from "./common/networks";

import {SwapType} from "./internal/swaptype";
import {newProviderForNetwork} from "./internal/rpcproviders";

import {PopulatedTransaction} from "@ethersproject/contracts";
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";

export namespace UnsupportedSwapErrors {
    interface Tok {symbol: string}

    export enum UnsupportedSwapErrorKind {
        UnsupportedToken,
        UnsupportedTokenNetFrom,
        UnsupportedTokenNetTo,
        NonmatchingSwapTypes,
        BobaToL1,
        ETHOnBoba,
    }

    export interface UnsupportedSwapError {
        errorKind: UnsupportedSwapErrorKind,
        reason:    string,
    }

    export type UnsupportedSwapErrorFunc = (t: Tok, netName: string) => UnsupportedSwapErrors.UnsupportedSwapError;

    export const tokenNotSupported = (t: Tok, netName: string): UnsupportedSwapError => ({
        errorKind:  UnsupportedSwapErrorKind.UnsupportedToken,
        reason:    `Token ${t.symbol} not supported on network ${netName}`,
    })

    export const tokenNotSupportedNetFrom = (t: Tok, netName: string): UnsupportedSwapError => ({
        errorKind:  UnsupportedSwapErrorKind.UnsupportedTokenNetFrom,
        reason:    `Token ${t.symbol} not supported on 'from' network ${netName}`,
    })

    export const tokenNotSupportedNetTo = (t: Tok, netName: string): UnsupportedSwapError => ({
        errorKind:  UnsupportedSwapErrorKind.UnsupportedTokenNetTo,
        reason:    `Token ${t.symbol} not supported on 'to' network ${netName}`,
    })

    export const nonMatchingSwapTypes = (st1: string, st2: string): UnsupportedSwapError => ({
        errorKind:  UnsupportedSwapErrorKind.NonmatchingSwapTypes,
        reason:    "Token swap types don't match",
    })

    export const ethOnBoba = (): UnsupportedSwapError => ({
        errorKind: UnsupportedSwapErrorKind.ETHOnBoba,
        reason:    "Currently, the SDK only supports bridging Stablecoins to and from BOBA",
    })

    export const bobaToL1 = (): UnsupportedSwapError => ({
        errorKind: UnsupportedSwapErrorKind.BobaToL1,
        reason:    "Bridging ETH from Boba Mainnet to L1 not currently supported",
    })
}

export namespace TokenSwap {
    export interface SwapParams {
        chainId:       number,
        tokenFrom:     Token,
        tokenTo:       Token,
        amountIn:      BigNumberish,
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

        let
            swapSupported: boolean = true,
            reasonNotSupported: UnsupportedSwapErrors.UnsupportedSwapError;

        const canSwap = checkCanSwap(tokenFrom, tokenTo, chainIdFrom, chainIdTo);
        if (!canSwap.swapSupported) {
            return canSwap
        }

        const checkBoba = (c: number, t: Token): boolean => c === ChainId.BOBA && t.swapType === SwapType.ETH;
        const
            isEthFromBoba = checkBoba(chainIdFrom, tokenFrom),
            isEthToBoba   = checkBoba(chainIdTo,   tokenTo);

        if (isEthFromBoba || isEthToBoba) {
            swapSupported = false;
            reasonNotSupported = UnsupportedSwapErrors.ethOnBoba();
        }

        return {swapSupported, reasonNotSupported}
    }

    export async function calculateSwapRate(args: SwapParams): Promise<EstimatedSwapRate> {
        const {swapSupported: canSwap, reasonNotSupported} = swapSupported(args);
        if (!canSwap) {
            return rejectPromise(reasonNotSupported)
        }

        const {swapInstance, tokenIndexFrom, tokenIndexTo} = await swapSetup(args.tokenFrom, args.tokenTo, args.chainId);

        return swapInstance.calculateSwap(tokenIndexFrom, tokenIndexTo, args.amountIn)
            .then((res): EstimatedSwapRate => ({amountOut: res}))
    }

    export async function buildSwapTokensTransaction(args: SwapTokensParams): Promise<PopulatedTransaction> {
        const {swapSupported: canSwap, reasonNotSupported} = swapSupported(args);
        if (!canSwap) {
            return rejectPromise(reasonNotSupported)
        }

        const {swapInstance, tokenIndexFrom, tokenIndexTo} = await swapSetup(args.tokenFrom, args.tokenTo, args.chainId);

        let {deadline} = args;
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
        const
            poolConfigInstance = SynapseEntities.poolConfig(),
            lpToken            = intermediateToken(token, chainId),
            {poolAddress}      = await poolConfigInstance.getPoolConfig(lpToken.address(chainId), chainId);

        return SwapFactory.connect(poolAddress, newProviderForNetwork(chainId))
    }

    async function swapSetup(tokenFrom: Token, tokenTo: Token, chainId: number): Promise<SwapSetup> {
        const swapInstance   = await swapContract(tokenFrom, chainId)

        const [tokenIndexFrom, tokenIndexTo] = await Promise.all([
            swapInstance.getTokenIndex(tokenFrom.address(chainId)),
            swapInstance.getTokenIndex(tokenTo.address(chainId))
        ])

        return {
            swapInstance,
            tokenIndexFrom,
            tokenIndexTo,
        }
    }

    function intermediateToken(token: Token, chainId: number): Token {
        const {intermediateToken, bridgeConfigIntermediateToken} = intermediateTokens(chainId, token);

        return intermediateToken ?? bridgeConfigIntermediateToken
    }

    const mintBurnSwapTypes = [
        SwapType.HIGH, SwapType.DOG, SwapType.JUMP,
        SwapType.NFD,  SwapType.OHM, SwapType.SOLAR,
        SwapType.GMX,
    ];

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
            reasonNotSupported = UnsupportedSwapErrors.nonMatchingSwapTypes(tokenFrom.swapType, tokenTo.swapType);
        }

        return {swapSupported, reasonNotSupported}
    }

    function checkTokensSupported(tokenFrom: Token, tokenTo: Token, chainIdFrom: number, chainIdTo?: number): SwapSupportedResult {
        const unsupportedFunc = (
            chainId: number,
            notSupportedErr: UnsupportedSwapErrors.UnsupportedSwapErrorFunc
        ): UnsupportedSwapErrors.UnsupportedSwapErrorFunc => (typeof chainId !== "undefined"
            ? notSupportedErr
            : UnsupportedSwapErrors.tokenNotSupported
        );

        const
            unsupportedFromErr = unsupportedFunc(chainIdFrom, UnsupportedSwapErrors.tokenNotSupportedNetFrom),
            unsupportedToErr   = unsupportedFunc(chainIdTo,   UnsupportedSwapErrors.tokenNotSupportedNetTo);

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