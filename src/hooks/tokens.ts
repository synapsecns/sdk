import type {Token} from "@token";
import {Tokens} from "@tokens";

import {useWeb3Signer} from "./signer";

import {useWeb3React} from "@web3-react/core";

import {BigNumber} from "@ethersproject/bignumber";
import {ContractTransaction} from "@ethersproject/contracts";

export function useApproveTokenSpend() {
	const {chainId} = useWeb3React();
	const [signer] = useWeb3Signer();

	async function fn(args: {
		token:   Token,
		spender: string,
		amount?: BigNumber
	}): Promise<ContractTransaction> {

		return Tokens.approveTokenSpend({...args, signer, chainId})
	}

	return [fn]
}