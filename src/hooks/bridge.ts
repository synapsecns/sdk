import type {Token} from "@token";
import {Bridge} from "@bridge/bridge";

import {useSignerFromEthereumFn} from "./signer";

import {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import {ContractTransaction} from "@ethersproject/contracts";

function bignumFromBignumberish(n: BigNumberish, token: Token, chainId: number): BigNumber {
	return n instanceof BigNumber
		? n as BigNumber
		: token.etherToWei(n, chainId)
}

function useApproveBridgeSwap(ethereum: any, chainId: number) {
	const [getSigner] = useSignerFromEthereumFn();

	const fn = async (args: {
		token:   Token,
		amount?: BigNumber
	}): Promise<ContractTransaction> => {
		const amt = args.amount
			? bignumFromBignumberish(args.amount, args.token, chainId)
			: undefined

		const fnArgs = {
			...args,
			amount: amt
		};

		const synapseBridge = new Bridge.SynapseBridge({network: chainId});
		return synapseBridge.executeApproveTransaction(fnArgs, getSigner(ethereum))
	}

	return [fn]
}

function useExecuteBridgeSwap(ethereum: any, chainId: number) {
	const [getSigner] = useSignerFromEthereumFn();

	const fn = async (args: {
		tokenFrom:  Token,
		tokenTo:    Token,
		amountFrom: BigNumber,
		amountTo:   BigNumber,
		chainIdTo:  number,
		addressTo?: string
	}): Promise<ContractTransaction> => {
		const fnArgs = {
			...args,
			amountFrom: bignumFromBignumberish(args.amountFrom, args.tokenFrom, chainId),
			amountTo:   bignumFromBignumberish(args.amountTo,   args.tokenTo,   args.chainIdTo)
		};

		const synapseBridge = new Bridge.SynapseBridge({network: chainId});
		return synapseBridge.executeBridgeTokenTransaction(fnArgs, getSigner(ethereum))
	}

	return [fn]
}

function useCalculateBridgeSwapOutput(ethereum: any, chainId: number) {

	const fn = async(args: {
		tokenFrom:  Token,
		tokenTo:    Token,
		amountFrom: BigNumber,
		chainIdTo:  number
	}): Promise<Bridge.BridgeOutputEstimate> => {
		const fnArgs = {
			...args,
			amountFrom: bignumFromBignumberish(args.amountFrom, args.tokenFrom, chainId),
		};

		const synapseBridge = new Bridge.SynapseBridge({network: chainId});
		return synapseBridge.estimateBridgeTokenOutput(fnArgs)
	}

	return [fn]
}

export {
	useApproveBridgeSwap,
	useExecuteBridgeSwap,
	useCalculateBridgeSwapOutput
}