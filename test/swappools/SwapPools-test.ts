import {expect} from "chai"

import {
    ChainId,
    Networks,
    SwapPools,
    Tokens,
    type Token
} from "@sdk";

import {SwapFactory} from "@sdk/contracts";
import type {StringMap} from "@sdk/common/types";
import {rpcProviderForChain} from "@sdk/internal/rpcproviders";
import {SwapType} from "@internal/swaptype";

import {
    expectNull,
    expectEqual,
    expectUndefined,
    expectIncludes,
    expectProperty,
    wrapExpect,
} from "@tests/helpers";

describe("SwapPools Tests", function(this: Mocha.Suite) {
    describe("Pool tokens tests", function(this: Mocha.Suite) {
        interface TestCase {
            chainId:   number;
            swapToken: SwapPools.SwapPoolToken;
            tokens:    {token: Token, want: boolean}[];
        }

        const makeWantString = (tc: {want: boolean}, suffix: string="include"): string => `should${tc.want ? "" : " not"} ${suffix}`;

        [
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
            },
            {
                chainId:       ChainId.FANTOM,
                swapToken:     SwapPools.FANTOM_POOL_SWAP_TOKEN,
                tokens: [
                    {token: Tokens.NUSD, want: true},
                    {token: Tokens.BUSD, want: false},
                    {token: Tokens.USDC, want: true},
                    {token: Tokens.USDT, want: true},
                    {token: Tokens.DAI,  want: false},
                    {token: Tokens.FRAX, want: false},
                ],
            },
        ].forEach((tc: TestCase) => {
            const
                describeTitle: string = `test ${Networks.networkName(tc.chainId)} ${tc.swapToken.name.trimEnd()} pool tokens`,
                poolSymbols: string[] = tc.swapToken.poolTokens.map((t: Token) => t.symbol);

            describe(describeTitle, function(this: Mocha.Suite) {
                tc.tokens.forEach(tok => {
                    const
                        wantTok: boolean  = tok.want,
                        tokSymbol: string = tok.token.symbol,
                        testTitle: string = `pool symbols ${makeWantString(tok)} symbol ${tokSymbol}`;

                    it(
                        testTitle,
                        wrapExpect(expectIncludes(poolSymbols, tokSymbol, wantTok))
                    );
                });
            });
        });
    });

    describe("Test SwapPool getters for network", function(this: Mocha.Suite) {
        interface TestCase {
            chainId:            number;
            wantStableSwapPool: boolean;
            wantEthSwapPool:    boolean;
        }

        const makeTestCase = (
            chainId:            number,
            wantStableSwapPool: boolean,
            wantEthSwapPool:    boolean
        ): TestCase => ({chainId, wantStableSwapPool, wantEthSwapPool})

        const testCases: TestCase[] = [
            makeTestCase(ChainId.ETH,       true,  false),
            makeTestCase(ChainId.OPTIMISM,  false, true),
            makeTestCase(ChainId.CRONOS,    false, false),
            makeTestCase(ChainId.BSC,       true,  false),
            makeTestCase(ChainId.POLYGON,   true,  false),
            makeTestCase(ChainId.FANTOM,    true,  true),
            makeTestCase(ChainId.BOBA,      true,  true),
            makeTestCase(ChainId.METIS,     true,  true),
            makeTestCase(ChainId.MOONBEAM,  false, false),
            makeTestCase(ChainId.MOONRIVER, false, false),
            makeTestCase(ChainId.ARBITRUM,  true,  true),
            makeTestCase(ChainId.AVALANCHE, true,  true),
            makeTestCase(ChainId.AURORA,    true,  false),
            makeTestCase(ChainId.HARMONY,   true,  true),
        ];

        const makeShouldHaveString = (want: boolean): string => `${want ? "should" : "should not"} have a(n)`;

        const makeTestTitles = (tc: TestCase): [string, string, string, string, string] => {
            const testPrefix: string = `${Networks.networkName(tc.chainId)}`;
            const swapContractStr = (t: string): string => `swap contract should have ${t} at index 0`;

            const
                stableSwapTestTitle:         string = `${testPrefix} ${makeShouldHaveString(tc.wantStableSwapPool)} stableswap pool token`,
                ethSwapTestTitle:            string = `${testPrefix} ${makeShouldHaveString(tc.wantEthSwapPool)} ethswap pool token`,
                stableSwapContractTestTitle: string = `${testPrefix} ${swapContractStr("nUSD")}`,
                ethSwapContractTestTitle:    string = `${testPrefix} ${swapContractStr("nETH")}`;

            return [testPrefix, stableSwapTestTitle, ethSwapTestTitle, stableSwapContractTestTitle, ethSwapContractTestTitle]
        }

        const testFn = (tc: TestCase, stableSwap: boolean): ((this: Mocha.Context) => void) => {
            const getPoolFn: (chainId: number) => SwapPools.SwapPoolToken = stableSwap
                ? SwapPools.stableswapPoolForNetwork
                : SwapPools.ethSwapPoolForNetwork;

            const wantUndefined: boolean = !(stableSwap ? tc.wantStableSwapPool : tc.wantEthSwapPool);

            return function(this: Mocha.Context) {
                expectUndefined(getPoolFn(tc.chainId), wantUndefined);
            }
        }

        const swapContractTestFn = (tc: TestCase, stableSwap: boolean): ((this: Mocha.Context, done: Mocha.Done) => void) => {
            return function(this: Mocha.Context, done: Mocha.Done) {
                this.timeout(6.5*1000);
                this.slow(3.5*1000);

                const getPoolFn: (chainId: number) => SwapPools.SwapPoolToken = stableSwap
                    ? SwapPools.stableswapPoolForNetwork
                    : SwapPools.ethSwapPoolForNetwork;

                const t: Token = stableSwap
                    ? Tokens.NUSD
                    : Tokens.NETH;

                const swapContract = SwapFactory.connect(
                    getPoolFn(tc.chainId).swapAddress,
                    rpcProviderForChain(tc.chainId)
                );

                const prom = swapContract.getToken(0).then(addr => addr.toLowerCase());
                const wantAddr = t.address(tc.chainId).toLowerCase();

                expect(prom).to.eventually.equal(wantAddr).notify(done);
            }
        }

        const ethSwapAddressChains: number[] = [
            ChainId.OPTIMISM,
            ChainId.BOBA,
            ChainId.ARBITRUM,
            ChainId.AVALANCHE
        ];

        testCases.forEach(tc => {
            const [
                testPrefix,
                stableSwapTestTitle,         ethSwapTestTitle,
                stableSwapContractTestTitle, ethSwapContractTestTitle
            ] = makeTestTitles(tc);

            it(stableSwapTestTitle, testFn(tc, true));

            if (tc.wantStableSwapPool && tc.chainId !== ChainId.ETH) {
                it(stableSwapContractTestTitle, swapContractTestFn(tc, true));
                it(`${testPrefix} StableSwapToken's .swapETHAddress() should return null`, function(this: Mocha.Context) {
                    expect(SwapPools.stableswapPoolForNetwork(tc.chainId).swapETHAddress).to.be.null;
                });
            }

            it(ethSwapTestTitle, testFn(tc, false));

            if (tc.wantEthSwapPool) {
                it(ethSwapContractTestTitle, swapContractTestFn(tc, false));

                const ethSwapPool = SwapPools.ethSwapPoolForNetwork(tc.chainId);
                if (ethSwapAddressChains.includes(tc.chainId)) {
                    it(`${testPrefix} ETHSwapToken's .swapETHAddress() should not return null`, function(this: Mocha.Context) {
                        expect(ethSwapPool.swapETHAddress).to.not.be.null;
                    });
                } else {
                    it(`${testPrefix} ETHSwapToken's .swapETHAddress() should return null`, function(this: Mocha.Context) {
                        expect(ethSwapPool.swapETHAddress).to.be.null;
                    });
                }
            }
        });
    });

    describe("SwapPoolToken properties tests", function(this: Mocha.Suite) {
        interface TestCase {
            testName:     string;
            chainId:      number;
            swapPool:     SwapPools.SwapPoolToken;
            wantSymbol:   string;
            wantSwapType: SwapType;
            wantAddress:  string|null;
            wantDecimals: number|null;
        }

        const testCases: TestCase[] = [
            {
                testName:     "Eth Stableswap Pool",
                chainId:      ChainId.ETH,
                swapPool:     SwapPools.ETH_POOL_SWAP_TOKEN,
                wantSymbol:   "nUSD",
                wantSwapType: SwapType.USD,
                wantAddress:  Tokens.NUSD.address(ChainId.ETH),
                wantDecimals: 18,
            },
            {
                testName:     "AVAX Stableswap Pool",
                chainId:      ChainId.BSC,
                swapPool:     SwapPools.AVALANCHE_POOL_SWAP_TOKEN,
                wantSymbol:   "nUSD-LP",
                wantSwapType: SwapType.USD,
                wantAddress:  null,
                wantDecimals: null,
            },
            {
                testName:     "METIS Stableswap Pool",
                chainId:      ChainId.METIS,
                swapPool:     SwapPools.METIS_POOL_SWAP_TOKEN,
                wantSymbol:   "nUSD-LP",
                wantSwapType: SwapType.USD,
                wantAddress:  "0xC6f684aE516480A35f337a4dA8b40EB6550e07E0",
                wantDecimals: 18,
            }
        ];

        const wantValStr = (tc: TestCase, wantVal: any|null): string =>
            `${wantVal === null ? "'null'" : "'"+wantVal+"'"} for Chain ID ${tc.chainId}`

        testCases.forEach(tc => {
            describe(`${tc.testName} Properties Tests`, function(this: Mocha.Suite) {
                it(`property 'symbol' should equal ${tc.wantSymbol}`, function(this: Mocha.Context) {
                    expectEqual(tc.swapPool.symbol, tc.wantSymbol);
                });

                it(`property 'swapType' should equal ${tc.wantSwapType}`, function(this: Mocha.Context) {
                    expectEqual(tc.swapPool.swapType, tc.wantSwapType);
                });

                it(`function address() should return ${wantValStr(tc, tc.wantAddress)}`, function(this: Mocha.Context) {
                    expectNull(tc.swapPool.address(tc.chainId), tc.wantAddress === null);
                });

                it(`function decimals() should return ${wantValStr(tc, tc.wantDecimals)}`, function(this: Mocha.Context) {
                    expectNull(tc.swapPool.decimals(tc.chainId), tc.wantDecimals === null);
                });

                it(`property 'id' should return ${tc.wantSymbol}`, function(this: Mocha.Context) {
                    expectEqual(tc.swapPool.id.description, tc.wantSymbol);
                });

                if (tc.wantAddress !== null) {
                    it(`property 'addresses' should contain ${tc.wantAddress}`, function(this: Mocha.Context) {
                        const addrsMap: StringMap = tc.swapPool.addresses;

                        expectProperty(addrsMap, `${tc.chainId}`);
                        expectEqual(addrsMap[tc.chainId], tc.wantAddress);
                    });
                }
            });
        });
    });
});