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

import {ChainId}               from "@chainid";
import {contractAddressFor}    from "@common/utils";
import type {SignerOrProvider} from "@common/types";

import {rpcProviderForChain} from "@internal/rpcproviders";


const bridgeConfigV3Address: string = "0x5217c83ca75559B1f8a8803824E5b7ac233A12a1";

export const AvaxJewelMigrationAddress: string = "0x82d4aCF0DA013Ee3649C7eAdF5Db9093A7EFa7B0";

enum ContractKind {bridge="bridgeAddress", bridgeZap="bridgeZapAddress"}

interface NewInstanceParams {
    chainId:           number;
    signerOrProvider?: SignerOrProvider
}

enum EntityKind {
    SynapseBridge      = "SynapseBridge",
    L1BridgeZap        = "L1BridgeZap",
    L2BridgeZap        = "L2BridgeZap",
    BridgeConfig       = "BridgeConfig",
    AvaxJewelMigration = "AvaxJewelMigration",
}

namespace Connector {
    function makeConnectorName(chainId: number, entityKind: EntityKind): string {
        return `${entityKind.toString()}.${chainId}`
    }

    type EntityContract =
        SynapseBridgeContract  |
        L1BridgeZapContract    | L2BridgeZapContract |
        BridgeConfigV3Contract | AvaxJewelMigrationContract

    type ConnectorEntity = {
        contract:   EntityContract;
        entityKind: EntityKind;
        chainId:    number;
    }

    export class EntityConnector {
        private readonly entityMap: {[k: string]: ConnectorEntity};

        constructor() {
            this.entityMap = {};
        }

        private addEntity(connectorName: string, contract: EntityContract, entityKind: EntityKind, chainId: number) {
            this.entityMap[connectorName] = {contract, entityKind, chainId}
        }

        private checkEntity(connectorName: string): EntityContract | null {
            if (connectorName in this.entityMap) {
                return this.entityMap[connectorName].contract
            }
        }

        synapseBridge(params: NewInstanceParams): SynapseBridgeContract {
            const
                {chainId, signerOrProvider} = params,
                entityKind    = EntityKind.SynapseBridge,
                connectorName = makeConnectorName(chainId, entityKind);

            const check = this.checkEntity(connectorName);
            if (check) {
                return check as SynapseBridgeContract
            }

            const newEntity = SynapseBridgeFactory.connect(
                contractAddressFor(chainId, ContractKind.bridge),
                signerOrProvider
            );

            this.addEntity(connectorName, newEntity, entityKind, chainId);

            return newEntity
        }

        l1BridgeZap(params: NewInstanceParams): L1BridgeZapContract {
            const
                {chainId, signerOrProvider} = params,
                entityKind    = EntityKind.L1BridgeZap,
                connectorName = makeConnectorName(chainId, entityKind);

            const check = this.checkEntity(connectorName);
            if (check) {
                return check as L1BridgeZapContract
            }

            const newEntity = L1BridgeZapFactory.connect(
                contractAddressFor(chainId, ContractKind.bridgeZap),
                signerOrProvider
            );

            this.addEntity(connectorName, newEntity, entityKind, chainId);

            return newEntity
        }

        l2BridgeZap(params: NewInstanceParams): L2BridgeZapContract {
            const
                {chainId, signerOrProvider} = params,
                entityKind    = EntityKind.L2BridgeZap,
                connectorName = makeConnectorName(chainId, entityKind);

            const check = this.checkEntity(connectorName);
            if (check) {
                return check as L2BridgeZapContract
            }

            const newEntity = L2BridgeZapFactory.connect(
                contractAddressFor(chainId, ContractKind.bridgeZap),
                signerOrProvider
            );

            this.addEntity(connectorName, newEntity, entityKind, chainId);

            return newEntity
        }

        bridgeConfig(): BridgeConfigV3Contract {
            const
                chainId       = ChainId.ETH,
                entityKind    = EntityKind.BridgeConfig,
                connectorName = makeConnectorName(chainId, entityKind);

            const check = this.checkEntity(connectorName);
            if (check) {
                return check as BridgeConfigV3Contract
            }

            const newEntity = BridgeConfigV3Factory.connect(
                bridgeConfigV3Address,
                rpcProviderForChain(chainId)
            );

            this.addEntity(connectorName, newEntity, entityKind, chainId);

            return newEntity
        }

        avaxJewelMigration(): AvaxJewelMigrationContract {
            const
                chainId       = ChainId.AVALANCHE,
                entityKind    = EntityKind.AvaxJewelMigration,
                connectorName = makeConnectorName(chainId, entityKind);

            const check = this.checkEntity(connectorName);
            if (check) {
                return check as AvaxJewelMigrationContract
            }

            const newEntity = AvaxJewelMigrationFactory.connect(
                AvaxJewelMigrationAddress,
                rpcProviderForChain(ChainId.AVALANCHE)
            );

            this.addEntity(connectorName, newEntity, entityKind, chainId);

            return newEntity
        }
    }
}

const ENTITY_CONNECTOR = new Connector.EntityConnector();

export function SynapseBridgeContractInstance(params: NewInstanceParams): SynapseBridgeContract {
    return ENTITY_CONNECTOR.synapseBridge(params)
}

export function L1BridgeZapContractInstance(params: NewInstanceParams): L1BridgeZapContract {
    return ENTITY_CONNECTOR.l1BridgeZap(params)
}

export function L2BridgeZapContractInstance(params: NewInstanceParams): L2BridgeZapContract {
    return ENTITY_CONNECTOR.l2BridgeZap(params)
}

export function GenericZapBridgeContractInstance(params: NewInstanceParams): GenericZapBridgeContract {
    return params.chainId === ChainId.ETH || params.chainId === ChainId.DFK
        ? L1BridgeZapContractInstance(params)
        : L2BridgeZapContractInstance(params)
}

export function BridgeConfigV3ContractInstance(): BridgeConfigV3Contract {
    return ENTITY_CONNECTOR.bridgeConfig()
}

export function AvaxJewelMigrationContractInstance(): AvaxJewelMigrationContract {
    return ENTITY_CONNECTOR.avaxJewelMigration()
}