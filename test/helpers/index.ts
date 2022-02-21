import "./chaisetup";

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

export const getTestAmount = (t: Token, c: number, amt?: BigNumberish): BigNumber => t.valueToWei(amt ?? _.shuffle(testAmounts)[0], c)

export function makeWalletSignerWithProvider(chainId: number, privKey: string): Wallet {
    const provider = newProviderForNetwork(chainId);

    return new Wallet(privKey, provider);
}

export const getActualWei = (n: BigNumber, decimals: number): BigNumber => n.mul(TEN_BN.pow(18 - decimals))