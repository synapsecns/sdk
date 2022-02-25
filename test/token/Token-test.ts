import "@init";

import type {Token}       from "@sdk";
import {ChainId, Tokens,} from "@sdk";

import {BigNumber} from "@ethersproject/bignumber";
import {
    expectBnEqual,
    expectBoolean,
    expectNull,
    wrapExpect
} from "@helpers";

describe("Token Tests", function(this: Mocha.Suite) {
    describe("valueToWei tests", function(this: Mocha.Suite) {
        interface TestCase {
            token:     Token,
            chainId:   number,
            amount:     BigNumber | string,
            wantAmount: BigNumber,
        }

        const testCases: TestCase[] = [
            {
                token:      Tokens.NUSD,
                chainId:    ChainId.BSC,
                amount:     "225",
                wantAmount: BigNumber.from("225000000000000000000")
            },
            {
                token:      Tokens.NUSD,
                chainId:    ChainId.FANTOM,
                amount:     BigNumber.from("225"),
                wantAmount: BigNumber.from("225000000000000000000")
            },
            {
                token:      Tokens.USDC,
                chainId:    ChainId.ETH,
                amount:     "225",
                wantAmount: BigNumber.from("225000000")
            },
            {
                token:      Tokens.USDC,
                chainId:    ChainId.ETH,
                amount:     BigNumber.from("225"),
                wantAmount: BigNumber.from("225000000")
            },
        ];

        const makeTestTitle = (tc: TestCase): string =>
            `valueToWei(${tc.amount.toString()}) of token ${tc.token.symbol} on Chain ID ${tc.chainId} should return ${tc.wantAmount.toString()}`

        for (const tc of testCases) {
            it(makeTestTitle(tc), function(this: Mocha.Context) {
                const got: BigNumber = tc.token.valueToWei(tc.amount, tc.chainId);

                expectBnEqual(got, tc.wantAmount);
            })
        }
    })

    describe("canSwap tests", function(this: Mocha.Suite) {
        interface TestCase {
            tokenA:    Token,
            tokenB:    Token,
            expected:  boolean
        }

        const testCases: TestCase[] = [
            {
                tokenA:   Tokens.NUSD,
                tokenB:   Tokens.DAI,
                expected: true,
            },
            {
                tokenA:   Tokens.DAI,
                tokenB:   Tokens.ETH,
                expected: false,
            },
            {
                tokenA:   Tokens.NETH,
                tokenB:   Tokens.ETH,
                expected: true,
            },
            {
                tokenA:   Tokens.AVAX,
                tokenB:   Tokens.WAVAX,
                expected: true,
            },
            {
                tokenA:   Tokens.WMOVR,
                tokenB:   Tokens.GOHM,
                expected: false,
            },
        ];

        const makeTestTitle = (tc: TestCase): string =>
            `${tc.tokenA.symbol} should${!tc.expected ? " not": ""} be able to swap with ${tc.tokenB.symbol}`

        for (const tc of testCases) {
            it(
                makeTestTitle(tc),
                wrapExpect(
                    expectBoolean(tc.tokenA.canSwap(tc.tokenB), tc.expected)
                )
            )
        }
    })

    describe("wrapperAddress tests", function(this: Mocha.Suite) {
        interface TestCase {
            token:   Token,
            chainId: number,
            want:    string | null,
        }

        const testCases: TestCase[] = [
            {token: Tokens.GMX,  chainId: ChainId.AVALANCHE, want: "0x20A9DC684B4d0407EF8C9A302BEAaA18ee15F656"},
            {token: Tokens.GMX,  chainId: ChainId.BSC,       want: null},
            {token: Tokens.NUSD, chainId: ChainId.FANTOM,    want: null},
        ];

        for (const tc of testCases) {
            const testTitle: string =
                `${tc.token.symbol} should have ${tc.want===null ? "no wrapper address" : `wrapper address equal to ${tc.want}`} on Chain ID ${tc.chainId}`;

            it(testTitle, function(this: Mocha.Context) {
                expectNull(tc.token.wrapperAddress(tc.chainId), tc.want === null);
            })
        }
    })
})