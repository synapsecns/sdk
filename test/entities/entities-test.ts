import {
    wrapExpect,
    expectNull
} from "@tests/helpers";

import {
    ChainId,
    Networks
} from "@sdk";

import {
    SynapseBridgeContractInstance,
    L1BridgeZapContractInstance,
    L2BridgeZapContractInstance,
    GenericZapBridgeContractInstance,
    BridgeConfigV3ContractInstance
} from "@sdk/entities";

import {rpcProviderForChain}   from "@sdk/internal/rpcproviders";
import type {SignerOrProvider} from "@sdk/common/types";

import type {BaseContract} from "@ethersproject/contracts";


describe("Entities tests", function(this: Mocha.Suite) {
    enum EntityKind {
        SynapseBridge    = "SynapseBridge",
        L1BridgeZap      = "L1BridgeZap",
        L2BridgeZap      = "L2BridgeZap",
        GenericZapBridge = "GenericZapBridge",
        BridgeConfigV3   = "BridgeConfigV3",
    }

    interface fnArgs {
        chainId:          number;
        signerOrProvider: SignerOrProvider;
    }

    interface TestCase {
        chainId: number;
        fn:      (args: fnArgs) => BaseContract;
        kind:    EntityKind;
    }

    function makeTestCase(chainId: number, kind: EntityKind): TestCase {
        let fn: (args: fnArgs) => BaseContract;

        switch (kind) {
            case EntityKind.SynapseBridge:
                fn = SynapseBridgeContractInstance;
                break;
            case EntityKind.L1BridgeZap:
                fn = L1BridgeZapContractInstance;
                break;
            case EntityKind.L2BridgeZap:
                fn = L2BridgeZapContractInstance;
                break;
            case EntityKind.GenericZapBridge:
                fn = GenericZapBridgeContractInstance;
                break;
            case EntityKind.BridgeConfigV3:
                fn = BridgeConfigV3ContractInstance;
                break;
        }

        return {chainId, fn, kind}
    }

    [
        makeTestCase(ChainId.FANTOM, EntityKind.SynapseBridge),
        makeTestCase(ChainId.FANTOM, EntityKind.L2BridgeZap),
        makeTestCase(ChainId.BSC,    EntityKind.SynapseBridge),
        makeTestCase(ChainId.BSC,    EntityKind.L2BridgeZap),
        makeTestCase(ChainId.ETH,    EntityKind.SynapseBridge),
        makeTestCase(ChainId.ETH,    EntityKind.L1BridgeZap),
        makeTestCase(ChainId.ETH,    EntityKind.BridgeConfigV3),
    ].forEach(tc => {
        describe(Networks.networkName(tc.chainId), function(this: Mocha.Suite) {
            const
                provider                = rpcProviderForChain(tc.chainId),
                newInstanceArgs: fnArgs = {chainId: tc.chainId, signerOrProvider: provider};

            let instance: BaseContract = tc.fn(newInstanceArgs);

            it(
                `Test ${EntityKind[tc.kind]} instance`,
                wrapExpect(expectNull(instance, false))
            );
        });
    });
});