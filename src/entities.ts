import {
    SynapseBridgeFactory,
    L1BridgeZapFactory,
    L2BridgeZapFactory,
    BridgeConfigV3Factory,
    AvaxJewelMigrationFactory,
    type SynapseBridgeContract,
    type L1BridgeZapContract,
    type L2BridgeZapContract,
    type GenericZapBridgeContract,
    type BridgeConfigV3Contract,
    type AvaxJewelMigrationContract
} from "./contracts";

import {ChainId}             from "@chainid";
import {contractAddressFor}  from "@common/utils";
import {rpcProviderForChain} from "@internal/index";

import type {SignerOrProvider} from "@common/types";



const bridgeConfigV3Address: string = "0x5217c83ca75559B1f8a8803824E5b7ac233A12a1";

export const AvaxJewelMigrationAddress: string = "0x82d4aCF0DA013Ee3649C7eAdF5Db9093A7EFa7B0";

enum ContractKind {bridge="bridgeAddress", bridgeZap="bridgeZapAddress"}

interface NewInstanceParams {
    chainId:           number;
    signerOrProvider?: SignerOrProvider
}

export function SynapseBridgeContractInstance(params: NewInstanceParams): SynapseBridgeContract {
    return SynapseBridgeFactory.connect(
        contractAddressFor(params.chainId, ContractKind.bridge),
        params.signerOrProvider
    )
}

export function L1BridgeZapContractInstance(params: NewInstanceParams): L1BridgeZapContract {
    return L1BridgeZapFactory.connect(
        contractAddressFor(params.chainId, ContractKind.bridgeZap),
        params.signerOrProvider
    )
}

export function L2BridgeZapContractInstance(params: NewInstanceParams): L2BridgeZapContract {
    return L2BridgeZapFactory.connect(
        contractAddressFor(params.chainId, ContractKind.bridgeZap),
        params.signerOrProvider
    )
}

export function GenericZapBridgeContractInstance(params: NewInstanceParams): GenericZapBridgeContract {
    return params.chainId === ChainId.ETH
        ? L1BridgeZapContractInstance(params)
        : L2BridgeZapContractInstance(params)
}

export function BridgeConfigV3ContractInstance(): BridgeConfigV3Contract {
    return BridgeConfigV3Factory.connect(
        bridgeConfigV3Address,
        rpcProviderForChain(ChainId.ETH)
    )
}

export function AvaxJewelMigrationContractInstance(): AvaxJewelMigrationContract {
    return AvaxJewelMigrationFactory.connect(
        AvaxJewelMigrationAddress,
        rpcProviderForChain(ChainId.AVALANCHE)
    )
}