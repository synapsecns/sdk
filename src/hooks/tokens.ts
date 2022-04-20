import type {Token} from "@token";
import {Tokens} from "@tokens";

import {useSignerFromEthereumFn} from "./signer";

import {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import {ContractTransaction} from "@ethersproject/contracts";

function bignumFromBignumberish(n: BigNumberish, token: Token, chainId: number): BigNumber {
	return n instanceof BigNumber
		? n as BigNumber
		: token.etherToWei(n, chainId)
}


export function useApproveTokenSpend(ethereum: any, chainId: number) {
	const [getSigner] = useSignerFromEthereumFn();

	async function fn(args: {
		token:   Token,
		spender: string,
		amount?: BigNumber
	}): Promise<ContractTransaction> {
		const amt = args.amount
			? bignumFromBignumberish(args.amount, args.token, chainId)
			: undefined

		return Tokens.approveTokenSpend({
			...args,
			amount: amt,
			chainId,
			signer: getSigner(ethereum)
		})
	}

	return [fn]
}