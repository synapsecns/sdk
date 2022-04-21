import type {Token} from "@token";
import {Tokens} from "@tokens";

import {ERC20, MAX_APPROVAL_AMOUNT} from "@bridge/erc20";

import {parseApproveAmount} from "./helpers";
import {useSignerFromEthereumFn} from "./signer";

import type {
	ApproveTokenSpendHook,
	ApproveStatusHook
} from "./types";

import {useState} from "react";
import type {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import type {ContractTransaction} from "@ethersproject/contracts";


const
	TX_STATUS_REVERTED: number = 0,
	TX_STATUS_SUCCESS:  number = 1;

class TransactionError extends Error {
	constructor(txHash: string, message: string, cause?: Error) {
		super(message)
		this.name = this.constructor.name;
		this.message = `Error in transaction ${txHash}: ${message}`;

		if (cause) {
			this.cause = cause;
		}
	}
}

class AllowanceError extends Error {
	constructor(owner: string, spender: string, token: Token, message: string, cause?: Error) {
		super(message)
		this.name = this.constructor.name;
		this.message = `Error querying spend allowance of ${spender} for ${owner} token ${token.name}`;

		if (cause) {
			this.cause = cause;
		}
	}
}

function useApproveTokenSpend(ethereum: any, chainId: number): ApproveTokenSpendHook {
	const [getSigner] = useSignerFromEthereumFn();

	const [tx, setTx] = useState<ContractTransaction>(null);

	async function fn(args: {
		token:   Token,
		spender: string,
		amount?: BigNumberish
	}) {
		try {
			const res = await Tokens.approveTokenSpend({
				...args,
				amount: parseApproveAmount(args.amount, args.token, chainId),
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

function useApproveStatus(ethereum: any, chainId: number): ApproveStatusHook {
	const [getSigner] = useSignerFromEthereumFn();

	const
		[allowance, setAllowance] = useState<BigNumber>(null),
		[approveComplete, setApproveComplete] = useState<boolean>(false);

	async function fn(args: {
		token:      Token,
		spender:    string,
		amount?:    BigNumberish,
		approveTx:  ContractTransaction
	}) {
		const {
			token,
			spender,
			amount,
			approveTx
		} = args;

		const signer = getSigner(ethereum);
		const txHash = approveTx.hash;

		const wantAmt: BigNumber = amount ? parseApproveAmount(amount, token, chainId) : MAX_APPROVAL_AMOUNT;
		const ownerAddress: string = await signer.getAddress();

		try {
			const txResult = await approveTx.wait(1);
			if (txResult.status !== TX_STATUS_SUCCESS) {
				const txErr = new TransactionError(txHash, "reverted");
				console.error(txErr);
				return
			}
		} catch (e) {
			const err = e instanceof Error ? e : new Error(e);
			const txErr = new TransactionError(txHash, "exception thrown from .wait(1)", err);
			console.error(txErr);
		}

		try {
			const allowanceRes = await ERC20.allowanceOf(
				ownerAddress,
				spender,
				{tokenAddress: token.address(chainId), chainId}
			);

			setAllowance(allowanceRes);

			let checkAmt: BigNumber = wantAmt;

			if (wantAmt.eq(MAX_APPROVAL_AMOUNT)) {
				checkAmt = MAX_APPROVAL_AMOUNT.sub(5);
			}

			if (allowance.gte(checkAmt)) {
				setApproveComplete(true);
			}
		} catch (e) {
			const err = e instanceof Error ? e : new Error(e);
			const allowanceErr = new AllowanceError(
				ownerAddress,
				spender,
				token,
				"exception thrown from ERC20.allowanceOf()",
				err
			);
			console.error(allowanceErr);
		}
	}

	return [fn, approveComplete, allowance]
}

export {
	TransactionError,
	AllowanceError,
	useApproveTokenSpend,
	useApproveStatus
}