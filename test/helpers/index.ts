import "./chaisetup";

import _ from "lodash";

import {expect} from "chai";

import {Wallet} from "@ethersproject/wallet";
import {JsonRpcProvider} from "@ethersproject/providers";
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";

import {Token, ChainId} from "../../src";
import {newProviderForNetwork} from "../../src/internal/rpcproviders";


const TEN_BN: BigNumber = BigNumber.from(10);

const testAmounts: string[] = [
    "420", "1337", "31337",
    "669", "555",
];

export const getTestAmount = (t: Token, c: number, amt?: BigNumberish): BigNumber => t.valueToWei(amt ?? _.shuffle(testAmounts)[0], c)

export function makeWalletSignerWithProvider(chainId: number, privKey: string): Wallet {
    const provider = newProviderForNetwork(chainId);

    return new Wallet(privKey, provider);
}

export const getActualWei = (n: BigNumber, decimals: number): BigNumber => n.mul(TEN_BN.pow(18 - decimals))

export interface TestProvider {
    chainId:  number,
    provider: JsonRpcProvider,
}

const makeTestProvider = (chainId: number): TestProvider => ({ chainId, provider: newProviderForNetwork(chainId) })

export const
    PROVIDER_ETHEREUM:  TestProvider = makeTestProvider(ChainId.ETH),
    PROVIDER_OPTIMISM:  TestProvider = makeTestProvider(ChainId.OPTIMISM),
    PROVIDER_BSC:       TestProvider = makeTestProvider(ChainId.BSC),
    PROVIDER_FANTOM:    TestProvider = makeTestProvider(ChainId.FANTOM),
    PROVIDER_BOBA:      TestProvider = makeTestProvider(ChainId.BOBA),
    PROVIDER_MOONRIVER: TestProvider = makeTestProvider(ChainId.MOONRIVER),
    PROVIDER_AVALANCHE: TestProvider = makeTestProvider(ChainId.AVALANCHE),
    PROVIDER_AURORA:    TestProvider = makeTestProvider(ChainId.AURORA),
    PROVIDER_HARMONY:   TestProvider = makeTestProvider(ChainId.HARMONY);

export interface TestCase<T> {
    chainId:       number,
    provider:      JsonRpcProvider,
    expected?:     T,
    name?:         string,
    args?:         any | any[]
}

export type TestFunction<Entity> = (entity: Entity, tc: TestCase<any>) => () => void;
export type EntityFactory<Entity> = (n: number, provider: JsonRpcProvider) => Entity;

export function runTestCases(
    tests: TestCase<any>[],
    entityFactory: EntityFactory<any>,
    func: TestFunction<any>
) {
    tests.forEach((tc) => {
        const
            instance = entityFactory(tc.chainId, tc.provider),
            title: string = tc.name || `should equal ${tc.expected.toString()} on chain id ${tc.chainId}`;

        it(title, func(instance, tc));
    })
}

export namespace ExpectBN {
    const
        awaitEq  = (check: BigNumberish) => (res: BigNumber) => res.eq(check),
        awaitGt  = (check: BigNumberish) => (res: BigNumber) => res.gt(check),
        awaitGte = (check: BigNumberish) => (res: BigNumber) => res.gte(check),
        awaitLt  = (check: BigNumberish) => (res: BigNumber) => res.lt(check),
        awaitLte = (check: BigNumberish) => (res: BigNumber) => res.lte(check);

    export function eq(got: Promise<BigNumber>, check: BigNumberish) {
        expect( got.then( awaitEq(check) ) )
            .to.eventually.be.true;
    }

    export function neq(got: Promise<BigNumber>, check: BigNumberish) {
        expect( got.then( awaitEq(check) ) )
            .to.eventually.be.false;
    }

    export function notZero(got: Promise<BigNumber>) {
        expect( got.then( awaitGt(0) ) )
            .to.eventually.be.true;
    }

    export function gt(got: Promise<BigNumber>, check: BigNumberish) {
        expect( got.then( awaitGt(check) ) )
            .to.eventually.be.true;
    }

    export function gte(got: Promise<BigNumber>, check: BigNumberish) {
        expect( got.then( awaitGte(check) ) )
            .to.eventually.be.true;
    }

    export function lt(got: Promise<BigNumber>, check: BigNumberish) {
        expect( got.then( awaitLt(check) ) )
            .to.eventually.be.true;
    }

    export function lte(got: Promise<BigNumber>, check: BigNumberish) {
        expect( got.then( awaitLte(check) ) )
            .to.eventually.be.true;
    }
}