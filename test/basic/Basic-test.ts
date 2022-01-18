import {expect} from "chai";
import {before, Done} from "mocha";

import {
    ChainId,
    Networks,
    NetworkSwappableTokensMap,
    networkSwapTokensMap,
    allNetworksSwapTokensMap,
    BaseToken,
    Tokens,
} from "../../src";

describe("Basic tests", function(this: Mocha.Suite) {
    const numChains: number = 12;

    describe("Check networks", function(this: Mocha.Suite) {
        const
            supportedChains   = ChainId.supportedChainIds(),
            supportedNetworks = Networks.supportedNetworks();

        it(`supportedChainIds should return ${numChains} chains`, () => expect(supportedChains).to.have.a.lengthOf(numChains))

        it(`supportedNetworks should return ${numChains} networks`, () => expect(supportedNetworks).to.have.a.lengthOf(numChains))
    })

    describe("Check swappableTokens", function(this: Mocha.Suite) {
        const
            chainA = ChainId.ETH,
            chainB = ChainId.BSC,
            resA = networkSwapTokensMap(chainA, chainB),
            resB = networkSwapTokensMap(chainA),
            resC = allNetworksSwapTokensMap();

        const symbolsForChain = (m: NetworkSwappableTokensMap, c: number): string[] => m[c].map((t: BaseToken) => t.symbol)

        describe("Check result of two inputs", function(this: Mocha.Suite) {
            it("should have one map entry", () => expect(Object.keys(resA)).to.have.a.lengthOf(1));
            it("should have USDC and USDT", () => {
                const symbols = symbolsForChain(resA, chainB);
                expect(symbols).to.include(Tokens.USDC.symbol);
                expect(symbols).to.include(Tokens.USDT.symbol);
            })
        })

        describe("Check result of one input", function(this: Mocha.Suite) {
            it("should have more than one map entry", () => expect(Object.keys(resB)).length.to.be.gte(1));
            it("should have nETH on BOBA and Arbitrum", () => {
                expect(symbolsForChain(resB, ChainId.ARBITRUM)).to.include(Tokens.NETH.symbol);
                expect(symbolsForChain(resB, ChainId.BOBA)).to.include(Tokens.NETH.symbol);
            })
        })

        describe("Check result of swappableTokensAllNetworks", function(this: Mocha.Suite) {
            it(`should have ${numChains} map entries`, () => expect(Object.keys(resC)).to.have.a.lengthOf(numChains))
        })
    })
})