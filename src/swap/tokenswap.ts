import {Token} from "../token";
import {Tokens} from "../tokens";
import {ChainId} from "../common";
import {SwapType} from "../common/swaptype";

import {SynapseEntities} from "../entities";
import {newProviderForNetwork} from "../rpcproviders";
import {SwapContract, SwapFactory} from "../contracts";

import {ContractTransaction} from "@ethersproject/contracts";
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";


export namespace TokenSwap {
    export interface SwapTokensParams {
        chainId:       number,
        tokenFrom:     Token,
        tokenTo:       Token,
        amountIn:      BigNumberish,
        minAmountOut:  BigNumberish,
        deadline?:     number,
    }

    export interface CalculateSwapRateParams {
        chainId:       number,
        tokenFrom:     Token,
        tokenTo:       Token,
        amountIn:      BigNumberish,
    }

    export interface EstimatedSwapRate {
        amountOut: BigNumber
    }

    export interface IntermediateSwapTokens {
        intermediateToken?:            Token,
        bridgeConfigIntermediateToken: Token
    }

    export async function calculateSwapRate(args: CalculateSwapRateParams): Promise<EstimatedSwapRate> {
        const {swapInstance, tokenIndexFrom, tokenIndexTo} = await swapSetup(args.tokenFrom, args.tokenTo, args.chainId);

        return swapInstance.calculateSwap(tokenIndexFrom, tokenIndexTo, args.amountIn)
            .then((res): EstimatedSwapRate => ({amountOut: res}))
    }

    export async function swapTokens(args: SwapTokensParams): Promise<ContractTransaction> {
        const {swapInstance, tokenIndexFrom, tokenIndexTo} = await swapSetup(args.tokenFrom, args.tokenTo, args.chainId);

        let {deadline} = args;
        deadline = deadline ?? Math.round((new Date().getTime() / 1000) + 60 * 10)

        return swapInstance.swap(
            tokenIndexFrom,
            tokenIndexTo,
            args.amountIn,
            args.minAmountOut,
            deadline
        )
    }

    export function intermediateTokens(chainId: number, token: Token): IntermediateSwapTokens {
        if (mintBurnSwapTypes.includes(token.swapType)) {
            return {
                intermediateToken:             token,
                bridgeConfigIntermediateToken: token,
            }
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
        const
            swapInstance   = await swapContract(tokenFrom, chainId),
            tokenIndexFrom = await swapInstance.getTokenIndex(tokenFrom.address(chainId)),
            tokenIndexTo   = await swapInstance.getTokenIndex(tokenTo.address(chainId));

        return {
            swapInstance,
            tokenIndexFrom,
            tokenIndexTo,
        }
    }

    function intermediateToken(token: Token, chainId: number): Token {
        const {intermediateToken, bridgeConfigIntermediateToken}  = intermediateTokens(chainId, token);

        return intermediateToken ?? bridgeConfigIntermediateToken
    }

    const mintBurnSwapTypes = [
        SwapType.HIGH, SwapType.DOG, SwapType.JUMP,
        SwapType.NFD,  SwapType.OHM, SwapType.SOLAR,
        SwapType.GMX,
    ];
}