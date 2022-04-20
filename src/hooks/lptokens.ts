import type {Token} from "@token";
import {Tokens} from "@tokens";
import {SwapPools} from "@swappools";
import {TokenSwap} from "@tokenswap";

import {useSignerFromEthereumFn} from "./signer";

import {useEffect, useState} from "react";

import {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import {ContractTransaction} from "@ethersproject/contracts";

function bignumFromBignumberish(n: BigNumberish, token: Token, chainId: number): BigNumber {
	return n instanceof BigNumber
		? n as BigNumber
		: token.etherToWei(n, chainId)
}

export function useChainStableswapLPToken(ethereum: any, chainId: number) {
	const [lpToken, setLpToken] = useState<SwapPools.SwapPoolToken>(null);

	useEffect(() => {
		if (typeof chainId !== 'undefined' && chainId !== null) {
			if (lpToken !== null) {
				if (lpToken.chainId !== chainId) {
					setLpToken(SwapPools.stableswapPoolForNetwork(chainId));
				}
			} else {
				setLpToken(SwapPools.stableswapPoolForNetwork(chainId));
			}
		}
	}, [chainId]);

	return [lpToken]
}

export function useChainETHSwapLPToken(ethereum: any, chainId: number) {
	const [lpToken, setLpToken] = useState<SwapPools.SwapPoolToken>(null);

	useEffect(() => {
		if (typeof chainId !== 'undefined' && chainId !== null) {
			if (lpToken !== null) {
				if (lpToken.chainId !== chainId) {
					setLpToken(SwapPools.ethSwapPoolForNetwork(chainId));
				}
			} else {
				setLpToken(SwapPools.ethSwapPoolForNetwork(chainId));
			}
		}
	}, [chainId]);

	return [lpToken]
}

export function useHarmonyJewelLPToken(ethereum: any, chainId: number) {
	return [SwapPools.HARMONY_JEWEL_SWAP_TOKEN]
}

export function useHarmonyAVAXLPToken(ethereum: any, chainId: number) {
	return [SwapPools.HARMONY_AVAX_SWAP_TOKEN]
}

export function useCalculateAddLiquidity(ethereum: any, chainId: number) {
	async function fn(args: {
		lpToken: SwapPools.SwapPoolToken,
		amounts: BigNumberish[]
	}): Promise<BigNumber> {
		return TokenSwap.calculateAddLiquidity({
			...args,
			amounts: args.amounts.map((n, idx) => bignumFromBignumberish(n, args.lpToken.poolTokens[idx], chainId)),
			chainId
		})
	}

	return [fn]
}

export function useCalculateRemoveLiquidity(ethereum: any, chainId: number) {
	async function fn(args: {
		lpToken: SwapPools.SwapPoolToken,
		amount:  BigNumberish
	}): Promise<BigNumber[]> {
		return TokenSwap.calculateRemoveLiquidity({
			...args,
			amount: bignumFromBignumberish(args.amount, args.lpToken.baseToken, chainId),
			chainId
		})
	}

	return [fn]
}

export function useCalculateRemoveLiquidityOneToken(ethereum: any, chainId: number) {
	async function fn(args: {
		lpToken: SwapPools.SwapPoolToken,
		token:   Token,
		amount:  BigNumberish
	}): Promise<BigNumber[]> {
		return TokenSwap.calculateRemoveLiquidity({
			...args,
			amount: bignumFromBignumberish(args.amount, args.token, chainId),
			chainId
		})
	}

	return [fn]
}

export function useAddLiquidity(ethereum: any, chainId: number) {
	const [getSigner] = useSignerFromEthereumFn();

	async function fn(args: {
		lpToken:   SwapPools.SwapPoolToken,
		deadline:  BigNumberish,
		amounts:   BigNumberish[],
		minToMint: BigNumberish
	}): Promise<ContractTransaction> {
		return TokenSwap.addLiquidity({
			...args,
			deadline:   BigNumber.from(args.deadline),
			amounts:    args.amounts.map((n, idx) => bignumFromBignumberish(n, args.lpToken.poolTokens[idx], chainId)),
			minToMint:  bignumFromBignumberish(args.minToMint, args.lpToken.baseToken, chainId),
			chainId,
			signer: getSigner(ethereum)
		})
	}

	return [fn]
}

export function useRemoveLiquidity(ethereum: any, chainId: number) {
	const [getSigner] = useSignerFromEthereumFn();

	async function fn(args: {
		lpToken:    SwapPools.SwapPoolToken,
		deadline:   BigNumberish,
		amount:     BigNumberish
		minAmounts: BigNumberish[],
	}): Promise<ContractTransaction> {
		return TokenSwap.removeLiquidity({
			...args,
			deadline:   BigNumber.from(args.deadline),
			amount:     bignumFromBignumberish(args.amount, args.lpToken.baseToken, chainId),
			minAmounts: args.minAmounts.map((n, idx) => bignumFromBignumberish(n, args.lpToken.poolTokens[idx], chainId)),
			chainId,
			signer: getSigner(ethereum)
		})
	}

	return [fn]
}

export function useRemoveLiquidityOneToken(ethereum: any, chainId: number) {
	const [getSigner] = useSignerFromEthereumFn();

	async function fn(args: {
		lpToken:    SwapPools.SwapPoolToken,
		deadline:   BigNumberish,
		amount:     BigNumberish
		minAmount:  BigNumberish,
		token:		Token
	}): Promise<ContractTransaction> {
		return TokenSwap.removeLiquidityOneToken({
			...args,
			deadline:  BigNumber.from(args.deadline),
			amount:    bignumFromBignumberish(args.amount, args.token, chainId),
			minAmount: bignumFromBignumberish(args.minAmount, args.lpToken.baseToken, chainId),
			chainId,
			signer: getSigner(ethereum)
		})
	}

	return [fn]
}

export function useCalculateSwapRate(ethereum: any, chainId: number) {
	async function fn(args: {
		tokenFrom: Token,
		tokenTo:   Token,
		amountIn:  BigNumberish,
	}): Promise<BigNumber> {
		return TokenSwap.calculateSwapRate({
			...args,
			amountIn: bignumFromBignumberish(args.amountIn, args.tokenFrom, chainId),
			chainId
		}).then(res => res.amountOut)
	}

	return [fn]
}

export function useApproveLPToken(ethereum: any, chainId: number) {
	const [getSigner] = useSignerFromEthereumFn();

	async function fn(args: {
		lpToken: SwapPools.SwapPoolToken,
		amount?: BigNumberish
	}): Promise<ContractTransaction> {
		const {
			lpToken: {
				swapAddress: spender,
				baseToken:   token
			}
		} = args;

		const amt = args.amount
			? bignumFromBignumberish(args.amount, args.lpToken.baseToken, chainId)
			: undefined

		return Tokens.approveTokenSpend({
			...args,
			amount: amt,
			spender,
			token,
			chainId,
			signer: getSigner(ethereum)
		})
	}

	return [fn]
}

export function useSwapTokens(ethereum: any, chainId: number) {
	const [getSigner] = useSignerFromEthereumFn();

	async function fn(args: {
		tokenFrom:    Token,
		tokenTo:   	  Token,
		amountIn:  	  BigNumberish,
		minAmountOut: BigNumberish,
		deadline?:    number
	}): Promise<ContractTransaction> {
		const fnParams = {
			...args,
			amountIn:     bignumFromBignumberish(args.amountIn, args.tokenFrom, chainId),
			minAmountOut: bignumFromBignumberish(args.minAmountOut, args.tokenTo, chainId),
			chainId,
			signer: getSigner(ethereum)
		};

		return TokenSwap.swapTokens(fnParams)
	}

	return [fn]
}