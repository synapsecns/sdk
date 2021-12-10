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
                abi: isEthMainnet ? ABIs.L1BridgeZap : ABIs.L2BridgeZap,
            };
        }
    }

    export const Ethereum = new SynapseContract({
        bridge:       "0x2796317b0fF8538F253012862c06787Adfb8cEb6",
        bridge_zap:   "0x6571d6be3d8460CF5F7d6711Cd9961860029D85F",
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
        bridge_zap: "0x64B4097bCCD27D49BC2A081984C39C3EeC427a2d",
    });

    export const Moonriver = new SynapseContract(({
        bridge:     "0xaeD5b25BE1c3163c907a471082640450F928DDFE",
        bridge_zap: "0x06Fea8513FF03a0d3f61324da709D4cf06F42A5c",
    }))

    export const Arbitrum = new SynapseContract({
        bridge:     "0x6F4e8eBa4D337f874Ab57478AcC2Cb5BACdc19c9",
        bridge_zap: "0x26532682E1830cDACcCbb7e385Cff6de14dD08D8",
    });

    export const Avalanche = new SynapseContract({
        bridge:     "0xC05e61d0E7a63D27546389B7aD62FdFf5A91aACE",
        bridge_zap: "0x407Bc506E6F262A0A1F2ea0cC4d66e3bEe29D577",
    });

    export const Harmony = new SynapseContract({
        bridge:     "0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b",
        bridge_zap: "0xF68cD56cF9a9e1cDa181fb2C44C5F0E98B5cC541",
    });
}