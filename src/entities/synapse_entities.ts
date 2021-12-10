import {contractAddressFor} from "../common/utils";

import {
    SynapseBridgeContract,
    SynapseBridgeFactory,
    L1BridgeZapContract,
    L1BridgeZapFactory,
    L2BridgeZapContract,
    L2BridgeZapFactory,
    BridgeConfigContract,
    BridgeConfigFactory,
} from "../contracts";

import type {SignerOrProvider} from "../common";

import {ChainId} from "../common";

import {newProviderForNetwork} from "../rpcproviders";


export namespace SynapseEntities {
    export const bridgeConfigAddress: string = "0x7fd806049608b7d04076b8187dd773343e0589e6";

    export function synapseBridge(params: {
        chainId: number,
        signerOrProvider?: SignerOrProvider
    }): SynapseBridgeContract {
        const address: string = contractAddressFor(params.chainId, "bridge");
        return SynapseBridgeFactory.connect(address, params.signerOrProvider);
    }

    export function l1BridgeZap(params: {
        chainId: number,
        signerOrProvider?: SignerOrProvider
    }): L1BridgeZapContract {
        const address: string = contractAddressFor(params.chainId, "bridge_zap");
        return L1BridgeZapFactory.connect(address, params.signerOrProvider);
    }

    export function l2BridgeZap(params: {
        chainId: number,
        signerOrProvider?: SignerOrProvider
    }): L2BridgeZapContract {
        const address: string = contractAddressFor(params.chainId, "bridge_zap");
        return L2BridgeZapFactory.connect(address, params.signerOrProvider);
    }

    export function bridgeConfig(): BridgeConfigContract {
        const provider = newProviderForNetwork(ChainId.ETH);
        return BridgeConfigFactory.connect(bridgeConfigAddress, provider);
    }
}