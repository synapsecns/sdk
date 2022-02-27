import {
    SynapseBridgeFactory,
    L1BridgeZapFactory,
    L2BridgeZapFactory,
    BridgeConfigV3Factory,
    type SynapseBridgeContract,
    type L1BridgeZapContract,
    type L2BridgeZapContract,
    type GenericZapBridgeContract,
    type BridgeConfigV3Contract,
} from "./contracts";

import {ChainId}               from "@chainid";
import {contractAddressFor}    from "@common/utils";
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
    const bridgeConfigV3Address: string = "0x3ee02f08B801B1990AC844d8CD2F119BA6Fb9bcF";

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

    export const bridgeConfigV3 = (): BridgeConfigV3Contract =>
        BridgeConfigV3Factory.connect(
            bridgeConfigV3Address,
            rpcProviderForNetwork(ChainId.ETH)
        )
}