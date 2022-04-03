import {ChainId, type ChainIdTypeMap} from "@chainid";

export namespace SynapseContracts {

    interface SynapseContractArgs {
        bridge:     string;
        bridgeZap?: string;
    }

    export class SynapseContract {
        readonly bridgeAddress:      string;
        readonly bridgeZapAddress?:  string;

        constructor({
            bridge,
            bridgeZap=null,
        }: SynapseContractArgs) {

            this.bridgeAddress = bridge;

            if (bridgeZap) {
                this.bridgeZapAddress = bridgeZap;
            }
        }
    }

    export const Ethereum = new SynapseContract({
        bridge:    "0x2796317b0fF8538F253012862c06787Adfb8cEb6",
        bridgeZap: "0x6571d6be3d8460CF5F7d6711Cd9961860029D85F",
    });

    export const Optimism = new SynapseContract({
        bridge:    "0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b",
        bridgeZap: "0x9CD619c50562a38edBdC3451ade7B58CaA71Ab32",
    });

    export const Cronos = new SynapseContract({
        bridge:    "0xE27BFf97CE92C3e1Ff7AA9f86781FDd6D48F5eE9",
        bridgeZap: "0x88E7af57270F70BCF32CD61fff0Ff635775C8f7c",
    });

    export const BSC = new SynapseContract({
        bridge:    "0xd123f70AE324d34A9E76b67a27bf77593bA8749f",
        bridgeZap: "0x749F37Df06A99D6A8E065dd065f8cF947ca23697",
    });

    export const Polygon = new SynapseContract({
        bridge:    "0x8F5BBB2BB8c2Ee94639E55d5F41de9b4839C1280",
        bridgeZap: "0x1c6aE197fF4BF7BA96c66C5FD64Cb22450aF9cC8",
    });

    export const Fantom = new SynapseContract({
        bridge:    "0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b",
        bridgeZap: "0xB003e75f7E0B5365e814302192E99b4EE08c0DEd",
    });

    export const Boba = new SynapseContract({
        bridge:    "0x432036208d2717394d2614d6697c46DF3Ed69540",
        bridgeZap: "0x64B4097bCCD27D49BC2A081984C39C3EeC427a2d",
    });

    export const Metis = new SynapseContract({
        bridge:    "0x06Fea8513FF03a0d3f61324da709D4cf06F42A5c",
        bridgeZap: "0x6571D58b3BF2469DF5878e213453E28dC1A4DA81",
    });

    export const Moonbeam = new SynapseContract(({
        bridge:    "0x84A420459cd31C3c34583F67E0f0fB191067D32f",
        bridgeZap: "0xadA10A7474f4c71A829b55D2cB4232C281383fd5",
    }));

    export const Moonriver = new SynapseContract(({
        bridge:    "0xaeD5b25BE1c3163c907a471082640450F928DDFE",
        bridgeZap: "0xfA28DdB74b08B2b6430f5F61A1Dd5104268CC29e",
    }));

    export const Arbitrum = new SynapseContract({
        bridge:    "0x6F4e8eBa4D337f874Ab57478AcC2Cb5BACdc19c9",
        bridgeZap: "0x37f9aE2e0Ea6742b9CAD5AbCfB6bBC3475b3862B",
    });

    export const Avalanche = new SynapseContract({
        bridge:    "0xC05e61d0E7a63D27546389B7aD62FdFf5A91aACE",
        bridgeZap: "0xE85429C97589AD793Ca11A8BC3477C03d27ED140",
    });

    export const DFK = new SynapseContract({
        bridge:    "0xE05c976d3f045D0E6E7A6f61083d98A15603cF6A",
        bridgeZap: "0x75224b0f245Fe51d5bf47A898DbB6720D4150BA7",
    });

    export const Aurora = new SynapseContract({
        bridge:    "0xaeD5b25BE1c3163c907a471082640450F928DDFE",
        bridgeZap: "0x2D8Ee8d6951cB4Eecfe4a79eb9C2F973C02596Ed",
    });

    export const Harmony = new SynapseContract({
        bridge:    "0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b",
        bridgeZap: "0x4F4f66964335D7bef23C16a62Fcd3d1E89f02959",
    });

    const chainIdContractsMap: ChainIdTypeMap<SynapseContract> = {
        [ChainId.ETH]:       Ethereum,
        [ChainId.OPTIMISM]:  Optimism,
        [ChainId.CRONOS]:    Cronos,
        [ChainId.BSC]:       BSC,
        [ChainId.POLYGON]:   Polygon,
        [ChainId.FANTOM]:    Fantom,
        [ChainId.BOBA]:      Boba,
        [ChainId.METIS]:     Metis,
        [ChainId.MOONBEAM]:  Moonbeam,
        [ChainId.MOONRIVER]: Moonriver,
        [ChainId.ARBITRUM]:  Arbitrum,
        [ChainId.AVALANCHE]: Avalanche,
        [ChainId.DFK]:       DFK,
        [ChainId.AURORA]:    Aurora,
        [ChainId.HARMONY]:   Harmony,
    }

    export function contractsForChainId(chainId: number): SynapseContract {
        return chainIdContractsMap[chainId]
    }
}