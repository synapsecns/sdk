import type {Token} from "@token";
import {Networks}   from "@networks";

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