import type {
    SynapseBridgeContract,
    L1BridgeZapContract,
    L2BridgeZapContract,
    GenericZapBridgeContract,
    BridgeConfigContract,
} from "./contracts";

<<<<<<< HEAD:src/entities.ts
=======
import type {
    SynapseBridgeContract,
    L1BridgeZapContract,
    L2BridgeZapContract,
    GenericZapBridgeContract,
    BridgeConfigContract,
    PoolConfigContract,
} from "../contracts";

>>>>>>> 3d8ea4e (Implement token swaps in the SDK (#35)):src/entities/synapse_entities.ts
import {
    SynapseBridgeFactory,
    L1BridgeZapFactory,
    L2BridgeZapFactory,
    BridgeConfigFactory,
<<<<<<< HEAD:src/entities.ts
} from "./contracts";

import type {SignerOrProvider} from "./common/types";
import {contractAddressFor} from "./common/utils";
import {ChainId} from "./common/chainid";
import {newProviderForNetwork} from "./internal/rpcproviders";


export const newSynapseBridgeInstance = (params: {
    address: string,
    signerOrProvider?: SignerOrProvider
}): SynapseBridgeContract => SynapseBridgeFactory.connect(params.address, params.signerOrProvider);
=======
    PoolConfigFactory,
} from "../contracts";
>>>>>>> 3d8ea4e (Implement token swaps in the SDK (#35)):src/entities/synapse_entities.ts


export const newL1BridgeZapInstance = (params: {
    address: string,
    signerOrProvider?: SignerOrProvider
}): L1BridgeZapContract => L1BridgeZapFactory.connect(params.address, params.signerOrProvider);


export const newL2BridgeZapInstance = (params: {
    address: string,
    signerOrProvider?: SignerOrProvider
}): L2BridgeZapContract => L2BridgeZapFactory.connect(params.address, params.signerOrProvider);

export namespace SynapseEntities {
    const
        bridgeConfigAddress: string = "0x7fd806049608b7d04076b8187dd773343e0589e6",
        poolConfigAddress:   string = "0xB34C67DB5F0Fd8D3D4238FD0A1cBbfD50a72e177";

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

    export function zapBridge(params: {
        chainId: number,
        signerOrProvider?: SignerOrProvider
    }): GenericZapBridgeContract {
        const address: string = contractAddressFor(params.chainId, "bridge_zap");

        if (params.chainId === ChainId.ETH) {
            return L1BridgeZapFactory.connect(address, params.signerOrProvider)
        }

        return L2BridgeZapFactory.connect(address, params.signerOrProvider)
    }

    export function bridgeConfig(): BridgeConfigContract {
        const provider = newProviderForNetwork(ChainId.ETH);
        return BridgeConfigFactory.connect(bridgeConfigAddress, provider)
    }

    export function poolConfig(): PoolConfigContract {
        const provider = newProviderForNetwork(ChainId.ETH);
        return PoolConfigFactory.connect(poolConfigAddress, provider)
    }
}