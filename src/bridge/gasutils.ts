import {ChainId} from "../common";
import {parseUnits} from "@ethersproject/units";
import {BigNumber} from "@ethersproject/bignumber";

export namespace GasUtils {
    export interface GasParams {
        maxPriorityFee?:  BigNumber,
        gasPrice?:        BigNumber,
        bridgeGasLimit?:  BigNumber,
        approveGasLimit?: BigNumber,
    }

    const makeGwei = (n: string): BigNumber => parseUnits(n, "gwei")

    const ETH_GAS_PARAMS: GasParams = {
        maxPriorityFee: makeGwei("1.5"),
        bridgeGasLimit: BigNumber.from(100000)
    };

    const BOBA_GAS_PARAMS: GasParams = {
        gasPrice:        makeGwei("10"),
        approveGasLimit: BigNumber.from(60000),
    };

    const ARBITRUM_GAS_PARAMS: GasParams = {
        gasPrice:       makeGwei("2.5"),
        bridgeGasLimit: BigNumber.from(1500000),
    };

    const AVALANCHE_GAS_PARAMS: GasParams = {
        gasPrice:        makeGwei("150"),
        bridgeGasLimit:  BigNumber.from(800000),
        approveGasLimit: BigNumber.from(75000),
    }

    const AURORA_GAS_PARAMS: GasParams = {
        gasPrice: makeGwei('0'),
    }

    export function makeGasParams(chainId: number): GasParams {
        switch (chainId) {
            case ChainId.ETH:
                return ETH_GAS_PARAMS
            case ChainId.BOBA:
                return BOBA_GAS_PARAMS
            case ChainId.ARBITRUM:
                return ARBITRUM_GAS_PARAMS
            case ChainId.AVALANCHE:
                return AVALANCHE_GAS_PARAMS
            case ChainId.AURORA:
                return AURORA_GAS_PARAMS
        }

        return {}
    }
}