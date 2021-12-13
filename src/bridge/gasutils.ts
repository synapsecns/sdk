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

    const ETH_GAS_PARAMS: GasParams = {
        maxPriorityFee: parseUnits("1.5", "gwei"),
        bridgeGasLimit: BigNumber.from(100000)
    };

    const BOBA_GAS_PARAMS: GasParams = {
        gasPrice:        parseUnits("10", "gwei"),
        approveGasLimit: BigNumber.from(60000),
    };

    const ARBITRUM_GAS_PARAMS: GasParams = {
        gasPrice:       parseUnits("2.5", "gwei"),
        bridgeGasLimit: BigNumber.from(1500000),
    };

    const AVALANCHE_GAS_PARAMS: GasParams = {
        gasPrice:        parseUnits("150", "gwei"),
        bridgeGasLimit:  BigNumber.from(800000),
        approveGasLimit: BigNumber.from(75000),
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
        }

        return {}
    }
}