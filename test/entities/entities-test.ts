import "../helpers/chaisetup";

import {expect} from "chai";

import {Context} from "mocha";

<<<<<<< HEAD
import {SynapseContracts} from "../../src/common/synapse_contracts";
import {newProviderForNetwork} from "../../src/internal/rpcproviders";
=======
import {newProviderForNetwork} from "../../src/internal";
>>>>>>> b3e415f (cleanup src/internal imports)

import {
    ChainId,
    newSynapseBridgeInstance,
    newL1BridgeZapInstance,
    newL2BridgeZapInstance,
    synapseBridge,
    l1BridgeZap,
    l2BridgeZap,
} from "../../src";


describe("Entities tests", function(this: Mocha.Suite) {
    it("Make SynapseBridge instance", function(this: Context) {
        const provider = newProviderForNetwork(ChainId.FANTOM);
        let instance = newSynapseBridgeInstance({
            address: SynapseContracts.Fantom.bridge.address,
            signerOrProvider: provider,
        });

        expect(instance).to.not.be.null;
    })

    it("Make SynapseBridge entity instance", function(this: Context) {
        const provider = newProviderForNetwork(ChainId.FANTOM);
        let instance = synapseBridge({
            chainId:          ChainId.FANTOM,
            signerOrProvider: provider,
        });

        expect(instance).to.not.be.null;
    })

    it("Make L1BridgeZap instance", function(this: Context) {
        const provider = newProviderForNetwork(ChainId.ETH);
        let instance = newL1BridgeZapInstance({
            address: SynapseContracts.Ethereum.bridge_zap.address,
            signerOrProvider: provider,
        });

        expect(instance).to.not.be.null;
    })

    it("Make L1BridgeZap entity instance", function(this: Context) {
        const provider = newProviderForNetwork(ChainId.ETH);
        let instance = l1BridgeZap({
            chainId:          ChainId.ETH,
            signerOrProvider: provider,
        });

        expect(instance).to.not.be.null;
    })

    it("Make L2BridgeZap instance", function(this: Context) {
        const provider = newProviderForNetwork(ChainId.BSC);
        let instance = newL2BridgeZapInstance({
            address: SynapseContracts.BSC.bridge_zap.address,
            signerOrProvider: provider,
        });

        expect(instance).to.not.be.null;
    })

    it("Make L2BridgeZap entity instance", function(this: Context) {
        const provider = newProviderForNetwork(ChainId.BSC);
        let instance = l2BridgeZap({
            chainId:          ChainId.BSC,
            signerOrProvider: provider,
        });

        expect(instance).to.not.be.null;
    })
})