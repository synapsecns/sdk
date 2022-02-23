import type {
    SynapseBridgeContract,
    L1BridgeZapContract,
    L2BridgeZapContract,
    GenericZapBridgeContract,
    BridgeConfigContract,
    PoolConfigContract,
} from "./contracts";

import {
    SynapseBridgeFactory,
    L1BridgeZapFactory,
    L2BridgeZapFactory,
    BridgeConfigFactory,
    PoolConfigFactory,
} from "./contracts";

import {ChainId} from "@chainid";
import {contractAddressFor} from "@common/utils";
import {rpcProviderForNetwork} from "@internal/rpcproviders";

import type {SignerOrProvider} from "@common/types";


export const newSynapseBridgeInstance = (params: {
    address: string,
    signerOrProvider?: SignerOrProvider
}): SynapseBridgeContract => SynapseBridgeFactory.connect(params.address, params.signerOrProvider);

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

    export interface NewEntityParams {
        chainId:           number;
        signerOrProvider?: SignerOrProvider;
    }

    export const synapseBridge = (params: NewEntityParams): SynapseBridgeContract =>
        newSynapseBridgeInstance({
            address: contractAddressFor(params.chainId, "bridge"),
            ...params
        })

    export const l1BridgeZap = (params: NewEntityParams): L1BridgeZapContract =>
        newL1BridgeZapInstance({
            address: contractAddressFor(params.chainId, "bridge_zap"),
            ...params
        })

    export const l2BridgeZap = (params: NewEntityParams): L2BridgeZapContract =>
        newL2BridgeZapInstance({
            address: contractAddressFor(params.chainId, "bridge_zap"),
            ...params
        })

    export const zapBridge = (params: NewEntityParams): GenericZapBridgeContract =>
        params.chainId === ChainId.ETH
            ? l1BridgeZap(params)
            : l2BridgeZap(params)

    export const bridgeConfig = (): BridgeConfigContract =>
        BridgeConfigFactory.connect(
            bridgeConfigAddress,
            rpcProviderForNetwork(ChainId.ETH)
        )

    export const poolConfig = (): PoolConfigContract =>
        PoolConfigFactory.connect(
            poolConfigAddress,
            rpcProviderForNetwork(ChainId.ETH)
        )
}