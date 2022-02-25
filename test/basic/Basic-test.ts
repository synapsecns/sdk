import "../helpers/chaisetup";

import {expect} from "chai";

import {
    allNetworksSwapTokensMap,
    ChainId,
    Networks,
    NetworkSwappableTokensMap,
    networkSwapTokensMap,
    supportedChainIds,
    SwapPools,
    Token,
    Tokens
} from "@sdk";

import {
    expectBoolean,
    expectIncludes,
    expectLength,
    wrapExpect
} from "../helpers";

import {
    jsonRpcProviderForNetwork,
    web3ProviderForNetwork
} from "@internal/rpcproviders";

interface _tc {
    want: boolean,
}

const makeWantString = (tc: _tc, suffix: string="include"): string => `should${tc.want ? "" : " not"} ${suffix}`;



describe("Basic tests", function(this: Mocha.Suite) {
    const numChains: number = 14;

    describe("Check networks", function(this: Mocha.Suite) {
        const
            supportedChains   = supportedChainIds(),
            supportedNetworks = Networks.supportedNetworks(),
            testSuffix: string = `should return ${numChains} entries`;

        it(
            `supportedChainIds ${testSuffix}`,
            wrapExpect(expectLength(supportedChains, numChains))
        )

        it(
            `supportedNetworks ${testSuffix}`,
            wrapExpect(expectLength(supportedNetworks, numChains))
        )
    })

    describe("Check rpc providers", function(this: Mocha.Suite) {
        const testTitle: string = "should return the correct provider"

        it(`jsonRpcProviderForNetwork ${testTitle}`, async function(this: Mocha.Context) {
            const provider = jsonRpcProviderForNetwork(ChainId.BSC);
            expect((await provider.getNetwork()).chainId).to.equal(ChainId.BSC);
        })

        it(`web3ProviderForNetwork ${testTitle}`, async function(this: Mocha.Context) {
            const provider = web3ProviderForNetwork(ChainId.FANTOM);
            expect((await provider.getNetwork()).chainId).to.equal(ChainId.FANTOM);
        })
    })

    describe("Check swappableTokens", function(this: Mocha.Suite) {
        interface TestCase {
            token:   Token,
            want:    boolean,
        }

        interface ChainTestCase extends TestCase {
            chainId: number,
        }

        const
            chainA = ChainId.ETH,
            chainB = ChainId.BSC,
            resA = networkSwapTokensMap(chainA, chainB),
            resB = networkSwapTokensMap(chainA),
            resC = allNetworksSwapTokensMap();

        const symbolsForChain = (m: NetworkSwappableTokensMap, c: number): string[] => m[c].map((t: Token) => t.symbol)

        it(
            "resA should have one map entry",
            wrapExpect(expectLength(Object.keys(resA), 1))
        );

        it(
            "resB should have more than one map entry",
            wrapExpect(expect(Object.keys(resB)).length.to.be.gte(1))
        );

        it(
            `resC should have ${numChains} map entries`,
            wrapExpect(expectLength(Object.keys(resC), numChains))
        )

        describe("Check result of two inputs", function(this: Mocha.Suite) {
            const testCases: TestCase[] = [
                {token: Tokens.USDC, want: true},
                {token: Tokens.USDT, want: true},
            ];

            const symbols = symbolsForChain(resA, chainB);

            for (const tc of testCases) {
                const testTitle: string = `symbolsForChain(resA, ${chainB}) ${makeWantString(tc)} token ${tc.token.name}`;

                it(
                    testTitle,
                    wrapExpect(expectIncludes(symbols, tc.token.symbol, tc.want))
                )
            }
        })

        describe("Check result of one input", function(this: Mocha.Suite) {
            const testCases: ChainTestCase[] = [
                {token: Tokens.NETH, want: true, chainId: ChainId.ARBITRUM},
                {token: Tokens.NETH, want: true, chainId: ChainId.BOBA},
            ];

            for (const tc of testCases) {
                const testTitle: string = `network ${Networks.networkName(tc.chainId)} ${makeWantString(tc)} token ${tc.token.name}`;

                it(
                    testTitle,
                    wrapExpect(expectIncludes(symbolsForChain(resB, tc.chainId), tc.token.symbol, tc.want))
                )
            }
        })

        describe("Test supported tokens", function(this: Mocha.Suite) {
            const testCases: ChainTestCase[] = [
                {chainId: ChainId.BSC,          token: Tokens.NUSD,         want: true},
                {chainId: ChainId.BSC,          token: Tokens.BUSD,         want: true},
                {chainId: ChainId.BSC,          token: Tokens.DAI,          want: false},
                {chainId: ChainId.ETH,          token: Tokens.NUSD,         want: true},
                {chainId: ChainId.ETH,          token: Tokens.BUSD,         want: false},
                {chainId: ChainId.ETH,          token: Tokens.DAI,          want: true},
                {chainId: ChainId.ETH,          token: Tokens.ETH,          want: true},
                {chainId: ChainId.ETH,          token: Tokens.WETH,         want: true},
                {chainId: ChainId.AVALANCHE,    token: Tokens.AVWETH,       want: true},
                {chainId: ChainId.AVALANCHE,    token: Tokens.WAVAX,        want: true},
                {chainId: ChainId.MOONRIVER,    token: Tokens.WMOVR,        want: true},
                {chainId: ChainId.CRONOS,      token: Tokens.GOHM,         want: true},
                {chainId: ChainId.METIS,        token: Tokens.SYN,          want: true},
            ];

            for (const tc of testCases) {
                const
                    net: Networks.Network = Networks.fromChainId(tc.chainId),
                    testTitle: string  = `${net.name} ${makeWantString(tc, "support")} token ${tc.token.name}`,
                    supported: boolean = net.supportsToken(tc.token);

                it(
                    testTitle,
                    wrapExpect(expectBoolean(supported, tc.want))
                )
            }
        })
    })

    describe("Test Networks.networkSupportsToken()", function(this: Mocha.Suite) {
        it("BSC should support gOHM", function(this: Mocha.Context) {
            expect(Networks.networkSupportsToken(ChainId.BSC, Tokens.GOHM)).to.be.true;
            expect(Networks.networkSupportsToken(Networks.BSC, Tokens.GOHM)).to.be.true;
        })

        it("ETH should not support MIM", function(this: Mocha.Context) {
            expect(Networks.networkSupportsToken(ChainId.ETH, Tokens.MIM)).to.be.false;
            expect(Networks.networkSupportsToken(Networks.ETH, Tokens.MIM)).to.be.false;
        })
    })
})

describe("SwapPools", function(this: Mocha.Suite) {
    describe("Pool tokens", function(this: Mocha.Suite) {
        interface testCaseToken {
            token: Token,
            want:  boolean,
        }
        interface testCase {
            chainId:   number,
            swapToken: SwapPools.SwapPoolToken,
            tokens:    testCaseToken[]
        }

        const testCases: testCase[] = [
            {
                chainId:       ChainId.BSC,
                swapToken:     SwapPools.BSC_POOL_SWAP_TOKEN,
                tokens: [
                    {token: Tokens.NUSD, want: true},
                    {token: Tokens.BUSD, want: true},
                    {token: Tokens.USDC, want: true},
                    {token: Tokens.USDT, want: true},
                    {token: Tokens.DAI,  want: false},
                    {token: Tokens.FRAX, want: false},
                ],
            }
        ];

        for (const tc of testCases) {
            const
                describeTitle: string = `test ${Networks.networkName(tc.chainId)} ${tc.swapToken.name.trimEnd()} pool tokens`,
                poolSymbols: string[] = tc.swapToken.poolTokens.map((t: Token) => t.symbol);

            describe(describeTitle, function(this: Mocha.Suite) {
                for (const tok of tc.tokens) {
                    const
                        wantTok: boolean  = tok.want,
                        tokSymbol: string = tok.token.symbol,
                        testTitle: string = `pool symbols ${makeWantString(tok)} symbol ${tokSymbol}`;

                    it(
                        testTitle,
                        wrapExpect(expectIncludes(poolSymbols, tokSymbol, wantTok))
                    )
                }
            })
        }
    })
})