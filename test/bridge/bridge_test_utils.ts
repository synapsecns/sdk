import {Networks, Token} from "../../src";
import {BigNumber} from "@ethersproject/bignumber";

export interface BridgeSwapTestArgs {
    chainIdFrom: number,
    chainIdTo:   number,
    tokenFrom:   Token,
    tokenTo:     Token,
    amountFrom:  BigNumber,
}

export interface BridgeSwapTestCase<T> {
    args:     BridgeSwapTestArgs,
    expected: T,
}

export function makeBridgeSwapTestCase<T>(
    chainIdFrom: number|Networks.Network,
    tokenFrom:   Token,
    chainIdTo:   number|Networks.Network,
    tokenTo:     Token,
    expected:    T,
    amountFrom:  BigNumber=BigNumber.from(0)
): BridgeSwapTestCase<T> {
    const
        c1 = chainIdFrom instanceof Networks.Network ? chainIdFrom.chainId : chainIdFrom,
        c2 = chainIdTo   instanceof Networks.Network ? chainIdTo.chainId   : chainIdTo;

    return {args: {chainIdFrom: c1, tokenFrom, chainIdTo: c2, tokenTo, amountFrom}, expected}
}

// Completely clean privkey with low balances.
export const bridgeTestPrivkey: string = "53354287e3023f0629b7a5e187aa1ca3458c4b7ff9d66a6e3f4b2e821aafded7";