import type {Token} from "@token";
import {Tokens} from "@tokens";

import {useSignerFromEthereum, useSignerFromEthereumFn} from "./signer";

import {BigNumber} from "@ethersproject/bignumber";
import {ContractTransaction} from "@ethersproject/contracts";

export function useApproveTokenSpend(ethereum: any, chainId: number) {
	const [getSigner] = useSignerFromEthereumFn();

	async function fn(args: {
		token:   Token,
		spender: string,
		amount?: BigNumber
	}): Promise<ContractTransaction> {

		return Tokens.approveTokenSpend({...args, chainId, signer: getSigner(ethereum)})
	}

	return [fn]
}