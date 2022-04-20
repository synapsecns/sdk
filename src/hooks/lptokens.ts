import type {Token} from "@token";
import {Tokens} from "@tokens";
import {SwapPools} from "@swappools";
import {TokenSwap} from "@tokenswap";

import {useSignerFromEthereum, useSignerFromEthereumFn} from "./signer";

import {useEffect, useState} from "react";

import {BigNumber} from "@ethersproject/bignumber";
import {ContractTransaction} from "@ethersproject/contracts";

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
		amounts: BigNumber[]
	}): Promise<BigNumber> {
		return TokenSwap.calculateAddLiquidity({...args, chainId})
	}

	return [fn]
}

export function useCalculateRemoveLiquidity(ethereum: any, chainId: number) {
	async function fn(args: {
		lpToken: SwapPools.SwapPoolToken,
		amount:  BigNumber
	}): Promise<BigNumber[]> {
		return TokenSwap.calculateRemoveLiquidity({...args, chainId})
	}

	return [fn]
}

export function useCalculateRemoveLiquidityOneToken(ethereum: any, chainId: number) {
	async function fn(args: {
		lpToken: SwapPools.SwapPoolToken,
		token:   Token,
		amount:  BigNumber
	}): Promise<BigNumber[]> {
		return TokenSwap.calculateRemoveLiquidity({...args, chainId})
	}

	return [fn]
}

export function useAddLiquidity(ethereum: any, chainId: number) {
	const [getSigner] = useSignerFromEthereumFn();

	async function fn(args: {
		lpToken:   SwapPools.SwapPoolToken,
		deadline:  BigNumber,
		amounts:   BigNumber[],
		minToMint: BigNumber
	}): Promise<ContractTransaction> {
		return TokenSwap.addLiquidity({...args, chainId, signer: getSigner(ethereum)})
	}

	return [fn]
}

export function useRemoveLiquidity(ethereum: any, chainId: number) {
	const [getSigner] = useSignerFromEthereumFn();

	async function fn(args: {
		lpToken:    SwapPools.SwapPoolToken,
		deadline:   BigNumber,
		amount:     BigNumber
		minAmounts: BigNumber[],
	}): Promise<ContractTransaction> {
		return TokenSwap.removeLiquidity({...args, chainId, signer: getSigner(ethereum)})
	}

	return [fn]
}

export function useRemoveLiquidityOneToken(ethereum: any, chainId: number) {
	const [getSigner] = useSignerFromEthereumFn();

	async function fn(args: {
		lpToken:    SwapPools.SwapPoolToken,
		deadline:   BigNumber,
		amount:     BigNumber
		minAmount:  BigNumber,
		token:		Token
	}): Promise<ContractTransaction> {
		return TokenSwap.removeLiquidityOneToken({...args, chainId, signer: getSigner(ethereum)})
	}

	return [fn]
}

export function useCalculateSwapRate(ethereum: any, chainId: number) {
	async function fn(args: {
		tokenFrom: Token;
		tokenTo:   Token;
		amountIn:  BigNumber;
	}): Promise<BigNumber> {
		return TokenSwap.calculateSwapRate({...args, chainId})
			.then(res => res.amountOut)
	}

	return [fn]
}

export function useApproveLPToken(ethereum: any, chainId: number) {
	const [getSigner] = useSignerFromEthereumFn();

	async function fn(args: {
		lpToken: SwapPools.SwapPoolToken,
		amount?: BigNumber
	}): Promise<ContractTransaction> {
		const {
			lpToken: {
				swapAddress: spender,
				baseToken:   token
			}
		} = args;

		return Tokens.approveTokenSpend({...args, spender, token, chainId, signer: getSigner(ethereum)})
	}

	return [fn]
}