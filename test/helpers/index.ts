import "./chaisetup";

import {expect} from "chai";

import {Wallet} from "@ethersproject/wallet";
import {JsonRpcProvider} from "@ethersproject/providers";
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";

import {ChainId} from "../../src";
import {newProviderForNetwork} from "../../src/rpcproviders";

export function makeWalletSignerWithProvider(chainId: number, privKey: string): Wallet {
    const provider = newProviderForNetwork(chainId);

    return new Wallet(privKey, provider);
}

export const
    PROVIDER_ETHEREUM  = {chainId: ChainId.ETH,       provider: newProviderForNetwork(ChainId.ETH)       },
    PROVIDER_BSC       = {chainId: ChainId.BSC,       provider: newProviderForNetwork(ChainId.BSC)       },
    PROVIDER_FANTOM    = {chainId: ChainId.FANTOM,    provider: newProviderForNetwork(ChainId.FANTOM)    },
    PROVIDER_BOBA      = {chainId: ChainId.BOBA,      provider: newProviderForNetwork(ChainId.BOBA)      },
    PROVIDER_MOONRIVER = {chainId: ChainId.MOONRIVER, provider: newProviderForNetwork(ChainId.MOONRIVER) };

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