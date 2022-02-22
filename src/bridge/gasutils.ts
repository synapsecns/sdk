import {ChainId} from "../common/chainid";
import type {ChainIdTypeMap} from "../common/types";

import {parseUnits} from "@ethersproject/units";
import {BigNumber} from "@ethersproject/bignumber";

import type {PopulatedTransaction} from "@ethersproject/contracts";

export namespace GasUtils {
    export interface GasParams {
        maxPriorityFee?:  BigNumber,
        gasPrice?:        BigNumber,
        bridgeGasLimit?:  BigNumber,
        approveGasLimit?: BigNumber,
    }

    const makeGwei = (n: string): BigNumber => parseUnits(n, "gwei")

    const CHAIN_GAS_PARAMS: ChainIdTypeMap<GasParams> = {
        [ChainId.ETH]: {
            maxPriorityFee: makeGwei("1.5"),
            bridgeGasLimit: BigNumber.from(100000)
        },
        [ChainId.BOBA]: {
            gasPrice:        makeGwei("10"),
            approveGasLimit: BigNumber.from(60000),
        },
        [ChainId.ARBITRUM]: {
            gasPrice:       makeGwei("2.5"),
            bridgeGasLimit: BigNumber.from(1500000),
        },
        [ChainId.AVALANCHE]: {
            gasPrice:        makeGwei("150"),
            bridgeGasLimit:  BigNumber.from(800000),
            approveGasLimit: BigNumber.from(75000),
        },
        [ChainId.AURORA]: {
            gasPrice: makeGwei('1'),
        },
    }

    export function makeGasParams(chainId: number): GasParams {
        return CHAIN_GAS_PARAMS[chainId] ?? {};
    }

    export function populateGasParams(chainId: number, txn: PopulatedTransaction|Promise<PopulatedTransaction>, gasLimitKind: string): Promise<PopulatedTransaction> {
        return Promise.resolve(txn)
            .then((tx: PopulatedTransaction): PopulatedTransaction => {
                let {maxPriorityFee, gasPrice, approveGasLimit, bridgeGasLimit} = makeGasParams(chainId);

                if (gasPrice)        tx.gasPrice             = gasPrice;
                if (maxPriorityFee)  tx.maxPriorityFeePerGas = maxPriorityFee;

                switch (gasLimitKind) {
                    case "bridge":
                        if (bridgeGasLimit) tx.gasLimit = bridgeGasLimit;
                        break;
                    case "approve":
                        if (approveGasLimit) tx.gasLimit = approveGasLimit;
                        break;
                }


                return tx
            })
    }
}