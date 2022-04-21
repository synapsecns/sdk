import type {Token} from "@token";
import {Bridge} from "@bridge/bridge";

import {parseBigNumberish} 		 from "./helpers";
import {useSignerFromEthereumFn} from "./signer";
import {
	useApproveStatus,
	useCheckAllowance
} from "./tokens";

import type {
	ApproveTokenState,
	CalculateBridgeSwapOutputHook,
	ExecuteBridgeSwapHook,
	ApproveBridgeSwapHook,
	BridgeAllowanceHook
} from "./types";

import type {BigNumberish} from "@ethersproject/bignumber";
import type {ContractTransaction} from "@ethersproject/contracts";

import {useEffect, useState} from "react";


function useCalculateBridgeSwapOutput(ethereum: any, chainId: number): CalculateBridgeSwapOutputHook {
	const [result, setResult] = useState<Bridge.BridgeOutputEstimate>(null);

	async function fn (args: {
		tokenFrom:  Token,
		tokenTo:    Token,
		amountFrom: BigNumberish,
		chainIdTo:  number
	}) {
		const fnArgs = {
			...args,
			amountFrom: parseBigNumberish(args.amountFrom, args.tokenFrom, chainId),
		};

		try {
			const synapseBridge = new Bridge.SynapseBridge({network: chainId});
			const res = await synapseBridge.estimateBridgeTokenOutput(fnArgs);

			setResult(res);
		} catch (e) {
			const err = e instanceof Error ? e : new Error(e);
			console.error(err);
		}

	}

	return [fn, result]
}

function useExecuteBridgeSwap(ethereum: any, chainId: number): ExecuteBridgeSwapHook {
	const [getSigner] = useSignerFromEthereumFn();
	const [tx, setTx] = useState<ContractTransaction>(null);

	async function fn(args: {
		tokenFrom:  Token,
		tokenTo:    Token,
		amountFrom: BigNumberish,
		amountTo:   BigNumberish,
		chainIdTo:  number,
		addressTo?: string
	}) {
		const fnArgs = {
			...args,
			amountFrom: parseBigNumberish(args.amountFrom, args.tokenFrom, chainId),
			amountTo:   parseBigNumberish(args.amountTo,   args.tokenTo,   args.chainIdTo)
		};

		try {
			const synapseBridge = new Bridge.SynapseBridge({network: chainId});
			const res = await synapseBridge.executeBridgeTokenTransaction(fnArgs, getSigner(ethereum));

			setTx(res);
		} catch (e) {
			const err = e instanceof Error ? e : new Error(e);
			console.error(err);
		}
	}

	return [fn, tx]
}

function useApproveBridgeSwap(ethereum: any, chainId: number): ApproveBridgeSwapHook {
	const [getSigner] = useSignerFromEthereumFn();

	const [queryApproveStatus, approvelStatus] = useApproveStatus(ethereum, chainId);

	const
		[approveTx,   setApproveTx]   = useState<ContractTransaction>(null),
		[approveData, setApproveData] = useState<ApproveTokenState>(null);

	async function fn(args: {
		token:   Token,
		amount?: BigNumberish
	}) {
		const amt = args.amount
			? parseBigNumberish(args.amount, args.token, chainId)
			: undefined

		const fnArgs = {
			...args,
			amount: amt
		};

		try {
			const synapseBridge = new Bridge.SynapseBridge({network: chainId});

			const [{spender}] = synapseBridge.buildERC20ApproveArgs(fnArgs);

			const res = await synapseBridge.executeApproveTransaction(fnArgs, getSigner(ethereum));

			setApproveTx(res);
			setApproveData({
				...fnArgs,
				spender
			});
		} catch (e) {
			const err = e instanceof Error ? e : new Error(e);
			console.error(err);
		}
	}

	useEffect(() => {
		if (approveTx && approveData && !approvelStatus) {
			const {token, spender, amount} = approveData;
			queryApproveStatus({
				token,
				spender,
				amount,
				approveTx
			});
		}
	}, [approveTx, approveData, approvelStatus]);

	return [fn, approveTx, approvelStatus]
}

function useBridgeAllowance(ethereum: any, chainId: number): BridgeAllowanceHook {
	const [checkAllowance, allowance] = useCheckAllowance(ethereum, chainId);

	async function fn(token: Token) {
		const synapseBridge = new Bridge.SynapseBridge({network: chainId});
		const [{spender}] = synapseBridge.buildERC20ApproveArgs({token});

		try {
			await checkAllowance({token, spender})
		} catch (e) {
			const err = e instanceof Error ? e : new Error(e);
			console.error(err)
		}
	}

	return [fn, allowance]
}

export {
	useApproveBridgeSwap,
	useExecuteBridgeSwap,
	useCalculateBridgeSwapOutput,
	useBridgeAllowance
}