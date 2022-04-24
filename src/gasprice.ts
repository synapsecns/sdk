import {
	first,
	last,
	sortBy,
	sortedUniqBy
} from "lodash-es";

import {rpcProviderForChain} from "@internal/rpcproviders";

import {BigNumber} from "@ethersproject/bignumber";
import {formatUnits} from "@ethersproject/units";
import {chainSupportsEIP1559} from "@chainid";
import {TransactionResponse} from "@ethersproject/providers";

export type ChainGasPrices = {
	min:  BigNumber;
	avg:  BigNumber;
	max:  BigNumber;
	last: BigNumber;
}

/**
 * Returns the minimum, average, and maximum gas prices from the most recently mined block
 * on a given Chain, as well as the result of eth_getGasPrice.
 * @param chainId
 */
export function fetchChainGasPrices(chainId: number): Promise<ChainGasPrices> {
	const
		supports1559 = chainSupportsEIP1559(chainId),
		provider = rpcProviderForChain(chainId),
		lastPriceProm = provider.getGasPrice();

	return provider.getBlockWithTransactions('latest')
		.then(({transactions}) => lastPriceProm.then(lastPrice => {
			const gasPrices: BigNumber[] = extractGasPrices(transactions, supports1559);

			let sum: BigNumber = BigNumber.from(0);
			gasPrices.forEach(n => sum = sum.add(n));

			return {
				min:  first(gasPrices),
				avg:  sum.div(gasPrices.length),
				max:  last(gasPrices),
				last: lastPrice,
			}
		}))
}

function extractGasPrices(txns: TransactionResponse[], supports1559: boolean): BigNumber[] {
	let gasPrices: BigNumber[] = txns
		.map(txn => supports1559 ? txn.maxFeePerGas : txn.gasPrice)
		.filter(val => typeof val !== 'undefined' && val !== null && !val.isZero());

	return sortBy(gasPrices, [gweiSortFn]);
}

function gweiSortFn(n: BigNumber): number {
	return gweiToFloat(toGwei(n))
}

function toGwei(n: BigNumber): string {
	return formatUnits(n, "gwei")
}

function gweiToFloat(gwei: string): number {
	return parseFloat(gwei)
}