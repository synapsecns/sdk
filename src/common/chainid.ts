import {BigNumber, BigNumberish} from "@ethersproject/bignumber";

export namespace ChainId {
    export const ETH:       number = 1;
    export const OPTIMISM:  number = 10;
    export const BSC:       number = 56;
    export const POLYGON:   number = 137;
    export const FANTOM:    number = 250;
    export const BOBA:      number = 288;
    export const MOONRIVER: number = 1285;
    export const ARBITRUM:  number = 42161;
    export const AVALANCHE: number = 43114;
    export const AURORA:    number = 1313161554;
    export const HARMONY:   number = 1666600000;

    export const asBigNumber = (n: BigNumberish): BigNumber => {
        return BigNumber.from(n)
    }

    export const asNumber = (n: BigNumberish): number => {
        return BigNumber.from(n).toNumber()
    }

    export const supportedChainIds = (): number[] => [
        ETH,       OPTIMISM,  BSC,
        POLYGON,   FANTOM,    BOBA,
        MOONRIVER, ARBITRUM,  AVALANCHE,
        AURORA,    HARMONY,
    ]
}

export const supportedChainIds = ChainId.supportedChainIds;