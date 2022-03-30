import dotenv from "dotenv";

import {
    Networks,
    type Token
} from "@sdk";

import {BigNumber} from "@ethersproject/bignumber";

dotenv.config();

const makeTestPrivkeyEnvKeys = (name: string): [string, string] => {
    const k: string = name + "_PRIVKEY";
    return [k, k + "_ADDRESS"]
}

export interface TestPrivKey {
    address: string;
    privkey: string;
}

function loadTestPrivkey(name: string): TestPrivKey {
    const [privkeyEnv, addrEnv] = makeTestPrivkeyEnvKeys(name);

    return {
        address: process.env[addrEnv]    || "",
        privkey: process.env[privkeyEnv] || "",
    }
}

export const
    infiniteApprovalsPrivkey:  TestPrivKey = loadTestPrivkey("INFINITE_APPROVALS"),
    bridgeInteractionsPrivkey: TestPrivKey = loadTestPrivkey("BRIDGE_INTERACTIONS");

export interface BridgeSwapTestArgs {
    chainIdFrom: number;
    chainIdTo:   number;
    tokenFrom:   Token;
    tokenTo:     Token;
    amountFrom:  BigNumber;
    execute?:    boolean;
}

export interface BridgeSwapTestCase<T> {
    args:     BridgeSwapTestArgs;
    expected: T;
}

export function makeBridgeSwapTestCase<T>(
    chainIdFrom: number|Networks.Network,
    tokenFrom:   Token,
    chainIdTo:   number|Networks.Network,
    tokenTo:     Token,
    expected:    T,
    amountFrom:  BigNumber=BigNumber.from(0),
    execute:     boolean=true,
): BridgeSwapTestCase<T> {
    const
        c1 = chainIdFrom instanceof Networks.Network ? chainIdFrom.chainId : chainIdFrom,
        c2 = chainIdTo   instanceof Networks.Network ? chainIdTo.chainId   : chainIdTo;

    return {args: {chainIdFrom: c1, tokenFrom, chainIdTo: c2, tokenTo, amountFrom, execute}, expected}
}