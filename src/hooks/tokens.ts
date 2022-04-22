import type {Token} from "@token";
import {Tokens} from "@tokens";

import {ERC20, MAX_APPROVAL_AMOUNT} from "@bridge/erc20";

import {useSignerFromEthereum} from "./signer";
import {logError, parseApproveAmount} from "./helpers";
import {
	AllowanceError,
	TransactionError
} from "./errors";
import {ApproveTokenState} from "./types";

import {useEffect, useState} from "react";
import {BigNumber, type BigNumberish} from "@ethersproject/bignumber";
import type {ContractTransaction} from "@ethersproject/contracts";

const TX_STATUS_SUCCESS: number = 1;

function useCheckAllowance(ethereum: any, chainId: number) {
	const [getSigner] = useSignerFromEthereum();

	const [allowance, setAllowance] = useState<BigNumber>(null);

	function fn(args: {
		token: 	 Token,
		spender: string
	}) {
		getSigner(ethereum).getAddress()
			.then(ownerAddress => {
				const {token, spender} = args;
				const tokenArgs = {tokenAddress: token.address(chainId), chainId};
				ERC20.allowanceOf(ownerAddress, spender, tokenArgs)
					.then(setAllowance)
					.catch(e => {
						const err = e instanceof Error ? e : new Error(e);
						const allowanceErr = new AllowanceError(
							ownerAddress,
							spender,
							token,
							"exception thrown from ERC20.allowanceOf()",
							err
						);
						console.error(allowanceErr);
						console.error(allowanceErr.cause);
					})
			})
	}

	return [fn, allowance] as const
}

function useApproveTokenSpend(ethereum: any, chainId: number) {
	const [getSigner] = useSignerFromEthereum();

	const [tx, setTx] = useState<ContractTransaction>(null);

	function fn(args: {
		token:   Token,
		spender: string,
		amount?: BigNumberish
	}) {
		Tokens.approveTokenSpend({
			...args,
			amount: parseApproveAmount(args.amount, args.token, chainId),
			chainId,
			signer: getSigner(ethereum)
		})
			.then(setTx)
			.catch(logError)
	}

	return [fn, tx] as const
}

function useApproveStatus(ethereum: any, chainId: number) {
	const [approveComplete, setApproveComplete] = useState<boolean>(false);
	const [approveState, setApproveState] = useState<ApproveTokenState>(null);

	function fn(args: {
		token:      Token,
		spender:    string,
		amount?:    BigNumberish,
		approveTx:  ContractTransaction
	}) {
		if (approveComplete) {
			return
		}

		const {
			token,
			spender,
			amount,
			approveTx
		} = args;


		const wantAmt: BigNumber = amount ? parseApproveAmount(amount, token, chainId) : MAX_APPROVAL_AMOUNT;
		if (!approveTx) {
			return
		}

		const txHash = approveTx.hash;
		const confirmations = approveTx.confirmations;

		if (confirmations >= 1) {
			setApproveState({
				token,
				spender,
				amount: wantAmt
			});

			return
		}

		approveTx.wait(1)
			.then(txResult => {
				const {status: txStatus} = txResult;
				if (txStatus) {
					if (txStatus !== TX_STATUS_SUCCESS) {
						const txErr = new TransactionError(txHash, "reverted");
						console.error(txErr);
						return
					}
				}

				setApproveState({
					token,
					spender,
					amount: wantAmt
				});
			})
			.catch(e => {
				const err = e instanceof Error ? e : new Error(e);
				const txErr = new TransactionError(txHash, "exception thrown from .wait(1)", err);
				console.error(txErr);
				console.error(txErr.cause)
			})
	}

	const [checkAllowance, allowance] = useCheckAllowance(ethereum, chainId);
	const [checkFired, setCheckFired] = useState<boolean>(false);

	useEffect(() => {
		if (!checkFired && approveState) {
			checkAllowance(approveState);
			setCheckFired(true);
		}
	}, [checkFired, approveState])

	useEffect(() => {
		if (allowance && approveState) {
			let checkAmt: BigNumber = BigNumber.from(approveState.amount);

			if (MAX_APPROVAL_AMOUNT.eq(approveState.amount)) {
				checkAmt = MAX_APPROVAL_AMOUNT.sub(5);
			}

			if (allowance.gte(checkAmt)) {
				setApproveComplete(true);
			}
		}
	}, [allowance, approveState]);

	return [fn, approveComplete, allowance] as const
}

export {
	TransactionError,
	AllowanceError,
	useApproveTokenSpend,
	useApproveStatus,
	useCheckAllowance
}