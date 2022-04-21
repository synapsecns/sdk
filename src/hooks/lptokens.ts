import {isArray} from "lodash-es";

import type {Token} from "@token";
import {SwapPools} from "@swappools";
import {TokenSwap} from "@tokenswap";

import {useSignerFromEthereumFn} from "./signer";
import {useApproveStatus, useApproveTokenSpend} from "./tokens";

import {
	parseBigNumberish,
	parseLPTokenBigNumberishArray
} from "./helpers";

import type {
	ApproveTokenState,
	LPTokenHook,
	CalculateAddLiquidityHook,
	CalculateRemoveLiquidityHook,
	CalculateRemoveLiquidityOneTokenHook,
	AddLiquidityHook,
	RemoveLiquidityHook,
	RemoveLiquidityOneTokenHook,
	CalculateSwapRateHook,
	SwapTokensHook,
	ApproveLPTokenHook,
	ApproveTokenForLPHook
} from "./types";

import {useEffect, useState} from "react";

import {
	BigNumber,
	type BigNumberish
} from "@ethersproject/bignumber";
import type {ContractTransaction} from "@ethersproject/contracts";


/**
 * Returns the Stableswap LP token object for a given Chain ID, if one exists.
 *
 * @param ethereum
 * @param chainId
 *
 * @return Single-item array containing LP token object
 */
function useChainStableswapLPToken(ethereum: any, chainId: number): LPTokenHook {
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

/**
 * Returns the ETHSwap LP token object for a given Chain ID, if one exists.
 *
 * @param ethereum
 * @param chainId
 *
 * @return Single-item array containing LP token object
 */
function useChainETHSwapLPToken(ethereum: any, chainId: number): LPTokenHook {
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

function useHarmonyJewelLPToken(ethereum: any, chainId: number): LPTokenHook {
	return [SwapPools.HARMONY_JEWEL_SWAP_TOKEN]
}

function useHarmonyAVAXLPToken(ethereum: any, chainId: number): LPTokenHook {
	return [SwapPools.HARMONY_AVAX_SWAP_TOKEN]
}

function useCalculateAddLiquidity(ethereum: any, chainId: number): CalculateAddLiquidityHook {
	const [amount, setAmount] = useState<BigNumber>(null);

	async function fn(args: {
		lpToken: SwapPools.SwapPoolToken,
		amounts: BigNumberish[] | SwapPools.PoolTokensAmountsMap
	}) {
		let amountsArray: BigNumber[];
		if (isArray(args.amounts)) {
			const amts = args.amounts as BigNumberish[];
			amountsArray = parseLPTokenBigNumberishArray(args.lpToken, amts, chainId);
		} else {
			amountsArray = args.lpToken.liquidityAmountsFromMap(args.amounts as SwapPools.PoolTokensAmountsMap);
		}

		try {
			const res = await TokenSwap.calculateAddLiquidity({
				...args,
				amounts: amountsArray,
				chainId
			});

			setAmount(res);
		} catch (e) {
			const err = e instanceof Error ? e : new Error(e);
			console.error(err);
		}
	}

	return [fn, amount]
}

function useCalculateRemoveLiquidity(ethereum: any, chainId: number): CalculateRemoveLiquidityHook {
	const [amounts, setAmounts] = useState<BigNumber[]>(null);

	async function fn(args: {
		lpToken: SwapPools.SwapPoolToken,
		amount:  BigNumberish
	}) {
		try {
			const res = await TokenSwap.calculateRemoveLiquidity({
				...args,
				amount: parseBigNumberish(args.amount, args.lpToken.baseToken, chainId),
				chainId
			});

			setAmounts(res);
		} catch (e) {
			const err = e instanceof Error ? e : new Error(e);
			console.error(err);
		}
		return
	}

	return [fn, amounts]
}

function useCalculateRemoveLiquidityOneToken(ethereum: any, chainId: number): CalculateRemoveLiquidityOneTokenHook {
	const [amount, setAmount] = useState<BigNumber>(null);

	async function fn(args: {
		lpToken: SwapPools.SwapPoolToken,
		token:   Token,
		amount:  BigNumberish
	}) {
		try {
			const res = await TokenSwap.calculateRemoveLiquidityOneToken({
				...args,
				amount: parseBigNumberish(args.amount, args.token, chainId),
				chainId
			});

			setAmount(res);
		} catch (e) {
			const err = e instanceof Error ? e : new Error(e);
			console.error(err);
		}
	}

	return [fn, amount]
}

function useAddLiquidity(ethereum: any, chainId: number): AddLiquidityHook {
	const [getSigner] = useSignerFromEthereumFn();

	const [tx, setTx] = useState<ContractTransaction>(null);

	async function fn(args: {
		lpToken:   SwapPools.SwapPoolToken,
		deadline:  BigNumberish,
		amounts:   BigNumberish[] | SwapPools.PoolTokensAmountsMap,
		minToMint: BigNumberish
	}) {
		let amountsArray: BigNumber[];
		if (isArray(args.amounts)) {
			const amts = args.amounts as BigNumberish[];
			amountsArray = parseLPTokenBigNumberishArray(args.lpToken, amts, chainId);
		} else {
			amountsArray = args.lpToken.liquidityAmountsFromMap(args.amounts as SwapPools.PoolTokensAmountsMap);
		}

		try {
			const res = await TokenSwap.addLiquidity({
				...args,
				deadline:   BigNumber.from(args.deadline),
				amounts:    amountsArray,
				minToMint:  parseBigNumberish(args.minToMint, args.lpToken.baseToken, chainId),
				chainId,
				signer: getSigner(ethereum)
			});

			setTx(res);
		} catch (e) {
			const err = e instanceof Error ? e : new Error(e);
			console.error(err);
		}
	}

	return [fn, tx]
}

function useRemoveLiquidity(ethereum: any, chainId: number): RemoveLiquidityHook {
	const [getSigner] = useSignerFromEthereumFn();

	const [tx, setTx] = useState<ContractTransaction>(null);

	async function fn(args: {
		lpToken:    SwapPools.SwapPoolToken,
		deadline:   BigNumberish,
		amount:     BigNumberish
		minAmounts: BigNumberish[] | SwapPools.PoolTokensAmountsMap,
	}) {
		let minAmountsArray: BigNumber[];
		if (isArray(args.minAmounts)) {
			const amts = args.minAmounts as BigNumberish[];
			minAmountsArray = parseLPTokenBigNumberishArray(args.lpToken, amts, chainId);
		} else {
			minAmountsArray = args.lpToken.liquidityAmountsFromMap(args.minAmounts as SwapPools.PoolTokensAmountsMap);
		}

		try {
			const res = await TokenSwap.removeLiquidity({
				...args,
				deadline:   BigNumber.from(args.deadline),
				amount:     parseBigNumberish(args.amount, args.lpToken.baseToken, chainId),
				minAmounts: minAmountsArray,
				chainId,
				signer: getSigner(ethereum)
			});

			setTx(res);
		} catch (e) {
			const err = e instanceof Error ? e : new Error(e);
			console.error(err);
		}
	}

	return [fn, tx]
}

function useRemoveLiquidityOneToken(ethereum: any, chainId: number): RemoveLiquidityOneTokenHook {
	const [getSigner] = useSignerFromEthereumFn();

	const [tx, setTx] = useState<ContractTransaction>(null);

	async function fn(args: {
		lpToken:    SwapPools.SwapPoolToken,
		deadline:   BigNumberish,
		amount:     BigNumberish
		minAmount:  BigNumberish,
		token:		Token
	}) {
		try {
			const res = await TokenSwap.removeLiquidityOneToken({
				...args,
				deadline:  BigNumber.from(args.deadline),
				amount:    parseBigNumberish(args.amount, args.token, chainId),
				minAmount: parseBigNumberish(args.minAmount, args.lpToken.baseToken, chainId),
				chainId,
				signer: getSigner(ethereum)
			});

			setTx(res);
		} catch (e) {
			const err = e instanceof Error ? e : new Error(e);
			console.error(err);
		}
	}

	return [fn, tx]
}

function useCalculateSwapRate(ethereum: any, chainId: number): CalculateSwapRateHook {
	const [swapRate, setSwapRate] = useState<BigNumber>(null);

	async function fn(args: {
		tokenFrom: Token,
		tokenTo:   Token,
		amountIn:  BigNumberish
	}) {
		try {
			const res = await TokenSwap.calculateSwapRate({
				...args,
				amountIn: parseBigNumberish(args.amountIn, args.tokenFrom, chainId),
				chainId
			});

			setSwapRate(res.amountOut);
		} catch (e) {
			const err = e instanceof Error ? e : new Error(e);
			console.error(err);
		}

	}

	return [fn, swapRate]
}

function useSwapTokens(ethereum: any, chainId: number): SwapTokensHook{
	const [getSigner] = useSignerFromEthereumFn();

	const [tx, setTx] = useState<ContractTransaction>(null);

	async function fn(args: {
		tokenFrom:    Token,
		tokenTo:   	  Token,
		amountIn:  	  BigNumberish,
		minAmountOut: BigNumberish,
		deadline?:    number
	}) {
		const fnParams = {
			...args,
			amountIn:     parseBigNumberish(args.amountIn, args.tokenFrom, chainId),
			minAmountOut: parseBigNumberish(args.minAmountOut, args.tokenTo, chainId),
			chainId,
			signer: getSigner(ethereum)
		};

		try {
			const swapTx = await TokenSwap.swapTokens(fnParams);
			setTx(swapTx);
		} catch (e) {
			const err = e instanceof Error ? e : new Error(e);
			console.error(err);
		}
	}

	return [fn, tx]
}

function useApproveLPToken(ethereum: any, chainId: number): ApproveLPTokenHook {
	const
		[approveSpend,       approveTx] 	= useApproveTokenSpend(ethereum, chainId),
		[queryApproveStatus, approveStatus] = useApproveStatus(ethereum, chainId);

	const [approveData, setApproveData] = useState<ApproveTokenState>(null);

	async function fn(args: {
		lpToken: SwapPools.SwapPoolToken,
		amount?: BigNumberish
	}) {
		const {
			amount,
			lpToken: {
				swapAddress: spender,
				baseToken:   token
			},
		} = args;

		try {
			await approveSpend({
				token,
				spender,
				amount
			});

			setApproveData({token, spender, amount});
		} catch (e) {
			const err = e instanceof Error ? e : new Error(e);
			console.error(err);
		}
	}

	useEffect(() => {
		if (approveTx && approveData && !approveStatus) {
			const {token, spender, amount} = approveData;
			queryApproveStatus({
				token,
				spender,
				amount,
				approveTx
			});
		}
	}, [approveTx, approveData, approveStatus]);

	return [fn, approveTx, approveStatus]
}

function useApproveTokenForLP(ethereum: any, chainId: number): ApproveTokenForLPHook {
	const
		[approveSpend,       approveTx]     = useApproveTokenSpend(ethereum, chainId),
		[queryApproveStatus, approveStatus] = useApproveStatus(ethereum, chainId);

	const [approveData, setApproveData] = useState<ApproveTokenState>(null);

	async function fn(args: {
		lpToken: SwapPools.SwapPoolToken,
		token:   Token,
		amount?: BigNumberish
	}) {
		const {
			amount,
			token,
			lpToken: {swapAddress: spender},
		} = args;

		try {
			await approveSpend({
				token,
				spender,
				amount
			});

			setApproveData({token, spender, amount});
		} catch (e) {
			const err = e instanceof Error ? e : new Error(e);
			console.error(err);
		}
	}

	useEffect(() => {
		if (approveTx && approveData && !approveStatus) {
			const {token, spender, amount} = approveData;
			queryApproveStatus({
				token,
				spender,
				amount,
				approveTx
			});
		}
	}, [approveTx, approveData, approveStatus]);

	return [fn, approveTx, approveStatus]
}

export {
	useChainStableswapLPToken,
	useChainETHSwapLPToken,
	useHarmonyJewelLPToken,
	useHarmonyAVAXLPToken,
	useCalculateAddLiquidity,
	useCalculateRemoveLiquidity,
	useCalculateRemoveLiquidityOneToken,
	useAddLiquidity,
	useRemoveLiquidity,
	useRemoveLiquidityOneToken,
	useCalculateSwapRate,
	useSwapTokens,
	useApproveLPToken,
	useApproveTokenForLP
}