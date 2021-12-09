import {ABIs} from "../abis";
import {ContractInterface} from "@ethersproject/contracts";


export namespace SynapseContracts {
    interface abiAndAddress {
        address: string,
        abi:     ContractInterface,
    }

    export class SynapseContract {
        readonly bridge:      abiAndAddress;
        readonly bridge_zap:  abiAndAddress;

        constructor(args: {
            bridge:         string,
            bridge_zap:     string,
            isEthMainnet?:  boolean
        }) {
            let { bridge, bridge_zap, isEthMainnet=false } = args;

            this.bridge     = { address: bridge, abi: ABIs.SynapseBridge };
            this.bridge_zap = {
                address: bridge_zap,
                abi: isEthMainnet ? ABIs.NerveBridgeZap : ABIs.L2BridgeZap,
            };
        }
    }

    export const Ethereum = new SynapseContract({
        bridge:       "0x2796317b0fF8538F253012862c06787Adfb8cEb6",
        bridge_zap:   "0xa2569370A9D4841c9a62Fc51269110F2eB7E0171",
        isEthMainnet: true,
    });

    export const Optimism = new SynapseContract({
        bridge:     "0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b",
        bridge_zap: "0x9CD619c50562a38edBdC3451ade7B58CaA71Ab32",
    })

    export const BSC = new SynapseContract({
        bridge:     "0xd123f70AE324d34A9E76b67a27bf77593bA8749f",
        bridge_zap: "0x749F37Df06A99D6A8E065dd065f8cF947ca23697",
    });

    export const Polygon = new SynapseContract({
        bridge:     "0x8F5BBB2BB8c2Ee94639E55d5F41de9b4839C1280",
        bridge_zap: "0x1c6aE197fF4BF7BA96c66C5FD64Cb22450aF9cC8",
    });

    export const Fantom = new SynapseContract({
        bridge:     "0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b",
        bridge_zap: "0x7BC05Ff03397950E8DeE098B354c37f449907c20",
    });

    export const Boba = new SynapseContract({
        bridge:     "0x432036208d2717394d2614d6697c46DF3Ed69540",
        bridge_zap: "0xFE986b20d34df3Aa9fA2e4d18b8EBe5AC6c753b0",
    });

    export const Moonriver = new SynapseContract(({
        bridge:     "0xaeD5b25BE1c3163c907a471082640450F928DDFE",
        bridge_zap: "0x06Fea8513FF03a0d3f61324da709D4cf06F42A5c",
    }))

    export const Arbitrum = new SynapseContract({
        bridge:     "0x6F4e8eBa4D337f874Ab57478AcC2Cb5BACdc19c9",
        bridge_zap: "0x375E9252625bDB10B457909157548E1d047089f9",
    });

    export const Avalanche = new SynapseContract({
        bridge:     "0xC05e61d0E7a63D27546389B7aD62FdFf5A91aACE",
        bridge_zap: "0x997108791D5e7c0ce2a9A4AAC89427C68E345173",
    });

    export const Harmony = new SynapseContract({
        bridge:     "0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b",
        bridge_zap: "0xF68cD56cF9a9e1cDa181fb2C44C5F0E98B5cC541",
    });
}