import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { Slippages } from "../../src";

describe("Slippages tests", function(this: Mocha.Suite) {
    describe("_applySlippage", function(this: Mocha.Suite) {        
        it("value of 69420 with 1% slippage should return 68725", () => {
            const ret = Slippages._applySlippage(BigNumber.from(69420), "foo");
            // This should default to 1% slippage -> (value - value * 0.01).
            expect(ret._hex).to.equal(BigNumber.from(68725)._hex);
        })

        it("value of 1337 with TWO_TENTH slippage should return 1334", () => {
            const ret = Slippages._applySlippage(BigNumber.from(1337), "TWO_TENTH");
            expect(ret._hex).to.equal(BigNumber.from(1334)._hex);
        })

        it("value of 101 with QUARTER slippage should return 98", () => {
            const ret = Slippages._applySlippage(BigNumber.from(101), Slippages.Quarter);
            expect(ret._hex).to.equal(BigNumber.from(98)._hex);
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
        it("Slippages.One should return 1.0", () => {
            expect(Slippages.formatSlippageToString(Slippages.One)).to.equal("1.0");
        })
        
        it("Slippages.OneTenth should return 0.1", () => {
            expect(Slippages.formatSlippageToString(Slippages.OneTenth)).to.equal("0.1");
        })

        it("Slippages.TwoTenth should return 0.2", () => {
            expect(Slippages.formatSlippageToString(Slippages.TwoTenth)).to.equal("0.2");
        })

        it("Slippages.Quarter should return 2.0", () => {
            expect(Slippages.formatSlippageToString(Slippages.Quarter)).to.equal("2.0");
        })

        it("foo should return N/A", () => {
            expect(Slippages.formatSlippageToString("foo")).to.equal("N/A");
        })
    })
})
