import {Token} from "../token";
import {Tokens} from "../tokens";
import {ChainId} from "../common";
import {SwapType} from "../common/swaptype";

import {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import {SynapseEntities} from "../entities";
import {SwapContract, SwapFactory} from "../contracts/index";
import {newProviderForNetwork} from "../rpcproviders";
import {ContractTransaction} from "ethers";


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

    interface SwapSetup {
        swapInstance:   SwapContract,
        tokenIndexFrom: number,
        tokenIndexTo:   number,
    }

    async function swapContract(token: Token, chainId: number): Promise<SwapContract> {
        const
            poolConfigInstance = SynapseEntities.poolConfig(),
            lpToken = intermediateToken(token, chainId),
            {poolAddress} = await poolConfigInstance.getPoolConfig(lpToken.address(chainId), chainId);

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
        const [intermediateTokenA, intermediateTokenB]  = intermediateTokens(chainId, token);

        return intermediateTokenA ?? intermediateTokenB
    }

    const mintBurnSwapTypes = [
        SwapType.HIGH, SwapType.DOG, SwapType.JUMP,
        SwapType.NFD,  SwapType.OHM, SwapType.SOLAR,
        SwapType.GMX,
    ];

    export function intermediateTokens(chainId: number, token: Token): [Token, Token] {
        if (mintBurnSwapTypes.includes(token.swapType)) {
            return [token, token]
        }

        switch (token.swapType) {
            case SwapType.SYN:
                return [Tokens.SYN, Tokens.SYN]
            case SwapType.FRAX:
                if (chainId === ChainId.ETH) {
                    return [null, Tokens.FRAX]
                } else {
                    return [null, Tokens.SYN_FRAX]
                }
            case SwapType.ETH:
                let intermediate: Token;
                if (chainId === ChainId.ETH) {
                    intermediate = Tokens.WETH;
                } else {
                    intermediate = Tokens.NETH;
                }

                return [Tokens.NETH, intermediate]
            case SwapType.AVAX:
                return [Tokens.WAVAX, Tokens.WAVAX]
            case SwapType.MOVR:
                return [Tokens.WMOVR, Tokens.WMOVR]
            default:
                return [Tokens.NUSD, Tokens.NUSD]
        }
    }
}