import "@tests/setup"

import {expect} from "chai";

import {
    Bridge,
    Networks,
    supportedChainIds
} from "@sdk";

import {rpcProviderForChain} from "@internal/rpcproviders";

import {Provider} from "@ethersproject/providers";

describe("Test creating SynapseBridge instances", function(this: Mocha.Suite) {
    const ALL_CHAIN_IDS = supportedChainIds();

    function newSynapseBridge(network: Networks.Network | number, provider?: Provider) {
        new Bridge.SynapseBridge({network, provider})
    }

    for (const chainId of ALL_CHAIN_IDS) {
        it(`creating SynapseBridge instance for Chain ID ${chainId} should not throw (no provider)`, function(this: Mocha.Context) {
            expect(newSynapseBridge(chainId)).to.not.throw;
        })

        it(`creating SynapseBridge instance for Chain ID ${chainId} should not throw (with provider)`, function(this: Mocha.Context) {
            expect(newSynapseBridge(chainId, rpcProviderForChain(chainId))).to.not.throw;
        })
    }
})

describe("Test creating L2BridgeZap instances", function(this: Mocha.Suite) {
    const ALL_CHAIN_IDS = supportedChainIds();

    function newSynapseBridge(network: Networks.Network | number, provider?: Provider) {
        new Bridge.SynapseBridge({network, provider})
    }

    for (const chainId of ALL_CHAIN_IDS) {
        it(`creating L2BridgeZap instance for Chain ID ${chainId} and trying a `)
    }
})
