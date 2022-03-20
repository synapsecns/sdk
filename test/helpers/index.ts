import {expect} from "chai";

import {shuffle} from "lodash-es";

import {Bridge, ChainId, Networks, type Token} from "@sdk";
import {rpcProviderForChain, terraRpcProvider} from "@sdk/internal";

import {bridgeInteractionsPrivkey} from "../synapsebridge/bridge_test_utils";

import {Zero}   from "@ethersproject/constants";
import {Wallet as EvmWallet} from "@ethersproject/wallet";

import {
    BigNumber,
    type BigNumberish
} from "@ethersproject/bignumber";

import {
    RawKey,
    Wallet as TerraWallet
} from "@terra-money/terra.js";

const TEN_BN: BigNumber = BigNumber.from(10);

const testAmounts: string[] = [
    "420", "1337", "31337",
    "669", "555",
];

const
    liveBridgeTestsEnvKey: string = "TEST_IT_IN_PROD",
    liveBridgeTestsEnvVal: string = "never tell me the odds";

export const RunLiveBridgeTests: boolean = (liveBridgeTestsEnvKey in process.env && process.env[liveBridgeTestsEnvKey] === liveBridgeTestsEnvVal);

export const
    makeTimeout      = (seconds: number): number => seconds * 1000,
    valueIfUndefined = <T>(data: T, fallback: T): T => typeof data === "undefined" ? fallback : data,
    getActualWei     = (n: BigNumber, decimals: number): BigNumber => n.mul(TEN_BN.pow(18 - decimals));

export const getTestAmount = (
    t: Token,
    c: number,
    amt?: BigNumberish
): BigNumber => t.etherToWei(amt ?? shuffle(testAmounts)[0], c);

export const makeWalletSignerWithProvider = (
    chainId: number,
    privKey: string
): EvmWallet => new EvmWallet(privKey, rpcProviderForChain(chainId));

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
    ): Chai.PromisedAssertion => wantResolve ? expectFulfilled(data) : expectRejected(data),
    expectNothingFromPromise = async (data: Promise<any>): Promise<Chai.PromisedAssertion> => {
        let promReturned: boolean = false;

        if (!data) {
            return expectToEventuallyBe(data).undefined
        }

        const promFn = (): void  => { promReturned = true; }

        await Promise.resolve(data)
            .then(promFn)
            .catch(promFn);

        return expect(promReturned).to.be.true
    }

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

export function skipDescribeIf(condition: boolean): Mocha.SuiteFunction | Mocha.PendingSuiteFunction {
    return condition
        ? describe.skip
        : describe
}

export function wrapExpect(expectFn: Chai.Assertion): Mocha.Func {
    return function(this: Mocha.Context): void {
        expect(expectFn);
    }
}

export interface WalletArgs {
    wallet:         EvmWallet | TerraWallet;
    address:        string;
    evmAddress:     string;
    terraAddress:   string;
    bridgeInstance: Bridge.SynapseBridge;
}

export function buildWalletArgs(chainId: number, privkey: string=bridgeInteractionsPrivkey.privkey): WalletArgs {
    const
        _terra = chainId === ChainId.TERRA,
        _evmChainId = _terra ? ChainId.ETH : chainId,
        evmWallet:   EvmWallet   = makeWalletSignerWithProvider(_evmChainId, privkey),
        terraWallet: TerraWallet = terraRpcProvider(ChainId.TERRA).wallet(new RawKey(
            Buffer.from(
                process.env["BRIDGE_INTERACTIONS_PRIVKEY_TERRA"] || "",
                "hex"
            )
        ));

    const
        wallet       = _terra ? terraWallet : evmWallet,
        evmAddress   = evmWallet.address,
        terraAddress = terraWallet.key.accAddress,
        address      = _terra ? terraAddress : evmAddress;

    return {
        wallet,
        address,
        evmAddress,
        terraAddress,
        bridgeInstance: new Bridge.SynapseBridge({ network: Networks.fromChainId(chainId) })
    }
}