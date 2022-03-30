import {expect} from "chai";

import {step} from "mocha-steps";

import {
    type Token,
    ChainId,
    Networks,
    Tokens,
    TokenSwap,
    UnsupportedSwapErrors
} from "@sdk";

import {rejectPromise} from "@sdk/common/utils";

import {
    DEFAULT_TEST_TIMEOUT,
    expectFulfilled,
    expectRejected,
    getTestAmount,
} from "@tests/helpers";

import {Zero}         from "@ethersproject/constants";
import {BigNumber}    from "@ethersproject/bignumber";
import {BaseContract} from "@ethersproject/contracts";


import UnsupportedSwapError = UnsupportedSwapErrors.UnsupportedSwapError;


describe("TokenSwap -- Asynchronous Tests", function(this: Mocha.Suite) {
    describe("calculateSwapRate() tests", function(this: Mocha.Suite) {
        interface TestCase {
            chainId:   number;
            tokenFrom: Token;
            tokenTo:   Token;
            amountIn:  BigNumber;
            wantError: boolean;
        }

        const makeTestCase = (c: number, t1: Token, t2: Token, amt?: string, wantError?: boolean): TestCase =>
            ({
                chainId:   c,
                tokenFrom: t1,
                tokenTo:   t2,
                amountIn:  getTestAmount(t1, c, amt),
                wantError: wantError ?? false,
            });

        [
            makeTestCase(ChainId.ETH,        Tokens.DAI,        Tokens.USDC),
            makeTestCase(ChainId.ETH,        Tokens.ETH,        Tokens.NETH, null, true),
            makeTestCase(ChainId.OPTIMISM,   Tokens.WETH,       Tokens.NETH),
            makeTestCase(ChainId.BSC,        Tokens.BUSD,       Tokens.USDT),
            makeTestCase(ChainId.BSC,        Tokens.NUSD,       Tokens.BUSD),
            makeTestCase(ChainId.BSC,        Tokens.NUSD,       Tokens.DAI,  null, true),
            makeTestCase(ChainId.ARBITRUM,   Tokens.NEWO,       Tokens.UST,  null, true),
        ].forEach((tc: TestCase) => {
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
                }))
                    .then((res) => {
                        amountOut = res.amountOut;
                        return res
                    })
                    .catch(rejectPromise)

                if (tc.wantError) {
                    let err: Error;
                    try {
                        await prom;
                    } catch (e) {
                        err = e;
                    }

                    if (err instanceof UnsupportedSwapError) {
                        expect(err).to.be.an.instanceof(UnsupportedSwapError).and.to.haveOwnProperty("errorKind");
                    }

                    return (await expect(prom).to.eventually.be.rejected)
                }


                return (await expect(prom).to.eventually
                        .haveOwnProperty("amountOut")
                        .that.is.an.instanceOf(BigNumber)
                        .and.is.gt(Zero.toNumber())
                    )
            });

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
            });

            step(testTitle3, async function(this: Mocha.Context) {
                this.timeout(DEFAULT_TEST_TIMEOUT);

                let prom = TokenSwap.swapSetup(
                    tc.tokenFrom,
                    tc.tokenTo,
                    tc.chainId,
                );

                try {
                    let res = await prom;
                    expect(res).to.have.property("swapInstance");
                    expect(res.swapInstance).to.be.an.instanceof(BaseContract);
                    return
                } catch (e) {
                    if (tc.wantError) {
                        return (await expect(prom).to.eventually.be.rejected);
                    } else {
                        expect.fail(e);
                    }
                }
            });
        });
    });
});