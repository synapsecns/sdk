import type {Token} from "@token";
import {Bridge} from "@bridge/bridge";

import {useSignerFromEthereum} from "./signer";
import {
	logError,
	parseBigNumberish
} from "./helpers";
import {
	useApproveStatus,
	useCheckAllowance
} from "./tokens";

import type {
	ActionHook,
	ApproveActionHook,
	ContractTransactionHook,
	AllowanceHook,
	NeedsApprovalHook,
	ApproveTokenState
} from "./types";

import {BigNumber, type BigNumberish} from "@ethersproject/bignumber";
import type {ContractTransaction} from "@ethersproject/contracts";

import {useEffect, useState} from "react";
import {UseApproveHook} from "./types";


function useCalculateBridgeSwapOutput(args: {
	ethereum:   any,
	chainId:    number,
	tokenFrom:  Token,
	tokenTo:    Token,
	amountFrom: BigNumberish,
	chainIdTo:  number
}): ActionHook<Bridge.BridgeOutputEstimate> {
	const {ethereum, chainId, ...rest} = args;

	const [result, setResult] = useState<Bridge.BridgeOutputEstimate>(null);

	function fn() {
		const fnArgs = {
			...rest,
			amountFrom: parseBigNumberish(rest.amountFrom, rest.tokenFrom, chainId),
		};

		const synapseBridge = new Bridge.SynapseBridge({network: chainId});
		synapseBridge.estimateBridgeTokenOutput(fnArgs)
			.then(setResult)
			.catch(logError)
	}

	return [fn, result]
}

function useExecuteBridgeSwap(args: {
	ethereum:   any,
	chainId:    number,
	tokenFrom:  Token,
	tokenTo:    Token,
	amountFrom: BigNumberish,
	amountTo:   BigNumberish,
	chainIdTo:  number,
	addressTo?: string
}): ContractTransactionHook {
	const {ethereum, chainId, ...rest} = args;
	const [getSigner] = useSignerFromEthereum();
	const [tx, setTx] = useState<ContractTransaction>(null);

	function fn() {
		const fnArgs = {
			...rest,
			amountFrom: parseBigNumberish(rest.amountFrom, rest.tokenFrom, chainId),
			amountTo:   parseBigNumberish(rest.amountTo,   rest.tokenTo,   rest.chainIdTo)
		};

		const synapseBridge = new Bridge.SynapseBridge({network: chainId});
		synapseBridge.executeBridgeTokenTransaction(fnArgs, getSigner(ethereum))
			.then(setTx)
			.catch(logError)
	}

	return [fn, tx]
}

function useApproveBridgeSwap(args: {
	ethereum: any,
	chainId:  number,
	token:    Token,
	amount?:  BigNumberish
}): ApproveActionHook {
	const {ethereum, chainId, ...rest} = args;

	const [getSigner] = useSignerFromEthereum();

	const [queryApproveStatus, approvalStatus] = useApproveStatus(ethereum, chainId);

	const
		[approveTx,   setApproveTx]   = useState<ContractTransaction>(null),
		[approveData, setApproveData] = useState<ApproveTokenState>(null);

	const amt = rest.amount
		? parseBigNumberish(rest.amount, rest.token, chainId)
		: undefined

	const fnArgs = {
		...rest,
		amount: amt
	};

	function fn() {
		const synapseBridge = new Bridge.SynapseBridge({network: chainId});

		const [{spender}] = synapseBridge.buildERC20ApproveArgs(fnArgs);

		synapseBridge.executeApproveTransaction(fnArgs, getSigner(ethereum))
			.then(res => {
				setApproveTx(res);
				setApproveData({
					...fnArgs,
					spender
				});
			})
			.catch(logError)
	}

	useEffect(() => {
		if (approvalStatus !== null) {
			return
		}

		if ((approveTx && approveData)) {
			const {token, spender, amount} = approveData;
			queryApproveStatus({
				token,
				spender,
				amount,
				approveTx
			});
		}
	}, [approveTx, approveData, approvalStatus]);

	return [fn, approveTx, approvalStatus]
}

function useBridgeAllowance(args: {
	ethereum: any,
	chainId:  number,
	token:    Token,
}): AllowanceHook {
	const {ethereum, chainId, token} = args;

	const [checkAllowance, allowance] = useCheckAllowance(ethereum, chainId);

	useEffect(() => {
		const synapseBridge = new Bridge.SynapseBridge({network: chainId});
		const [{spender}] = synapseBridge.buildERC20ApproveArgs({token});

		checkAllowance({token, spender});
	}, [chainId, token])

	return [allowance]
}

function useNeedsBridgeSwapApproval(args: {
	ethereum: any,
	chainId:  number,
	token:    Token,
	amount:   BigNumberish
}): NeedsApprovalHook {
	const {chainId, token, amount} = args;

	const amt = parseBigNumberish(amount, token, chainId);

	const [allowance] = useBridgeAllowance(args);

	const [needsApprove, setNeedsApprove] = useState<boolean>(null);

	useEffect(() => {
		if (allowance) {
			setNeedsApprove(allowance.lt(amt));
		}
	}, [allowance, chainId, token, amount]);

	return [needsApprove, allowance]
}

function useBridgeSwapApproval(args: {
	ethereum: any,
	chainId:  number,
	token:    Token,
	amount:   BigNumberish
}): UseApproveHook {
	const [needsApprove, allowance] = useNeedsBridgeSwapApproval(args)
	const [execApprove, approveTx, approveStatus] = useApproveBridgeSwap({...args, amount: undefined});

	return {
		needsApprove,
		allowance,
		execApprove,
		approveTx,
		approveStatus
	} as const
}

export {
	useApproveBridgeSwap,
	useExecuteBridgeSwap,
	useCalculateBridgeSwapOutput,
	useBridgeAllowance,
	useNeedsBridgeSwapApproval,
	useBridgeSwapApproval
}