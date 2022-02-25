import "../helpers/chaisetup";

import {step} from "mocha-steps";

import {Zero} from "@ethersproject/constants";
import {BigNumber} from "@ethersproject/bignumber";
import {Contract} from "ethers";

import type {Token} from "@token";
import {
    ChainId,
    Networks,
    Tokens,
    TokenSwap,
    supportedChainIds,
} from "@sdk";

import {
    DEFAULT_TEST_TIMEOUT,
    wrapExpect,
    getTestAmount,
    expectRejected,
    expectFulfilled,
    expectProperty,
    expectLength,
    expectUndefined,
} from "../helpers";


describe("TokenSwap tests", function(this: Mocha.Suite) {
    describe("Swap Rate tests", function(this: Mocha.Suite) {
        interface TestCase {
            chainId:   number,
            tokenFrom: Token,
            tokenTo:   Token,
            amountIn:  BigNumber,
            wantError: boolean,
        }

        const makeTestCase = (c: number, t1: Token, t2: Token, amt?: string, wantError?: boolean): TestCase =>
            ({
                chainId:   c,
                tokenFrom: t1,
                tokenTo:   t2,
                amountIn:  getTestAmount(t1, c, amt),
                wantError: wantError ?? false,
            })

        const testCases: TestCase[] = [
            makeTestCase(ChainId.ETH,        Tokens.DAI,        Tokens.USDC),
            makeTestCase(ChainId.ETH,        Tokens.ETH,        Tokens.NETH, null, true),
            makeTestCase(ChainId.OPTIMISM,   Tokens.WETH,       Tokens.NETH),
            makeTestCase(ChainId.AVALANCHE,  Tokens.MIM,        Tokens.USDT, null, true),
            makeTestCase(ChainId.BSC,        Tokens.BUSD,       Tokens.USDT),
            makeTestCase(ChainId.BSC,        Tokens.NUSD,       Tokens.BUSD),
        ]

        for (const tc of testCases) {
            const
                titleSuffix: string = tc.wantError ? "should fail" : "should pass",
                tokFrom: string     = tc.tokenFrom.symbol,
                tokTo: string       = tc.tokenTo.symbol,
                testTitle: string   = `for ${tokFrom} => ${tokTo} on ${Networks.networkName(tc.chainId)} ${titleSuffix}`,
                testTitle1: string  = `calculateSwapRate ${testTitle}`,
                testTitle2: string  = `buildSwapTokensTransaction ${testTitle}`,
                testTitle3: string  = `swapSetup ${testTitle}`;

            let amountOut: BigNumber;

            step(testTitle1, async function(this: Mocha.Context) {
                this.timeout(DEFAULT_TEST_TIMEOUT);

                let prom: Promise<TokenSwap.EstimatedSwapRate> = Promise.resolve(TokenSwap.calculateSwapRate({
                    chainId:   tc.chainId,
                    tokenFrom: tc.tokenFrom,
                    tokenTo:   tc.tokenTo,
                    amountIn:  tc.amountIn,
                })).then((res) => {
                    amountOut = res.amountOut;
                    return res
                });

                return tc.wantError
                    ? await expectRejected(prom)
                    : expectProperty(await prom, "amountOut").that.is.gt(Zero.toNumber())
            })

            step(testTitle2, async function(this: Mocha.Context) {
                if (tc.wantError) return

                this.timeout(DEFAULT_TEST_TIMEOUT);

                const args: TokenSwap.SwapTokensParams = {
                    ...tc,
                    minAmountOut: amountOut,
                };

                return (await expectFulfilled(
                    TokenSwap.buildSwapTokensTransaction(args)
                ))
            })

            step(testTitle3, async function(this: Mocha.Context) {
                this.timeout(DEFAULT_TEST_TIMEOUT);

                let prom = TokenSwap.swapSetup(
                    tc.tokenFrom, 
                    tc.tokenTo, 
                    tc.chainId,
                )

                return tc.wantError
                    ? await expectRejected(prom)
                    : expectProperty(await prom, "swapInstance").that.is.instanceof(Contract)
            })
        }
    })

    describe("detailedTokenSwapMap test", function(this: Mocha.Suite) {
        const
            allChains   = supportedChainIds(),
            detailedMap = TokenSwap.detailedTokenSwapMap();

        it(`should have ${allChains.length} entries`, function() {
            expectLength(Object.keys(detailedMap), allChains.length);
        })

        interface TokenOnChain {
            chainId: ChainId,
            token:   Token,
        }

        interface TestCase {
            chainId:       ChainId,
            chainTokens:   TokenOnChain[],
        }

        const testCases: TestCase[] = [
            {
                chainId:       ChainId.BSC,
                chainTokens:   [
                    {chainId: ChainId.ETH,       token: Tokens.USDT},
                    {chainId: ChainId.ETH,       token: Tokens.BUSD},
                    {chainId: ChainId.AVALANCHE, token: Tokens.NUSD},
                    {chainId: ChainId.HARMONY,   token: Tokens.GOHM},
                ],
            },
            {
                chainId:       ChainId.ETH,
                chainTokens:   [
                    {chainId: ChainId.BSC,       token: Tokens.USDC},
                    {chainId: ChainId.AVALANCHE, token: Tokens.GOHM},
                    {chainId: ChainId.AVALANCHE, token: Tokens.NUSD},
                    {chainId: ChainId.HARMONY,   token: Tokens.GOHM},
                ],
            },
            {
                chainId:       ChainId.FANTOM,
                chainTokens:   [
                    {chainId: ChainId.AVALANCHE, token: Tokens.FTM_ETH},
                    {chainId: ChainId.BSC,       token: Tokens.MIM},
                    {chainId: ChainId.AVALANCHE, token: Tokens.NUSD},
                    {chainId: ChainId.HARMONY,   token: Tokens.GOHM},
                ],
            }
        ];

        const findTokenMap = (
            tok:     Token,
            toksMap: {[p: number]: Token[], token: Token}[]
        ): {[p: number]: Token[], token: Token} | undefined =>
            toksMap.find((sm) => sm.token.isEqual(tok))


        for (const tc of testCases) {
            const describeTitle: string = `${Networks.networkName(tc.chainId)} needs certain results`;

            describe(describeTitle, function(this: Mocha.Suite) {
                const toksMap = detailedMap[tc.chainId];

                it(
                    `detailedMap[${tc.chainId}] should not be undefined`,
                    wrapExpect(expectUndefined(toksMap, false))
                )

                for (const tok of tc.chainTokens) {
                    const
                        testTitle: string = `should be able to send token ${tok.token.name} to ${Networks.networkName(tok.chainId)}`,
                        tokMap            = findTokenMap(tok.token, toksMap);

                    it(
                        testTitle,
                        wrapExpect(expectProperty(tokMap, tok.chainId.toString()))
                    )
                }
            })
        }
    })
})