import "../helpers/chaisetup";

import {
    ChainId,
    Networks,
    SwapPools,
    Tokens,
} from "@sdk";

import {SwapType} from "@internal/swaptype";

import {
    expectNull,
    expectEqual,
    expectUndefined,
} from "../helpers";

describe("SwapPools Tests", function(this: Mocha.Suite) {
    describe("Test SwapPool getters for network", function(this: Mocha.Suite) {
        interface TestCase {
            chainId:            number,
            wantStableSwapPool: boolean,
            wantEthSwapPool:    boolean,
        }

        const makeTestCase = (c: number, s: boolean, e: boolean): TestCase => ({
            chainId:            c,
            wantStableSwapPool: s,
            wantEthSwapPool:    e,
        })

        const testCases: TestCase[] = [
            makeTestCase(ChainId.ETH,       true,  false),
            makeTestCase(ChainId.OPTIMISM,  false, true),
            makeTestCase(ChainId.CRONOS,    false, false),
            makeTestCase(ChainId.BSC,       true,  false),
            makeTestCase(ChainId.POLYGON,   true,  false),
            makeTestCase(ChainId.FANTOM,    true,  true),
            makeTestCase(ChainId.BOBA,      true,  true),
            makeTestCase(ChainId.METIS,     false, false),
            makeTestCase(ChainId.MOONBEAM,  false, false),
            makeTestCase(ChainId.MOONRIVER, false, false),
            makeTestCase(ChainId.ARBITRUM,  true,  true),
            makeTestCase(ChainId.AVALANCHE, true,  true),
            makeTestCase(ChainId.AURORA,    true,  false),
            makeTestCase(ChainId.HARMONY,   true,  true),
        ];

        const makeShouldHaveString = (want: boolean): string => `${want ? "should" : "should not"} have a(n)`

        const makeTestTitles = (tc: TestCase): [string, string] => {
            const testPrefix: string = `${Networks.networkName(tc.chainId)}`;
            const
                stableSwapTestTitle: string = `${testPrefix} ${makeShouldHaveString(tc.wantStableSwapPool)} stableswap pool token`,
                ethSwapTestTitle:    string = `${testPrefix} ${makeShouldHaveString(tc.wantEthSwapPool)} ethswap pool token`;

            return [stableSwapTestTitle, ethSwapTestTitle]
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

        for (const tc of testCases) {
            const [stableSwapTestTitle, ethSwapTestTitle] = makeTestTitles(tc);

            it(stableSwapTestTitle, testFn(tc, true))
            it(ethSwapTestTitle,    testFn(tc, false))
        }
    })

    describe("SwapPoolToken properties tests", function(this: Mocha.Suite) {
        interface TestCase {
            testName:     string,
            chainId:      number,
            swapPool:     SwapPools.SwapPoolToken,
            wantSymbol:   string,
            wantSwapType: SwapType,
            wantAddress:  string|null,
            wantDecimals: number|null
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
            }
        ];

        const wantValStr = (tc: TestCase, wantVal: any|null): string =>
            `${wantVal === null ? "'null'" : "'"+wantVal+"'"} for Chain ID ${tc.chainId}`

        for (const tc of testCases) {
            const poolName: string = tc.swapPool.poolName;

            it(`${tc.testName}: symbol should equal ${tc.wantSymbol}`, function(this: Mocha.Context) {
                expectEqual(tc.swapPool.symbol, tc.wantSymbol);
            })

            it(`${tc.testName}: swapType should equal ${tc.wantSwapType}`, function(this: Mocha.Context) {
                expectEqual(tc.swapPool.swapType, tc.wantSwapType);
            })

            it(`${tc.testName}: address() should return ${wantValStr(tc, tc.wantAddress)}`, function(this: Mocha.Context) {
                expectNull(tc.swapPool.address(tc.chainId), tc.wantAddress === null)
            })

            it(`${tc.testName}: decimals() should return ${wantValStr(tc, tc.wantDecimals)}`, function(this: Mocha.Context) {
                expectNull(tc.swapPool.decimals(tc.chainId), tc.wantDecimals === null)
            })
        }
    })
})