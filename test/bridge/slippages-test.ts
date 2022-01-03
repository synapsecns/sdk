import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { Slippages } from "../../src";
import {BigNumberish} from "ethers";

describe("Slippages tests", function(this: Mocha.Suite) {
    interface TestCase {
        func:    (BigNumber, string) => BigNumber,
        value:    BigNumber,
        slippage: string,
        expected: BigNumber,
    }

    describe("_applySlippage", function(this: Mocha.Suite) {
        const makeTitle = (tc: TestCase): string => `value of ${tc.value.toString()} with slippage of ${tc.slippage} should return ${tc.expected.toString()}`

        let testCases: TestCase[] = [
            {
                func:     Slippages._applySlippage,
                value:    BigNumber.from(69420),
                slippage: "foo", // This should default to 1% slippage -> (value - value * 0.01).
                expected: BigNumber.from(68725),
            },
            {
                func:     Slippages._applySlippage,
                value:    BigNumber.from(1337),
                slippage: "TWO_TENTH",
                expected: BigNumber.from(1334),
            },
            {
                func:     Slippages._applySlippage,
                value:    BigNumber.from(101),
                slippage: Slippages.Quarter,
                expected: BigNumber.from(98),
            }
        ]

        testCases.forEach((tc: TestCase) => {
            it(makeTitle(tc), () => expect(tc.func(tc.value, tc.slippage)._hex).to.equal(tc.expected._hex))
        })
    })

    describe("addSlippage", function(this: Mocha.Suite) {
        const value = 69420;
        const ret = Slippages.addSlippage(BigNumber.from(value), Slippages.OneTenth);
        expect(ret._hex).to.equal(BigNumber.from(69489)._hex);

        it("_applySlippage with add=true vs add=false", () => {
            const ret1 = Slippages._applySlippage(BigNumber.from(value), Slippages.OneTenth);
            expect(ret.sub(ret1)._hex).to.equal(BigNumber.from(0x8b)._hex);
        })
    })

    describe("formatSlippageToString", function(this: Mocha.Suite) {
        it("Slippages.One should return 1.0", () =>
            expect(Slippages.formatSlippageToString(Slippages.One)).to.equal("1.0")
        )
        
        it("Slippages.OneTenth should return 0.1", () =>
            expect(Slippages.formatSlippageToString(Slippages.OneTenth)).to.equal("0.1")
        )

        it("Slippages.TwoTenth should return 0.2", () =>
            expect(Slippages.formatSlippageToString(Slippages.TwoTenth)).to.equal("0.2")
        )

        it("Slippages.Quarter should return 2.0", () =>
            expect(Slippages.formatSlippageToString(Slippages.Quarter)).to.equal("2.0")
        )

        it("foo should return N/A", () =>
            expect(Slippages.formatSlippageToString("foo")).to.equal("N/A")
        )
    })
})
