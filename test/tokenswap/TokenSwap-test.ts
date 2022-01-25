import "../helpers/chaisetup";

import {expect} from "chai";
import {Context, Done} from "mocha";

import {step} from "mocha-steps";

import {Zero} from "@ethersproject/constants";
import {BigNumber} from "@ethersproject/bignumber";

import {
    ChainId,
    Networks,
    Token,
    Tokens,
    TokenSwap,
} from "../../src";

import {getTestAmount} from "../helpers";
import {PopulatedTransaction} from "ethers";

describe("TokenSwap tests", function(this: Mocha.Suite) {
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
            netName: string     = Networks.fromChainId(tc.chainId).name,
            titleSuffix: string = tc.wantError ? "should fail" : "should pass",
            tokFrom: string     = tc.tokenFrom.symbol,
            tokTo: string       = tc.tokenTo.symbol,
            testTitle: string   = `for ${tokFrom} => ${tokTo} on ${netName} ${titleSuffix}`,
            testTitle1: string  = `calculateSwapRate ${testTitle}`,
            testTitle2: string  = `buildSwapTokensTransaction ${testTitle}`;

        let amountOut: BigNumber;

        step(testTitle1, function(this: Context, done: Done) {
            this.timeout(10*1000);

            let prom: Promise<TokenSwap.EstimatedSwapRate> = TokenSwap.calculateSwapRate({
                chainId:   tc.chainId,
                tokenFrom: tc.tokenFrom,
                tokenTo:   tc.tokenTo,
                amountIn:  tc.amountIn,
            });

            Promise.resolve(prom).then((res) => amountOut = res.amountOut);

            tc.wantError
                ? expect(prom).to.eventually.be.rejected.notify(done)
                : expect(prom).to.eventually.have.property('amountOut').that.is.gt(Zero).notify(done);
        })

        step(testTitle2, function(this: Context, done: Done) {
            this.timeout(10*1000);

            if (!tc.wantError) {
                const args: TokenSwap.SwapTokensParams = {
                    ...tc,
                    minAmountOut: amountOut,
                };

                let prom: Promise<PopulatedTransaction> = TokenSwap.buildSwapTokensTransaction(args);
                expect(prom).to.eventually.be.fulfilled.notify(done);
                return
            }

            done();
        })
    }
})