import "../helpers/chaisetup";

import {
    wrapExpect,
    expectNull
} from "../helpers";


import {SynapseContracts}      from "@common/synapse_contracts";
import {rpcProviderForNetwork} from "@internal/rpcproviders";

import type {SignerOrProvider} from "@common/types";

import {
    ChainId,
    Networks,
    newSynapseBridgeInstance,
    newL1BridgeZapInstance,
    newL2BridgeZapInstance,
    synapseBridge,
    l1BridgeZap,
    l2BridgeZap,
} from "@sdk";

import type {BaseContract} from "@ethersproject/contracts";

describe("Entities tests", function(this: Mocha.Suite) {
    enum EntityKind {
        SynapseBridge = "SynapseBridge",
        L1BridgeZap   = "L1BridgeZap",
        L2BridgeZap   = "L2BridgeZap",
    }

    interface fnArgs {
        address:          string,
        chainId:          number,
        signerOrProvider: SignerOrProvider,
    }
    interface TestCase {
        chainId:    number,
        address:    string,
        instanceFn: (args: fnArgs) => BaseContract,
        entityFn:   (args: fnArgs) => BaseContract,
        kind:       EntityKind,
    }

    function makeTestCase(chainId: number, kind: EntityKind): TestCase {
        const contracts = SynapseContracts.contractsForChainId(chainId);

        let
            address:    string,
            instanceFn: (args: fnArgs) => BaseContract,
            entityFn:   (args: fnArgs) => BaseContract;

        switch (kind) {
            case EntityKind.SynapseBridge:
                address    = contracts.bridge_address;
                instanceFn = newSynapseBridgeInstance;
                entityFn   = synapseBridge;
                break;
            case EntityKind.L1BridgeZap:
                address    = contracts.bridge_zap_address;
                instanceFn = newL1BridgeZapInstance;
                entityFn   = l1BridgeZap;
                break;
            case EntityKind.L2BridgeZap:
                address    = contracts.bridge_zap_address;
                instanceFn = newL2BridgeZapInstance;
                entityFn   = l2BridgeZap;
                break;
        }

        return {chainId, address, instanceFn, entityFn, kind}
    }

    const testCases: TestCase[] = [
        makeTestCase(ChainId.FANTOM, EntityKind.SynapseBridge),
        makeTestCase(ChainId.FANTOM, EntityKind.L2BridgeZap),
        makeTestCase(ChainId.BSC,    EntityKind.SynapseBridge),
        makeTestCase(ChainId.BSC,    EntityKind.L2BridgeZap),
        makeTestCase(ChainId.ETH,    EntityKind.SynapseBridge),
        makeTestCase(ChainId.ETH,    EntityKind.L1BridgeZap),
    ];

    const makeTestName = (
        tc:      TestCase,
        entity:  boolean
    ): string => `Test ${EntityKind[tc.kind]}${entity ? " entity" : ""} instance`;

    for (const tc of testCases) {
        describe(Networks.networkName(tc.chainId), function(this: Mocha.Suite) {
            const
                provider                = rpcProviderForNetwork(tc.chainId),
                newInstanceArgs: fnArgs = {address: tc.address, chainId: tc.chainId, signerOrProvider: provider};

            let
                instance       = tc.instanceFn(newInstanceArgs),
                entityInstance = tc.entityFn(newInstanceArgs);

            it(
                makeTestName(tc, false),
                wrapExpect(expectNull(instance, false))
            )

            it(
                makeTestName(tc, true),
                wrapExpect(expectNull(entityInstance, false))
            )
        })


    }
})