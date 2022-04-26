import type {Token} from "@token";
import type {SwapPoolToken} from "@swappools";

import {
	BigNumber,
	type BigNumberish
} from "@ethersproject/bignumber";


export function parseBigNumberish(n: BigNumberish, token: Token, chainId: number): BigNumber {
	return n instanceof BigNumber
		? n as BigNumber
		: token.etherToWei(n, chainId)
}

export function parseLPTokenBigNumberishArray(
	lpToken: SwapPoolToken,
	amounts: BigNumberish[],
	chainId: number
): BigNumber[] {
	const poolTokens = lpToken.poolTokens;

	return amounts.map((n, idx) =>
		parseBigNumberish(n, poolTokens[idx], chainId)
	)
}

export function parseApproveAmount(amount: BigNumberish, token: Token, chainId: number): BigNumber | undefined {
	return amount
		? parseBigNumberish(amount, token, chainId)
		: undefined
}

export function logError(e: any) {
	const err = e instanceof Error ? e : new Error(e);
	console.error(err);
}