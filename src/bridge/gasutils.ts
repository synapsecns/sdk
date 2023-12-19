import {ChainId, type ChainIdTypeMap} from "@chainid";

import {GasOptions, populateGasOptions} from "@common/gasoptions";

import {parseUnits} from "@ethersproject/units";
import {BigNumber}  from "@ethersproject/bignumber";

import type {PopulatedTransaction} from "@ethersproject/contracts";

export namespace GasUtils {
    type GasParams = {
        maxFeePerGas?:    BigNumber;
        maxPriorityFee?:  BigNumber;
        gasPrice?:        BigNumber;
        bridgeGasLimit?:  BigNumber;
        approveGasLimit?: BigNumber;
    }

    const makeGwei = (n: string): BigNumber => parseUnits(n, "gwei")

    const CHAIN_GAS_PARAMS: ChainIdTypeMap<GasParams> = {
        [ChainId.ETH]: {
            maxFeePerGas:    makeGwei("80"),
            maxPriorityFee:  makeGwei("1.5"),
            bridgeGasLimit:  BigNumber.from(301000),
            approveGasLimit: BigNumber.from(75000),
        },
        [ChainId.OPTIMISM]: {
            bridgeGasLimit:  BigNumber.from(250000),
            approveGasLimit: BigNumber.from(90000),
        },
        [ChainId.BSC]: {
            gasPrice:        makeGwei("6"),
            bridgeGasLimit:  BigNumber.from(260000),
            approveGasLimit: BigNumber.from(75000)
        },
        [ChainId.POLYGON]: {
            maxFeePerGas:     makeGwei("32.01"),
            maxPriorityFee:   makeGwei("32"),
            bridgeGasLimit:   BigNumber.from(1000000),
            approveGasLimit:  BigNumber.from(86000)
        },
        [ChainId.BOBA]: {
            gasPrice:        makeGwei("10"),
            approveGasLimit: BigNumber.from(60000),
        },
        [ChainId.ARBITRUM]: {
            gasPrice:       makeGwei("1.5"),
            bridgeGasLimit: BigNumber.from(1500000),
        },
        [ChainId.AVALANCHE]: {
            maxFeePerGas: makeGwei("2000"),
            maxPriorityFee:  makeGwei("30"),
            bridgeGasLimit:  BigNumber.from(700000),
            approveGasLimit: BigNumber.from(75000),
        },
        [ChainId.AURORA]: {
            gasPrice: makeGwei('1'),
        },
        [ChainId.HARMONY]: {
            gasPrice:        makeGwei("115"),
            bridgeGasLimit:  BigNumber.from(250000),
            approveGasLimit: BigNumber.from(75000)
        }
    }

    /* c8 ignore next 8 */
    export function approveLimit(chainId: number): BigNumber | null {
        if (chainId in CHAIN_GAS_PARAMS) {
            const gasParams = CHAIN_GAS_PARAMS[chainId];
            return gasParams.approveGasLimit ?? null
        }

        return null
    }

    /* c8 ignore next 8 */
    export function bridgeGasLimit(chainId: number): BigNumber | null {
        if (chainId in CHAIN_GAS_PARAMS) {
            const gasParams = CHAIN_GAS_PARAMS[chainId]
            return gasParams.bridgeGasLimit ?? null
        }

        return null
    }

    export const makeGasParams = (chainId: number): GasParams => CHAIN_GAS_PARAMS[chainId] ?? {};

    export const populateGasParams = (
        chainId:      number,
        txn:          PopulatedTransaction|Promise<PopulatedTransaction>,
        gasLimitKind: "bridge" | "approve"
    ): Promise<PopulatedTransaction> =>
        Promise.resolve(txn)
            .then((tx: PopulatedTransaction): PopulatedTransaction => {
                let {
                    maxFeePerGas,
                    maxPriorityFee,
                    gasPrice,
                    approveGasLimit,
                    bridgeGasLimit
                } = makeGasParams(chainId);

                tx.chainId = chainId;

                let gasOpts: GasOptions = {};

                if (gasPrice) {
                    gasOpts.gasPrice = gasPrice;
                } else if (maxFeePerGas) {
                    gasOpts.maxFeePerGas = maxFeePerGas;
                    if (maxPriorityFee) {
                        gasOpts.maxPriorityFeePerGas = maxPriorityFee;
                    }
                }

                switch (gasLimitKind) {
                    case "bridge":
                        if (bridgeGasLimit) gasOpts.gasLimit = bridgeGasLimit;
                        break;
                    case "approve":
                        if (approveGasLimit) gasOpts.gasLimit = approveGasLimit;
                        break;
                }

                return populateGasOptions(tx, gasOpts, chainId)
            })
}