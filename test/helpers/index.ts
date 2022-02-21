import "./chaisetup";

import {expect} from "chai";

import _ from "lodash";
import {Wallet} from "@ethersproject/wallet";
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";

import {Token} from "../../src";
import {newProviderForNetwork} from "../../src/internal/rpcproviders";

const TEN_BN: BigNumber = BigNumber.from(10);

const testAmounts: string[] = [
    "420", "1337", "31337",
    "669", "555",
];

export const
    makeTimeout = (seconds: number): number => seconds * 1000,
    doneWithError = (
        e:    any,
        done: Mocha.Done
    ) => done(e instanceof Error ? e : new Error(e)),
    getActualWei = (
        n:        BigNumber,
        decimals: number
    ): BigNumber => n.mul(TEN_BN.pow(18 - decimals)),
    getTestAmount = (
        t:    Token,
        c:    number,
        amt?: BigNumberish
    ): BigNumber => t.valueToWei(amt ?? _.shuffle(testAmounts)[0], c),
    makeWalletSignerWithProvider = (
        chainId: number,
        privKey: string
    ): Wallet => new Wallet(privKey, newProviderForNetwork(chainId));


export const
    DEFAULT_TEST_TIMEOUT   = makeTimeout(10),
    SHORT_TEST_TIMEOUT     = makeTimeout(4.5),
    EXECUTORS_TEST_TIMEOUT = makeTimeout(180);

const
    expectTo             = (data: any): Chai.Assertion => expect(data).to,
    expectToNot          = (data: any): Chai.Assertion => expectTo(data).not,
    expectToBe           = (data: any): Chai.Assertion => expectTo(data).be,
    expectToNotBe        = (data: any): Chai.Assertion => expectToNot(data).be,
    expectToEventuallyBe = (data: Promise<any>): Chai.PromisedAssertion => expectTo(data).eventually.be;

const
    toOrNotTo     = (data: any, wantTo: boolean): Chai.Assertion => wantTo ? expectTo(data)   : expectToNot(data),
    toBeOrNotToBe = (data: any, wantBe: boolean): Chai.Assertion => wantBe ? expectToBe(data) : expectToNotBe(data);

export const
    expectFulfilled      = (data: Promise<any>): Chai.PromisedAssertion => expectToEventuallyBe(data).fulfilled,
    expectRejected       = (data: Promise<any>): Chai.PromisedAssertion => expectToEventuallyBe(data).rejected,
    expectPromiseResolve = (
        data: Promise<any>,
        wantResolve: boolean
    ): Chai.PromisedAssertion => wantResolve ? expectFulfilled(data) : expectRejected(data);

export const
    expectBoolean   = (data: boolean, want:      boolean):             Chai.Assertion => expectToBe(data)[want ? "true" : "false"],
    expectNull      = (data: any,     wantNull:  boolean):             Chai.Assertion => toBeOrNotToBe(data, wantNull).null,
    expectUndefined = (data: any,     wantUndef: boolean):             Chai.Assertion => toBeOrNotToBe(data, wantUndef).undefined,
    expectProperty  = (data: any,     want: string):                   Chai.Assertion => expectTo(data).have.property(want),
    expectEqual     = (data: any,     want: any,     errMsg?: string): Chai.Assertion => expectTo(data).equal(want, errMsg),
    expectLength    = (data: any[],   want: number,  errMsg?: string): Chai.Assertion => expectTo(data).have.a.lengthOf(want, errMsg),
    expectIncludes  = (
        data:         any,
        check:        any,
        wantIncludes: boolean,
        errMsg?:      string
    ): Chai.Assertion => toOrNotTo(data, wantIncludes).include(check, errMsg);

export const
    expectGt      = (data: BigNumber, want: BigNumberish): Chai.Assertion => expectToBe(data).gt(want),
    expectGte     = (data: BigNumber, want: BigNumberish): Chai.Assertion => expectToBe(data).gte(want),
    expectBnEqual = (data: BigNumber, want: BigNumberish): Chai.Assertion => expectTo(data).equal(want),
    expectZero    = (data: BigNumber): Chai.Assertion => expectBnEqual(data, Zero),
    expectGteZero = (data: BigNumber): Chai.Assertion => expectGte(data, Zero),
    expectNotZero = (data: BigNumber): Chai.Assertion => expectGt(data, Zero);

export function wrapExpect(expectFn: Chai.Assertion): Mocha.Func {
    return function(this: Mocha.Context): void {
        expect(expectFn);
    }
}