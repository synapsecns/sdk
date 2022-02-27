import "@tests/setup";

import {step} from "mocha-steps";

import {
    ChainId,
    Networks,
    Tokens,
    TokenSwap
} from "@sdk";

import type {Token} from "@sdk";

import {
    DEFAULT_TEST_TIMEOUT,
    expectFulfilled,
    expectProperty,
    expectRejected,
    getTestAmount,
} from "@tests/helpers";

import {Zero}      from "@ethersproject/constants";
import {BigNumber} from "@ethersproject/bignumber";
import {Contract}  from "@ethersproject/contracts";


describe("TokenSwap -- Asynchronous Tests", function(this: Mocha.Suite) {
    describe("calculateSwapRate() tests", function(this: Mocha.Suite) {
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
            makeTestCase(ChainId.BSC,        Tokens.NUSD,       Tokens.DAI,  undefined,true),
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
                this.timeout(DEFAULT_TEST_TIMEOUT);

                const args: TokenSwap.SwapTokensParams = {
                    ...tc,
                    minAmountOut: amountOut,
                };

                let prom = TokenSwap.buildSwapTokensTransaction(args);

                return (await (
                    tc.wantError
                        ? expectRejected(prom)
                        : expectFulfilled(prom)
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
})