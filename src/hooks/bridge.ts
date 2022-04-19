import type {Token} from "@token";
import {Bridge} from "@bridge/bridge";

import {useWeb3Signer} from "./signer";

import {useEffect, useState} from "react";
import {useWeb3React} from "@web3-react/core";

import {BigNumber} from "@ethersproject/bignumber";
import {ContractTransaction} from "@ethersproject/contracts";

export function useSynapseBridge() {
	const {chainId} = useWeb3React();

	let [synapseBridge, setSynapseBridge] = useState<Bridge.SynapseBridge>(null);

	function setNewBridge(cid: number) {
		let newBridge = new Bridge.SynapseBridge({network: cid});
		setSynapseBridge(newBridge);
	}

	useEffect(() => {
		if (typeof chainId !== 'undefined' && chainId !== null) {
			if (synapseBridge !== null) {
				if (synapseBridge.chainId !== chainId) {
					setNewBridge(chainId)
				}
			} else {
				setNewBridge(chainId)
			}
		}
	}, [chainId]);

	return [synapseBridge]
}

export function useApproveBridgeSwap() {
	const [signer] = useWeb3Signer();
	let [synapseBridge] = useSynapseBridge();

	async function fn(args: {
		token:   Token,
		amount?: BigNumber
	}): Promise<ContractTransaction> {
		return synapseBridge.executeApproveTransaction(args, signer)
	}

	return [fn]
}

export function useExecuteBridgeSwap() {
	const [signer] = useWeb3Signer();
	let [synapseBridge] = useSynapseBridge();

	async function fn(args: {
		tokenFrom:  Token,
		tokenTo:    Token,
		amountFrom: BigNumber,
		amountTo:   BigNumber,
		chainIdTo:  number,
		addressTo?: string
	}): Promise<ContractTransaction> {
		return synapseBridge.executeBridgeTokenTransaction(args, signer)
	}

	return [fn]
}

export function useCalculateBridgeSwapOutput() {
	const [signer] = useWeb3Signer();
	let [synapseBridge] = useSynapseBridge();

	async function fn(args: {
		tokenFrom:  Token,
		tokenTo:    Token,
		amountFrom: BigNumber,
		chainIdTo:  number
	}): Promise<Bridge.BridgeOutputEstimate> {
		return synapseBridge.estimateBridgeTokenOutput(args)
	}

	return [fn]
}