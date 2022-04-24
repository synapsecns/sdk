import {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import type {PopulatedTransaction} from "@ethersproject/contracts";

import {chainSupportsEIP1559} from "@chainid";
import {parseUnits} from "@ethersproject/units";

/**
 * This interface allows for passing custom options for transaction gas fees.
 * Note: all values must be passed as GWei.
 *
 * @see {@link https://eips.ethereum.org/EIPS/eip-1559|EIP-1559} for more information regarding EIP-1559.
 *
 * @param {BigNumber} gasPrice For chains which don't support EIP-1559,
 * `gasPrice` controls the price in GWei per unit of gas used by a transaction.
 * @param {BigNumber} gasLimit Maximum number of gas units a transaction is allowed to use.
 * @param {BigNumber} maxFeePerGas For chains which do support EIP-1559,
 * `maxFeePerGas` controls the maximum fee in GWei which a sender is willing to pay per unit of gas used by a transaction.
 * @param {BigNumber} maxPriorityFeePerGas For chains which do support EIP-1559,
 * `maxPriorityFeePerGas` controls the fee in GWei which a sender is willing to pay block miners or validators to have their
 * transaction included in an upcoming block. Defaults to 1.5 GWei.
 */
export interface GasOptions {
	gasPrice?:             BigNumber;
	gasLimit?:             BigNumber;
	maxFeePerGas?:         BigNumber;
	maxPriorityFeePerGas?: BigNumber;
}

/**
 * This interface partially implements the Overrides interface which can be passed to
 * Ethers.js Transaction functions.
 *
 * @param {BigNumberish | Promise<BigNumberish>} gasPrice For chains which don't support EIP-1559,
 * `gasPrice` controls the price in GWei per unit of gas used by a transaction.
 * @param {BigNumberish | Promise<BigNumberish>} gasLimit Maximum number of gas units a transaction is allowed to use.
 * @param {BigNumberish | Promise<BigNumberish>} maxFeePerGas For chains which do support EIP-1559,
 * `maxFeePerGas` controls the maximum fee in GWei which a sender is willing to pay per unit of gas used by a transaction.
 * @param {BigNumberish | Promise<BigNumberish>} maxPriorityFeePerGas For chains which do support EIP-1559,
 * `maxPriorityFeePerGas` controls the fee in GWei which a sender is willing to pay block miners or validators to have their
 * transaction included in an upcoming block. Defaults to 1.5 GWei.
 */
export interface TransactionGasOverrides {
	gasLimit?:             BigNumberish | Promise<BigNumberish>;
	gasPrice?:             BigNumberish | Promise<BigNumberish>;
	maxFeePerGas?:         BigNumberish | Promise<BigNumberish>;
	maxPriorityFeePerGas?: BigNumberish | Promise<BigNumberish>;
}

export function makeGwei(n: string): BigNumber { return parseUnits(n, "gwei") }

/**
 * populateGasOptions adds gas limit, fee, and/or price options as provided in the `gasOptions` parameter to a built,
 * but as of yet unsent {@link PopulatedTransaction} object.
 *
 * @param {PopulatedTransaction} txn Ethers.js {@link PopulatedTransaction} object to add gas params to.
 * @param {GasOptions} gasOptions Gas limit/fee/price options for {@link PopulatedTransaction} objects.
 * @param {number} chainId Chain ID of the network which `txn` will be sent on, used for determining EIP-1559 support.
 * @param {boolean} ignoreLimit Optional. If set to `true`, the `gasLimit` field of `gasOptions` is entirely ignored.
 *
 * @return {PopulatedTransaction} Transaction object as passed as a param, but with any of `gasPrice`, `gasLimit`,
 * `maxFeePerGas`, and `maxPriorityFeePerGas` respectively set to values provided in `gasOptions`.
 */
export function populateGasOptions(
	txn: 		 PopulatedTransaction,
	gasOptions:  GasOptions,
	chainId:     number,
	ignoreLimit: boolean = false
): PopulatedTransaction {
	if (chainSupportsEIP1559(chainId)) {
		if (gasOptions?.gasPrice) {
			txn.gasPrice = gasOptions.gasPrice;
		}
	} else {
		if (gasOptions?.maxFeePerGas) {
			txn.maxFeePerGas = gasOptions.maxFeePerGas;
		}

		if (gasOptions?.maxPriorityFeePerGas) {
			txn.maxPriorityFeePerGas = gasOptions.maxPriorityFeePerGas;
		}
	}

	if (!ignoreLimit) {
		if (gasOptions?.gasLimit) {
			txn.gasLimit = gasOptions.gasLimit;
		}
	}

	return txn
}

/* c8 ignore start */
export function makeTransactionGasOverrides(
	gasOptions:  GasOptions,
	chainId:     number,
	ignoreLimit: boolean = false
): TransactionGasOverrides {
	let overrides: TransactionGasOverrides = {};

	if (chainSupportsEIP1559(chainId)) {
		if (gasOptions?.gasPrice) {
			overrides.gasPrice = gasOptions.gasPrice;
		}
	} else {
		if (gasOptions?.maxFeePerGas) {
			overrides.maxFeePerGas = gasOptions.maxFeePerGas;
		}

		if (gasOptions?.maxPriorityFeePerGas) {
			overrides.maxPriorityFeePerGas = gasOptions.maxPriorityFeePerGas;
		}
	}

	if (!ignoreLimit) {
		if (gasOptions?.gasLimit) {
			overrides.gasLimit = gasOptions.gasLimit;
		}
	}

	return overrides
}
/* c8 ignore stop */