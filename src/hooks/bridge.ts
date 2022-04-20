import type {Token} from "@token";
import {Bridge} from "@bridge/bridge";

import {useSignerFromEthereumFn} from "./signer";

import {BigNumber} from "@ethersproject/bignumber";
import {ContractTransaction} from "@ethersproject/contracts";

function useApproveBridgeSwap(ethereum: any, chainId: number) {
	const [getSigner] = useSignerFromEthereumFn();

	const fn = async (args: {
		token:   Token,
		amount?: BigNumber
	}): Promise<ContractTransaction> => {
		const synapseBridge = new Bridge.SynapseBridge({network: chainId});
		return synapseBridge.executeApproveTransaction(args, getSigner(ethereum))
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
		const synapseBridge = new Bridge.SynapseBridge({network: chainId});
		return synapseBridge.executeBridgeTokenTransaction(args, getSigner(ethereum))
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
		const synapseBridge = new Bridge.SynapseBridge({network: chainId});
		return synapseBridge.estimateBridgeTokenOutput(args)
	}

	return [fn]
}

export {
	useApproveBridgeSwap,
	useExecuteBridgeSwap,
	useCalculateBridgeSwapOutput
}