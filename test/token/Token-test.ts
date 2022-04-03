import {expect} from "chai";

import _ from "lodash";

import {
    ChainId,
    Tokens,
    type Token, supportedChainIds
} from "@sdk";

import {tokenSwitch} from "@sdk/internal/utils";

import {
    expectBnEqual,
    expectBoolean,
    expectNull,
    wrapExpect,
} from "@tests/helpers";

import {BigNumber} from "@ethersproject/bignumber";

describe("Token Tests", function(this: Mocha.Suite) {
    describe("valueToWei tests", function(this: Mocha.Suite) {
        interface TestCase {
            token:      Token;
            chainId:    number;
            amount:     BigNumber | string;
            wantAmount: BigNumber;
        }

        const makeTestTitle = (tc: TestCase): string =>
            `valueToWei(${tc.amount.toString()}) of token ${tc.token.symbol} on Chain ID ${tc.chainId} should return ${tc.wantAmount.toString()}`;

        [
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
        ].forEach((tc: TestCase) => {
            it(makeTestTitle(tc), function(this: Mocha.Context) {
                const got: BigNumber = tc.token.valueToWei(tc.amount, tc.chainId);

                expectBnEqual(got, tc.wantAmount);
            });
        });
    });

    describe("canSwap tests", function(this: Mocha.Suite) {
        interface TestCase {
            tokenA:    Token;
            tokenB:    Token;
            expected:  boolean;
        }

        const makeTestTitle = (tc: TestCase): string =>
            `${tc.tokenA.symbol} should${!tc.expected ? " not": ""} be able to swap with ${tc.tokenB.symbol}`;

       [
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
            {
               tokenA:   Tokens.NEWO,
               tokenB:   Tokens.NEWO,
               expected: true,
            },
            {
               tokenA:   Tokens.NEWO,
               tokenB:   Tokens.GOHM,
               expected: false,
            },
        ].forEach((tc: TestCase) => {
            it(
                makeTestTitle(tc),
                wrapExpect(
                    expectBoolean(tc.tokenA.canSwap(tc.tokenB), tc.expected)
                )
            );
        });
    });

    describe("wrapperAddress tests", function(this: Mocha.Suite) {
        interface TestCase {
            token:   Token;
            chainId: number;
            want:    string | null;
        }

        [
            {token: Tokens.GMX,  chainId: ChainId.AVALANCHE, want: "0x20A9DC684B4d0407EF8C9A302BEAaA18ee15F656"},
            {token: Tokens.GMX,  chainId: ChainId.BSC,       want: null},
            {token: Tokens.NUSD, chainId: ChainId.FANTOM,    want: null},
        ].forEach((tc: TestCase) => {
            const testTitle: string =
                `${tc.token.symbol} should have ${tc.want===null ? "no wrapper address" : `wrapper address equal to ${tc.want}`} on Chain ID ${tc.chainId}`;

            it(testTitle, function(this: Mocha.Context) {
                expectNull(tc.token.wrapperAddress(tc.chainId), tc.want === null);
            });
        });
    });

    describe("decimals tests", function(this: Mocha.Suite) {
        interface TestCase {
            token:   Token;
            chainId: number;
            want:    number;
        }

        const  makeTestCase = (token: Token, chainId: number, want: number): TestCase  => ({token, chainId, want})

        const testCases: TestCase[] = [
            makeTestCase(Tokens.USDC, ChainId.BSC,        18),
            makeTestCase(Tokens.USDC, ChainId.FANTOM,     6),
            makeTestCase(Tokens.USDC, ChainId.METIS,      6),
            makeTestCase(Tokens.USDT, ChainId.BSC,        18),
            makeTestCase(Tokens.USDT, ChainId.FANTOM,     6),
        ];

        testCases.forEach(tc => {
            const testTitle: string = `${tc.token.symbol} should have decimals === ${tc.want} on chain ${tc.chainId}`;

            it(testTitle, function(this: Mocha.Context) {
                const got = tc.token.decimals(tc.chainId);

                expect(got).to.equal(tc.want);
            });
        });
    });

    describe("gas token wrapper tests", function(this: Mocha.Suite) {
        interface TestCase {
            token: Token;
            want:  Token | undefined;
        }

        const makeTestCase = (token: Token, want?: Token): TestCase => ({token, want});

        const testCases: TestCase[] = [
            makeTestCase(Tokens.AVAX, Tokens.WAVAX),
            makeTestCase(Tokens.MOVR, Tokens.WMOVR),
            makeTestCase(Tokens.ETH,  Tokens.WETH),
            makeTestCase(Tokens.NUSD)
        ];

        testCases.forEach(tc => {
            const testTitle: string = `${tc.token.symbol} should${tc.want ? '' : " not"} return a wrapper token`;

            it(testTitle, function(this: Mocha.Context) {
                const got = Tokens.gasTokenWrapper(tc.token);

                if (tc.token.isGasToken) {
                    expect(got).to.exist;
                    expect(got.isEqual(tc.want)).to.be.true;
                } else {
                    expect(got).to.not.exist;
                }
            });
        });
    });

    describe("Test all tokens", function(this: Mocha.Suite) {
        Tokens.AllTokens.forEach(t => {
            let supportedNets = Object.keys(t.addresses).map(c => Number(c));

            supportedChainIds().forEach(cid => {
                let tokenAddr = t.address(cid);

                switch (tokenSwitch(t)) {
                    case Tokens.ETH:
                    case Tokens.AVAX:
                    case Tokens.MOVR:
                    case Tokens.GAS_JEWEL:
                        it(`${t.symbol} address for chain id ${cid} should be null`, function(this: Mocha.Context) {
                            expect(tokenAddr, `${t.symbol}: ${cid}`).to.be.null;
                        });
                        return
                }

                if (supportedNets.includes(cid)) {
                    if (t.isEqual(Tokens.FRAX) && cid === ChainId.MOONBEAM) {
                        return
                    }
                    it(`${t.symbol} address for chain id ${cid} should not be null`, function(this: Mocha.Context) {
                        expect(tokenAddr, `${t.symbol}: ${cid}`).to.not.be.null;
                    });
                } else {
                    it(`${t.symbol} address for chain id ${cid} should be null`, function(this: Mocha.Context) {
                        expect(tokenAddr, `${t.symbol}: ${cid}`).to.be.null;
                    });
                }
            });
        });
    });
});