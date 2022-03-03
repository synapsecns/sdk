import "@tests/setup";

import {expect} from "chai";

import {Slippages} from "@sdk";

import {expectEqual} from "@tests/helpers";

import {BigNumber} from "@ethersproject/bignumber";

describe("Slippages tests", function(this: Mocha.Suite) {
    interface TestCase {
        func:    (BigNumber, string) => BigNumber,
        value:    BigNumber,
        slippage: string,
        expected: BigNumber,
    }

    describe("_applySlippage", function(this: Mocha.Suite) {
        const makeTitle = (tc: TestCase): string =>
            `value of ${tc.value.toString()} with slippage of ${tc.slippage} should return ${tc.expected.toString()}`;

        [
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
        ].forEach((tc: TestCase) => {
            it(makeTitle(tc), function(this: Mocha.Context) {
                expect(tc.func(tc.value, tc.slippage)._hex).to.equal(tc.expected._hex);
            })
        })
    })

    describe("addSlippage", function(this: Mocha.Suite) {
        const value = 69420;
        const ret = Slippages.addSlippage(BigNumber.from(value), Slippages.OneTenth);
        expect(ret._hex).to.equal(BigNumber.from(69489)._hex);

        it("_applySlippage with add=true vs add=false", function(this: Mocha.Context) {
            const ret1 = Slippages._applySlippage(BigNumber.from(value), Slippages.OneTenth);
            expect(ret.sub(ret1)._hex).to.equal(BigNumber.from(0x8b)._hex);
        })
    })

    describe("formatSlippageToString", function(this: Mocha.Suite) {
        interface formatTestCase {
            slippage:     string,
            slippageName: string,
            want:         string,
        }

        [
            {slippage: Slippages.One,      slippageName: "Slippages.One",      want: "1.0"},
            {slippage: Slippages.OneTenth, slippageName: "Slippages.OneTenth", want: "0.1"},
            {slippage: Slippages.TwoTenth, slippageName: "Slippages.TwoTenth", want: "0.2"},
            {slippage: Slippages.Quarter,  slippageName: "Slippages.Quarter",  want: "2.0"},
            {slippage: "foo",              slippageName: "foo",                want: "N/A"},
        ].forEach((tc: formatTestCase) => {
            const testTitle: string = `${tc.slippageName} should return ${tc.want}`;

            it(testTitle, function(this: Mocha.Context) {
                expectEqual(Slippages.formatSlippageToString(tc.slippage), tc.want);
            })
        })
    })
})
