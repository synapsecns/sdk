import {isArray} from "lodash-es";

import type {Token} from "@token";
import {SwapPools} from "@swappools";
import {TokenSwap} from "@tokenswap";

import {useSignerFromEthereum} from "./signer";
import {
	useApproveStatus,
	useApproveTokenSpend,
	useCheckAllowance
} from "./tokens";

import {
	logError,
	parseBigNumberish,
	parseLPTokenBigNumberishArray
} from "./helpers";

import type {ApproveTokenState} from "./types";

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
function useChainStableswapLPToken(ethereum: any, chainId: number) {
	const [lpToken, setLpToken] = useState<SwapPools.SwapPoolToken>(null);

	useEffect(() => {
		if (typeof chainId !== 'undefined' && chainId !== null) {
			setLpToken(SwapPools.stableswapPoolForNetwork(chainId));
		}
	}, [chainId]);

	return [lpToken] as const
}

/**
 * Returns the ETHSwap LP token object for a given Chain ID, if one exists.
 *
 * @param ethereum
 * @param chainId
 *
 * @return Single-item array containing LP token object
 */
function useChainETHSwapLPToken(ethereum: any, chainId: number) {
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

	return [lpToken] as const
}

function useHarmonyJewelLPToken() {
	return [SwapPools.HARMONY_JEWEL_SWAP_TOKEN] as const
}

function useHarmonyAVAXLPToken() {
	return [SwapPools.HARMONY_AVAX_SWAP_TOKEN] as const
}

function useCalculateAddLiquidity(args: {
	ethereum: any,
	chainId:  number,
	lpToken:  SwapPools.SwapPoolToken,
	amounts:  BigNumberish[] | SwapPools.PoolTokensAmountsMap
}) {
	const {ethereum, chainId, ...rest} = args;

	const [amount, setAmount] = useState<BigNumber>(null);

	function fn() {
		const {amounts, lpToken} = rest;

		let amountsArray: BigNumber[];
		if (isArray(amounts)) {
			const amts = amounts as BigNumberish[];
			amountsArray = parseLPTokenBigNumberishArray(lpToken, amts, chainId);
		} else {
			amountsArray = lpToken.liquidityAmountsFromMap(amounts as SwapPools.PoolTokensAmountsMap);
		}

		TokenSwap.calculateAddLiquidity({
			...rest,
			amounts: amountsArray,
			chainId
		})
			.then(setAmount)
			.catch(logError)
	}

	return [fn, amount] as const
}

function useCalculateRemoveLiquidity(args: {
	ethereum: any,
	chainId:  number,
	lpToken:  SwapPools.SwapPoolToken,
	amount:   BigNumberish
}) {
	const {ethereum, chainId, ...rest} = args;

	const [amounts, setAmounts] = useState<BigNumber[]>(null);

	function fn() {
		const {
			amount,
			lpToken: {baseToken}
		} = rest

		TokenSwap.calculateRemoveLiquidity({
			...rest,
			amount: parseBigNumberish(amount, baseToken, chainId),
			chainId
		})
			.then(setAmounts)
			.catch(logError)
	}

	return [fn, amounts] as const
}

function useCalculateRemoveLiquidityOneToken(args: {
	ethereum: any,
	chainId:  number,
	lpToken:  SwapPools.SwapPoolToken,
	token:    Token,
	amount:   BigNumberish
}) {
	const {ethereum, chainId, ...rest} = args;

	const [amount, setAmount] = useState<BigNumber>(null);

	function fn() {
		TokenSwap.calculateRemoveLiquidityOneToken({
			...rest,
			amount: parseBigNumberish(rest.amount, rest.token, chainId),
			chainId
		})
			.then(setAmount)
			.catch(logError)
	}

	return [fn, amount] as const
}

function useAddLiquidity(args: {
	ethereum:  any,
	chainId:   number,
	lpToken:   SwapPools.SwapPoolToken,
	deadline:  BigNumberish,
	amounts:   BigNumberish[] | SwapPools.PoolTokensAmountsMap,
	minToMint: BigNumberish
}) {
	const {ethereum, chainId, ...rest} = args;

	const [getSigner] = useSignerFromEthereum();

	const [tx, setTx] = useState<ContractTransaction>(null);

	function fn() {
		const {amounts, lpToken} = rest;

		let amountsArray: BigNumber[];
		if (isArray(amounts)) {
			const amts = amounts as BigNumberish[];
			amountsArray = parseLPTokenBigNumberishArray(lpToken, amts, chainId);
		} else {
			amountsArray = lpToken.liquidityAmountsFromMap(amounts as SwapPools.PoolTokensAmountsMap);
		}

		TokenSwap.addLiquidity({
			...rest,
			chainId,
			signer:     getSigner(ethereum),
			amounts:    amountsArray,
			deadline:   BigNumber.from(rest.deadline),
			minToMint:  parseBigNumberish(rest.minToMint, rest.lpToken.baseToken, chainId),
		})
			.then(setTx)
			.catch(logError)
	}

	return [fn, tx] as const
}

function useRemoveLiquidity(args: {
	ethereum:   any,
	chainId:    number,
	lpToken:    SwapPools.SwapPoolToken,
	deadline:   BigNumberish,
	amount:     BigNumberish
	minAmounts: BigNumberish[] | SwapPools.PoolTokensAmountsMap,
}) {
	const {ethereum, chainId, ...rest} = args;

	const [getSigner] = useSignerFromEthereum();

	const [tx, setTx] = useState<ContractTransaction>(null);

	function fn() {
		const {minAmounts, lpToken} = rest;

		let minAmountsArray: BigNumber[];
		if (isArray(minAmounts)) {
			const amts = minAmounts as BigNumberish[];
			minAmountsArray = parseLPTokenBigNumberishArray(lpToken, amts, chainId);
		} else {
			minAmountsArray = lpToken.liquidityAmountsFromMap(minAmounts as SwapPools.PoolTokensAmountsMap);
		}

		TokenSwap.removeLiquidity({
			...rest,
			chainId,
			minAmounts: minAmountsArray,
			signer:     getSigner(ethereum),
			amount:     parseBigNumberish(rest.amount, rest.lpToken.baseToken, chainId),
			deadline:   BigNumber.from(rest.deadline),
		})
			.then(setTx)
			.catch(logError)
	}

	return [fn, tx] as const
}

function useRemoveLiquidityOneToken(args: {
	ethereum:  any,
	chainId:   number,
	lpToken:   SwapPools.SwapPoolToken,
	deadline:  BigNumberish,
	amount:    BigNumberish
	minAmount: BigNumberish,
	token:     Token
}) {
	const {ethereum, chainId, ...rest} = args;

	const [getSigner] = useSignerFromEthereum();

	const [tx, setTx] = useState<ContractTransaction>(null);

	function fn() {
		TokenSwap.removeLiquidityOneToken({
			...rest,
			chainId,
			signer:    getSigner(ethereum),
			amount:    parseBigNumberish(rest.amount, rest.token, chainId),
			minAmount: parseBigNumberish(rest.minAmount, rest.lpToken.baseToken, chainId),
			deadline:  BigNumber.from(rest.deadline),
		})
			.then(setTx)
			.catch(logError)
	}

	return [fn, tx] as const
}

function useCalculateSwapRate(args: {
	ethereum:  any,
	chainId:   number,
	tokenFrom: Token,
	tokenTo:   Token,
	amountIn:  BigNumberish
}) {
	const {ethereum, chainId, ...rest} = args;

	const [swapRate, setSwapRate] = useState<BigNumber>(null);

	function fn() {
		TokenSwap.calculateSwapRate({
			...rest,
			chainId,
			amountIn: parseBigNumberish(rest.amountIn, rest.tokenFrom, chainId),
		})
			.then(res => setSwapRate(res.amountOut))
			.catch(logError)
	}

	return [fn, swapRate] as const
}

function useSwapTokens(args: {
	ethereum:     any,
	chainId:      number,
	tokenFrom:    Token,
	tokenTo:   	  Token,
	amountIn:  	  BigNumberish,
	minAmountOut: BigNumberish,
	deadline?:    number
}) {
	const {ethereum, chainId, ...rest} = args;

	const [getSigner] = useSignerFromEthereum();

	const [tx, setTx] = useState<ContractTransaction>(null);

	function fn() {
		const fnParams = {
			...rest,
			chainId,
			signer:       getSigner(ethereum),
			amountIn:     parseBigNumberish(rest.amountIn, rest.tokenFrom, chainId),
			minAmountOut: parseBigNumberish(rest.minAmountOut, rest.tokenTo, chainId),
		};

		TokenSwap.swapTokens(fnParams)
			.then(setTx)
			.catch(logError)
	}

	return [fn, tx] as const
}

function useApproveLPToken(args: {
	ethereum: any,
	chainId:  number,
	lpToken:  SwapPools.SwapPoolToken,
	amount?:  BigNumberish
}) {
	const {ethereum, chainId, ...rest} = args;

	const
		[approveSpend,       approveTx] 	= useApproveTokenSpend(ethereum, chainId),
		[queryApproveStatus, approveStatus] = useApproveStatus(ethereum, chainId);

	const [approveData, setApproveData] = useState<ApproveTokenState>(null);

	function fn() {
		const {
			amount,
			lpToken: {
				swapAddress: spender,
				baseToken:   token
			},
		} = rest;

		approveSpend({token, spender});
		setApproveData({token, spender, amount});
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

	return [fn, approveTx, approveStatus] as const
}

function useApprovePoolToken(args: {
	ethereum: any,
	chainId:  number,
	lpToken:  SwapPools.SwapPoolToken,
	token:    Token,
	amount?:  BigNumberish
}) {
	const {ethereum, chainId, ...rest} = args;

	const
		[approveSpend,       approveTx]     = useApproveTokenSpend(ethereum, chainId),
		[queryApproveStatus, approveStatus] = useApproveStatus(ethereum, chainId);

	const [approveData, setApproveData] = useState<ApproveTokenState>(null);

	function fn() {
		const {
			amount,
			token,
			lpToken: {swapAddress: spender},
		} = rest;

		approveSpend({token, spender});
		setApproveData({token, spender, amount});
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

function useLPTokenAllowance(args: {
	ethereum: any,
	chainId: number,
	lpToken: SwapPools.SwapPoolToken
}) {
	const {ethereum, chainId, lpToken} = args;

	const [checkAllowance, allowance] = useCheckAllowance(ethereum, chainId);

	useEffect(() => {
		if (lpToken) {
			const {
				baseToken:   token,
				swapAddress: spender
			} = lpToken;

			checkAllowance({token, spender});
		}
	}, [chainId, lpToken])

	return [allowance] as const
}

function useLPTokenNeedsApproval(args: {
	ethereum: any,
	chainId: number,
	lpToken: SwapPools.SwapPoolToken,
	amount:  BigNumberish
}) {
	const {
		chainId,
		amount,
		lpToken
	} = args;

	const [allowance] = useLPTokenAllowance(args);

	const [needsApprove, setNeedsApprove] = useState<boolean>(null);

	useEffect(() => {
		if (allowance && amount && lpToken) {
			const {baseToken: token} = lpToken;
			const amt = parseBigNumberish(amount, token, chainId);
			setNeedsApprove(allowance.lt(amt));
		}
	}, [allowance, chainId, lpToken, amount]);

	return [needsApprove, allowance] as const
}

function useLPTokenApproval(args: {
	ethereum: any,
	chainId: number,
	lpToken: SwapPools.SwapPoolToken,
	amount:  BigNumberish
}) {
	const [needsApprove, allowance] = useLPTokenNeedsApproval(args)
	const [execApprove, approveTx, approveStatus] = useApproveLPToken({...args, amount: undefined});

	return {
		needsApprove,
		allowance,
		execApprove,
		approveTx,
		approveStatus
	} as const
}

function usePoolTokenAllowance(args: {
	ethereum: any,
	chainId: number,
	lpToken: SwapPools.SwapPoolToken,
	token: Token
}) {
	const {ethereum, chainId, lpToken, token} = args;

	const [checkAllowance, allowance] = useCheckAllowance(ethereum, chainId);

	useEffect(() => {
		if (lpToken) {
			const {swapAddress: spender} = lpToken;
			checkAllowance({token, spender});
		}
	}, [chainId, token, lpToken])

	return [allowance] as const
}

function usePoolTokenNeedsApproval(args: {
	ethereum: any,
	chainId:  number,
	lpToken:  SwapPools.SwapPoolToken,
	token:    Token,
	amount:   BigNumberish
}) {
	const {chainId, token, amount} = args;

	const [allowance] = usePoolTokenAllowance(args);

	const [needsApprove, setNeedsApprove] = useState<boolean>(null);

	useEffect(() => {
		if (allowance && amount) {
			const amt = parseBigNumberish(amount, token, chainId);
			setNeedsApprove(allowance.lt(amt));
		}
	}, [allowance, chainId, token, amount]);

	return [needsApprove, allowance] as const
}

function usePoolTokenApproval(args: {
	ethereum: any,
	chainId:  number,
	lpToken:  SwapPools.SwapPoolToken,
	token:    Token,
	amount:   BigNumberish
}) {
	const [needsApprove, allowance] = usePoolTokenNeedsApproval(args)
	const [execApprove, approveTx, approveStatus] = useApprovePoolToken({...args, amount: undefined});

	return {
		needsApprove,
		allowance,
		execApprove,
		approveTx,
		approveStatus
	} as const
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
	useApprovePoolToken,
	useLPTokenAllowance,
	useLPTokenNeedsApproval,
	useLPTokenApproval,
	usePoolTokenAllowance,
	usePoolTokenNeedsApproval,
	usePoolTokenApproval
}