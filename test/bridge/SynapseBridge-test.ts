import {expect} from "chai";

import {
    Context,
    Done
} from "mocha";

import {step} from "mocha-steps";

import {
    ChainId,
    Networks,
    Token,
    Tokens,
    Bridge
} from "../../src";

import {TransactionResponse} from "@ethersproject/providers";
import {
    PopulatedTransaction,
    ContractTransaction
} from "@ethersproject/contracts";

import {parseEther, parseUnits} from "@ethersproject/units";
import {MaxUint256, Zero} from "@ethersproject/constants";
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";

import type {TestProvider} from "../helpers";

import {
    PROVIDER_ETHEREUM,
    PROVIDER_OPTIMISM,
    PROVIDER_BSC,
    PROVIDER_FANTOM,
    PROVIDER_BOBA,
    PROVIDER_MOONRIVER,
    PROVIDER_AVALANCHE,
    PROVIDER_AURORA,
    PROVIDER_HARMONY,
    makeWalletSignerWithProvider,
    getActualWei
} from "../helpers";
import {newProviderForNetwork} from "../../dist/rpcproviders";

// Completely clean privkey with low balances.
const bridgeTestPrivkey: string = "53354287e3023f0629b7a5e187aa1ca3458c4b7ff9d66a6e3f4b2e821aafded7";

const testChains = [
    PROVIDER_ETHEREUM,
    PROVIDER_OPTIMISM,
    PROVIDER_BSC,
    PROVIDER_FANTOM,
    PROVIDER_BOBA,
    PROVIDER_MOONRIVER,
    PROVIDER_AVALANCHE,
    PROVIDER_AURORA,
    PROVIDER_HARMONY,
];

function doneWithError(e: any, done: Done) {
    done(e instanceof Error ? e : new Error(e));
}

const makeTimeout = (seconds: number): number => seconds * 1000;

const
    DEFAULT_TEST_TIMEOUT   = makeTimeout(10),
    SHORT_TEST_TIMEOUT     = makeTimeout(4.5),
    LONG_TEST_TIMEOUT      = makeTimeout(30),
    EXECUTORS_TEST_TIMEOUT = makeTimeout(180);


describe("SynapseBridge", function() {
    describe("read-only wrapper functions", function(this: Mocha.Suite) {
        describe(".bridgeVersion()", function(this: Mocha.Suite) {
            const expected = 6;

            ChainId.supportedChainIds().forEach((network: number) => {
                const
                    provider = newProviderForNetwork(network),
                    bridgeInstance = new Bridge.SynapseBridge({ network, provider});

                it(`Should return ${expected.toString()} on Chain ID ${network}`, function(this: Context, done: Done) {
                    this.timeout(SHORT_TEST_TIMEOUT);

                    const prom = Promise.resolve(bridgeInstance.bridgeVersion())
                        .then((res) => res.toNumber())
                        .catch((err: any) => doneWithError(err, done))

                    expect(prom).to.eventually.equal(expected).notify(done);
                })
            })
        })

        describe(".WETH_ADDRESS", function(this: Mocha.Suite) {
            ChainId.supportedChainIds().forEach((network: number) => {
                const
                    provider = newProviderForNetwork(network),
                    bridgeInstance = new Bridge.SynapseBridge({ network, provider }),
                    expected: string = ((): string => {
                        switch (network) {
                        case ChainId.ETH:
                            return "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
                        case ChainId.OPTIMISM:
                            return "0x121ab82b49B2BC4c7901CA46B8277962b4350204"
                        case ChainId.BOBA:
                            return "0xd203De32170130082896b4111eDF825a4774c18E"
                            case ChainId.ARBITRUM:
                                return "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
                        default:
                            return "0x0000000000000000000000000000000000000000"
                    }})();

                it(`Should return ${expected} for Chain ID ${network}`, function(this: Context, done: Done) {
                    this.timeout(SHORT_TEST_TIMEOUT);

                    expect(bridgeInstance.WETH_ADDRESS())
                        .to.eventually.equal(expected)
                        .notify(done)
                })
            })
        })

        describe(".getAllowanceForAddress", function(this: Mocha.Suite) {
            interface testCase {
                provider:   TestProvider,
                address:    string,
                token:      Token,
                want:       BigNumber,
                isInfinite: boolean,
            }

            const
                addr1: string = "0x7145a092158c215ff10cce4ddcb84b3a090bdd4e",
                addr2: string = "0x41fe2231639268f01383b86cc8b64fbf24b5e156",
                addr3: string = "0x89a2a295174d899c6d68dfc03535993ee15ff72e",
                addr4: string = "0x39c46cFD4711d1B4D7141d87f057C89C9D2d7019",
                addr5: string = "0xDF681Fe10B2fb7B5605107098EA3867187851DCe",
                addr6: string = "0x982693778347b2a1817d6b0d2812be1d52964266",
                infiniteCheckAmt: BigNumber = MaxUint256.div(2);

            const makeTestCase = (p: TestProvider, t: Token, a: string, n: BigNumberish): testCase => {
                return {
                    provider:   p,
                    token:      t,
                    address:    a,
                    want:       BigNumber.from(n),
                    isInfinite: MaxUint256.eq(n),
                }
            }

            let testCases: testCase[] = [
                makeTestCase(PROVIDER_AURORA,    Tokens.DAI,  addr4, Zero),
                makeTestCase(PROVIDER_AVALANCHE, Tokens.USDC, addr2, MaxUint256),
                makeTestCase(PROVIDER_FANTOM,    Tokens.MIM,  addr3, MaxUint256),
                makeTestCase(PROVIDER_BOBA,      Tokens.NUSD, addr3, Zero),
                makeTestCase(PROVIDER_MOONRIVER, Tokens.SYN,  addr1, Zero),
                makeTestCase(PROVIDER_HARMONY,   Tokens.NUSD, addr5, Zero),
                makeTestCase(PROVIDER_AVALANCHE, Tokens.USDC, addr6, parseEther("12.98"))
            ];

            this.timeout(makeTimeout(10 * testCases.length));

            testCases.forEach((tc: testCase) => {
                const
                    {provider: {chainId: network, provider}} = tc,
                    chainName: string = Networks.fromChainId(network).name,
                    wantNum: string = parseUnits(tc.want.toString(), tc.token.decimals(network)).toString(),
                    spendAllowanceTitle: string = `should have a spend allowance of ${tc.isInfinite ? "unlimited" : wantNum} wei`,
                    title: string = `SynapseBridge on chain ${chainName} ${spendAllowanceTitle} for ${tc.token.name} holdings of ${tc.address}`;

                it(title, function (this: Mocha.Context, done: Done) {
                    this.timeout(DEFAULT_TEST_TIMEOUT);

                    let bridgeInstance = new Bridge.SynapseBridge({network, provider});

                    const
                        {address, token} = tc,
                        decimals = token.decimals(network),
                        checkAmt: BigNumber = tc.isInfinite ? infiniteCheckAmt : tc.want,
                        msg: string = tc.isInfinite ? "gte" : "equal";

                    Promise.resolve(bridgeInstance.getAllowanceForAddress({address, token}))
                        .then((res: BigNumber) => {
                            const
                                got = getActualWei(res, decimals),
                                success: boolean = tc.isInfinite ? got.gte(infiniteCheckAmt) : got.eq(tc.want);

                            expect(
                                success,
                                `expected ${got.toString()} to be ${msg} to ${checkAmt.toString()}`
                            ).to.be.true;

                            done();
                        })
                        .catch((err: any) => doneWithError(err, done))
                })
            })
        })

        describe("checkSwapSupported", function(this: Mocha.Suite) {
            interface TestArgs {
                chainIdFrom: number,
                chainIdTo:   number,
                tokenFrom:   Token,
                tokenTo:     Token,
            }

            interface TestCase {
                args:     TestArgs,
                expected: boolean,
            }

            const makeTestCase = (chainIdFrom: number, tokenFrom: Token, chainIdTo: number, tokenTo: Token, expected: boolean): TestCase => {
                return {args: {chainIdFrom, tokenFrom, chainIdTo, tokenTo}, expected}
            }

            let testCases: TestCase[] = [
                makeTestCase(ChainId.ETH,       Tokens.DAI,    ChainId.BSC,       Tokens.USDC, true),
                makeTestCase(ChainId.ETH,       Tokens.ETH,    ChainId.BSC,       Tokens.USDC, false),
                makeTestCase(ChainId.ARBITRUM,  Tokens.WETH,   ChainId.ETH,       Tokens.ETH,  true),
                makeTestCase(ChainId.ARBITRUM,  Tokens.WETH,   ChainId.AVALANCHE, Tokens.ETH,  true),
                makeTestCase(ChainId.AVALANCHE, Tokens.SYN,    ChainId.BSC,       Tokens.SYN,  true),
                makeTestCase(ChainId.POLYGON,   Tokens.MIM,    ChainId.BSC,       Tokens.USDT, false),
                makeTestCase(ChainId.FANTOM,    Tokens.MIM,    ChainId.BSC,       Tokens.USDT, true),
                makeTestCase(ChainId.BOBA,      Tokens.MIM,    ChainId.ETH,       Tokens.MIM,  false),
                makeTestCase(ChainId.ETH,       Tokens.ETH,    ChainId.BOBA,      Tokens.NETH, false),
                makeTestCase(ChainId.ETH,       Tokens.ETH,    ChainId.BOBA,      Tokens.ETH,  false),
                makeTestCase(ChainId.BOBA,      Tokens.ETH,    ChainId.ETH,       Tokens.ETH,  false),
                makeTestCase(ChainId.BOBA,      Tokens.ETH,    ChainId.ETH,       Tokens.NETH, false),
                makeTestCase(ChainId.ETH,       Tokens.ETH,    ChainId.BOBA,      Tokens.USDT, false),
                makeTestCase(ChainId.ETH,       Tokens.NETH,   ChainId.BOBA,      Tokens.USDC, false),
                makeTestCase(ChainId.BOBA,      Tokens.ETH,    ChainId.ETH,       Tokens.USDT, false),
                makeTestCase(ChainId.BOBA,      Tokens.NETH,   ChainId.ETH,       Tokens.USDC, false),
                makeTestCase(ChainId.BOBA,      Tokens.USDC,   ChainId.ETH,       Tokens.USDT, true),
                makeTestCase(ChainId.ETH,       Tokens.USDT,   ChainId.ETH,       Tokens.USDC, true),
                makeTestCase(ChainId.BOBA,      Tokens.SYN,    ChainId.ETH,       Tokens.SYN,  true),
                makeTestCase(ChainId.ETH,       Tokens.SYN,    ChainId.BOBA,      Tokens.SYN,  true),
                makeTestCase(ChainId.BOBA,      Tokens.SYN,    ChainId.ETH,       Tokens.NUSD, false),
                makeTestCase(ChainId.ETH,       Tokens.NUSD,   ChainId.BOBA,      Tokens.NUSD, true),
                makeTestCase(ChainId.ETH,       Tokens.SYN,    ChainId.MOONRIVER, Tokens.SYN,  true),
                makeTestCase(ChainId.ETH,       Tokens.NUSD,   ChainId.MOONRIVER, Tokens.FRAX, false),
                makeTestCase(ChainId.MOONRIVER, Tokens.FRAX,   ChainId.ETH,       Tokens.FRAX, true),
                makeTestCase(ChainId.ETH,       Tokens.FRAX,   ChainId.MOONRIVER, Tokens.FRAX, true),
                makeTestCase(ChainId.ETH,       Tokens.ETH,    ChainId.OPTIMISM,  Tokens.NETH, true),
                makeTestCase(ChainId.ETH,       Tokens.ETH,    ChainId.OPTIMISM,  Tokens.ETH,  true),
                makeTestCase(ChainId.OPTIMISM,  Tokens.ETH,    ChainId.ETH,       Tokens.ETH,  true),
                makeTestCase(ChainId.OPTIMISM,  Tokens.ETH,    ChainId.ETH,       Tokens.NETH, true),
                makeTestCase(ChainId.AURORA,    Tokens.USDT,   ChainId.BSC,       Tokens.USDC, true),
                makeTestCase(ChainId.ETH,       Tokens.ETH,    ChainId.AURORA,    Tokens.USDC, false),
                makeTestCase(ChainId.ETH,       Tokens.NETH,   ChainId.AURORA,    Tokens.USDC, false),
                makeTestCase(ChainId.AVALANCHE, Tokens.WETH_E, ChainId.AURORA,    Tokens.USDC, false),
                makeTestCase(ChainId.ETH,       Tokens.WETH,   ChainId.AVALANCHE, Tokens.WETH_E,true),
                makeTestCase(ChainId.ETH,       Tokens.NUSD,   ChainId.AVALANCHE, Tokens.NUSD,true),
                makeTestCase(ChainId.ETH,       Tokens.WETH,   ChainId.HARMONY,   Tokens.ONE_ETH,true),
                makeTestCase(ChainId.HARMONY,   Tokens.ONE_ETH,ChainId.ETH,       Tokens.WETH,true),
                makeTestCase(ChainId.HARMONY,   Tokens.ONE_ETH,ChainId.AVALANCHE, Tokens.WETH_E,true),
                makeTestCase(ChainId.HARMONY,   Tokens.ONE_ETH,ChainId.OPTIMISM,  Tokens.WETH,true),
                makeTestCase(ChainId.OPTIMISM,  Tokens.WETH,   ChainId.HARMONY,   Tokens.ONE_ETH,true),
            ];

            testCases.forEach(({ args, expected }) => {
                const {
                    tokenFrom: { symbol: tokenFromSymbol },
                    tokenTo: { symbol: tokenToSymbol},
                    chainIdFrom,
                    chainIdTo
                } = args;

                const
                    netNameFrom = Networks.fromChainId(chainIdFrom).name,
                    netNameTo = Networks.fromChainId(chainIdTo).name

                const testTitle = `checkSwapSupported with params ${tokenFromSymbol} on ${netNameFrom} to ${tokenToSymbol} on ${netNameTo} should return ${expected}`

                it(testTitle, function() {
                    let { chainIdFrom, ...testArgs } = args;
                    const bridgeInstance = new Bridge.SynapseBridge({ network: chainIdFrom });
                    const [swapAllowed, errReason] = bridgeInstance.swapSupported(testArgs);
                    expect(swapAllowed).to.equal(expected, errReason);
                })
            })
        })

        describe("getEstimatedBridgeOutput", function(this: Mocha.Suite) {
            interface TestArgs {
                chainIdFrom: number,
                chainIdTo:   number,
                tokenFrom:   Token,
                tokenTo:     Token,
                amountFrom:  BigNumber,
            }

            interface TestCase {
                args:      TestArgs,
                notZero:   boolean,
                wantError: boolean,
            }

            const makeSimpleTestCase = (amt: string): TestArgs => {
                return {
                    chainIdFrom: ChainId.ETH,
                    tokenFrom:   Tokens.DAI,
                    chainIdTo:   ChainId.BSC,
                    tokenTo:     Tokens.USDC,
                    amountFrom:  Tokens.DAI.valueToWei(amt, ChainId.ETH)
                }
            }

            let testCases: TestCase[] = [
                {
                    args:      makeSimpleTestCase("500"),
                    notZero:   true,
                    wantError: false
                },
                {
                    args:      makeSimpleTestCase("50"),
                    notZero:   true,
                    wantError: false
                },
                {
                    args:      makeSimpleTestCase("1"),
                    notZero:   false,
                    wantError: false
                },
                {
                    args: {
                        chainIdFrom: ChainId.BOBA,
                        chainIdTo:   ChainId.ETH,
                        tokenFrom:   Tokens.NETH,
                        tokenTo:     Tokens.ETH,
                        amountFrom:  Tokens.NETH.valueToWei("555", ChainId.BOBA),
                    },
                    notZero:   false,
                    wantError: true
                },
                {
                    args: {
                        chainIdFrom: ChainId.BOBA,
                        chainIdTo:   ChainId.ETH,
                        tokenFrom:   Tokens.NETH,
                        tokenTo:     Tokens.NETH,
                        amountFrom:  Tokens.NETH.valueToWei("555", ChainId.BOBA),
                    },
                    notZero:   false,
                    wantError: true,
                },
                {
                    args: {
                        chainIdFrom: ChainId.BOBA,
                        chainIdTo:   ChainId.BSC,
                        tokenFrom:   Tokens.USDC,
                        tokenTo:     Tokens.NUSD,
                        amountFrom:  Tokens.USDC.valueToWei("20", ChainId.BOBA),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.BSC,
                        chainIdTo:   ChainId.BOBA,
                        tokenFrom:   Tokens.USDC,
                        tokenTo:     Tokens.USDT,
                        amountFrom:  Tokens.USDC.valueToWei("500", ChainId.BSC),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.MOONRIVER,
                        chainIdTo:   ChainId.ETH,
                        tokenFrom:   Tokens.FRAX,
                        tokenTo:     Tokens.FRAX,
                        amountFrom:  Tokens.FRAX.valueToWei("250", ChainId.MOONRIVER),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.ETH,
                        chainIdTo:   ChainId.MOONRIVER,
                        tokenFrom:   Tokens.FRAX,
                        tokenTo:     Tokens.FRAX,
                        amountFrom:  Tokens.FRAX.valueToWei("250", ChainId.ETH),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.MOONRIVER,
                        chainIdTo:   ChainId.ETH,
                        tokenFrom:   Tokens.SYN,
                        tokenTo:     Tokens.SYN,
                        amountFrom:  Tokens.SYN.valueToWei("250", ChainId.MOONRIVER),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.ETH,
                        chainIdTo:   ChainId.MOONRIVER,
                        tokenFrom:   Tokens.SYN,
                        tokenTo:     Tokens.SYN,
                        amountFrom:  Tokens.SYN.valueToWei("250", ChainId.ETH),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.OPTIMISM,
                        chainIdTo:   ChainId.ETH,
                        tokenFrom:   Tokens.NETH,
                        tokenTo:     Tokens.NETH,
                        amountFrom:  Tokens.NETH.valueToWei("250", ChainId.OPTIMISM),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.ETH,
                        chainIdTo:   ChainId.OPTIMISM,
                        tokenFrom:   Tokens.ETH,
                        tokenTo:     Tokens.NETH,
                        amountFrom:  Tokens.NETH.valueToWei("2500", ChainId.ETH),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.ETH,
                        chainIdTo:   ChainId.AVALANCHE,
                        tokenFrom:   Tokens.ETH,
                        tokenTo:     Tokens.NETH,
                        amountFrom:  Tokens.ETH.valueToWei("4200", ChainId.ETH),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.AVALANCHE,
                        chainIdTo:   ChainId.ETH,
                        tokenFrom:   Tokens.WETH_E,
                        tokenTo:     Tokens.USDC,
                        amountFrom:  Tokens.WETH_E.valueToWei("2500", ChainId.AVALANCHE),
                    },
                    notZero:   false,
                    wantError: true,
                },
                {
                    args: {
                        chainIdFrom: ChainId.AVALANCHE,
                        chainIdTo:   ChainId.ETH,
                        tokenFrom:   Tokens.WETH_E,
                        tokenTo:     Tokens.ETH,
                        amountFrom:  Tokens.WETH_E.valueToWei("2500", ChainId.AVALANCHE),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.AVALANCHE,
                        chainIdTo:   ChainId.ARBITRUM,
                        tokenFrom:   Tokens.WETH_E,
                        tokenTo:     Tokens.ETH,
                        amountFrom:  Tokens.WETH_E.valueToWei("420", ChainId.AVALANCHE),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.ETH,
                        chainIdTo:   ChainId.AVALANCHE,
                        tokenFrom:   Tokens.ETH,
                        tokenTo:     Tokens.WETH_E,
                        amountFrom:  Tokens.ETH.valueToWei("123", ChainId.ETH),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.ETH,
                        chainIdTo:   ChainId.ETH,
                        tokenFrom:   Tokens.ETH,
                        tokenTo:     Tokens.WETH_E,
                        amountFrom:  Tokens.ETH.valueToWei("101", ChainId.ETH),
                    },
                    notZero:   true,
                    wantError: true,
                },
                {
                    args: {
                        chainIdFrom: ChainId.AVALANCHE,
                        chainIdTo:   ChainId.ETH,
                        tokenFrom:   Tokens.NUSD,
                        tokenTo:     Tokens.DAI,
                        amountFrom:  Tokens.NUSD.valueToWei("1337", ChainId.AVALANCHE),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.FANTOM,
                        chainIdTo:   ChainId.ETH,
                        tokenFrom:   Tokens.MIM,
                        tokenTo:     Tokens.NUSD,
                        amountFrom:  Tokens.NUSD.valueToWei("1337", ChainId.BOBA),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.AVALANCHE,
                        chainIdTo:   ChainId.POLYGON,
                        tokenFrom:   Tokens.NUSD,
                        tokenTo:     Tokens.DAI,
                        amountFrom:  Tokens.NUSD.valueToWei("1337", ChainId.AVALANCHE),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.POLYGON,
                        chainIdTo:   ChainId.ETH,
                        tokenFrom:   Tokens.DOG,
                        tokenTo:     Tokens.DOG,
                        amountFrom:  Tokens.DOG.valueToWei("609", ChainId.POLYGON),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.ARBITRUM,
                        chainIdTo:   ChainId.OPTIMISM,
                        tokenFrom:   Tokens.ETH,
                        tokenTo:     Tokens.ETH,
                        amountFrom:  Tokens.ETH.valueToWei("31337", ChainId.ARBITRUM),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.ARBITRUM,
                        chainIdTo:   ChainId.OPTIMISM,
                        tokenFrom:   Tokens.NETH,
                        tokenTo:     Tokens.ETH,
                        amountFrom:  Tokens.NETH.valueToWei("31337", ChainId.ARBITRUM),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.FANTOM,
                        chainIdTo:   ChainId.BSC,
                        tokenFrom:   Tokens.JUMP,
                        tokenTo:     Tokens.JUMP,
                        amountFrom:  Tokens.JUMP.valueToWei("31337", ChainId.FANTOM),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.AVALANCHE,
                        chainIdTo:   ChainId.OPTIMISM,
                        tokenFrom:   Tokens.GOHM,
                        tokenTo:     Tokens.GOHM,
                        amountFrom:  Tokens.GOHM.valueToWei("1", ChainId.AVALANCHE),
                    },
                    notZero:   false,
                    wantError: true,   
                },
                {
                    args: {
                        chainIdFrom: ChainId.ETH,
                        chainIdTo:   ChainId.AVALANCHE,
                        tokenFrom:   Tokens.GOHM,
                        tokenTo:     Tokens.GOHM,
                        amountFrom:  Tokens.GOHM.valueToWei("69", ChainId.ETH),
                    },
                    notZero:   true,
                    wantError: false,   
                },
                {
                    args: {
                        chainIdFrom: ChainId.AURORA,
                        chainIdTo:   ChainId.AVALANCHE,
                        tokenFrom:   Tokens.USDC,
                        tokenTo:     Tokens.USDC,
                        amountFrom:  Tokens.USDC.valueToWei("69", ChainId.AURORA),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.BSC,
                        chainIdTo:   ChainId.AURORA,
                        tokenFrom:   Tokens.USDC,
                        tokenTo:     Tokens.NUSD,
                        amountFrom:  Tokens.USDC.valueToWei("69", ChainId.BSC),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.AURORA,
                        chainIdTo:   ChainId.ETH,
                        tokenFrom:   Tokens.USDC,
                        tokenTo:     Tokens.NUSD,
                        amountFrom:  Tokens.USDC.valueToWei("69", ChainId.AURORA),
                    },
                    notZero:   false,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.AURORA,
                        chainIdTo:   ChainId.ETH,
                        tokenFrom:   Tokens.USDC,
                        tokenTo:     Tokens.NUSD,
                        amountFrom:  Tokens.USDC.valueToWei("669", ChainId.AURORA),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.ETH,
                        chainIdTo:   ChainId.AURORA,
                        tokenFrom:   Tokens.USDC,
                        tokenTo:     Tokens.NUSD,
                        amountFrom:  Tokens.USDC.valueToWei("669", ChainId.ETH),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.ETH,
                        chainIdTo:   ChainId.AVALANCHE,
                        tokenFrom:   Tokens.WETH,
                        tokenTo:     Tokens.WETH_E,
                        amountFrom:  Tokens.WETH.valueToWei("669", ChainId.ETH),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.ETH,
                        chainIdTo:   ChainId.AVALANCHE,
                        tokenFrom:   Tokens.NUSD,
                        tokenTo:     Tokens.NUSD,
                        amountFrom:  Tokens.NUSD.valueToWei("669", ChainId.ETH),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.AVALANCHE,
                        chainIdTo:   ChainId.OPTIMISM,
                        tokenFrom:   Tokens.WETH_E,
                        tokenTo:     Tokens.WETH,
                        amountFrom:  Tokens.WETH_E.valueToWei("420", ChainId.AVALANCHE),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.ETH,
                        chainIdTo:   ChainId.HARMONY,
                        tokenFrom:   Tokens.WETH,
                        tokenTo:     Tokens.ONE_ETH,
                        amountFrom:  Tokens.WETH.valueToWei("669", ChainId.ETH),
                    },
                    notZero:   true,
                    wantError: false,
                },
                {
                    args: {
                        chainIdFrom: ChainId.HARMONY,
                        chainIdTo:   ChainId.AVALANCHE,
                        tokenFrom:   Tokens.ONE_ETH,
                        tokenTo:     Tokens.WETH_E,
                        amountFrom:  Tokens.ONE_ETH.valueToWei("420", ChainId.HARMONY),
                    },
                    notZero:   true,
                    wantError: false,
                },
            ];

            testCases.forEach(({ args, notZero, wantError }) => {
                this.timeout(DEFAULT_TEST_TIMEOUT);

                const {
                    tokenFrom: { symbol: tokenFromSymbol },
                    tokenTo: { symbol: tokenToSymbol},
                    chainIdFrom,
                    chainIdTo,
                } = args;

                const
                    netNameFrom = Networks.fromChainId(chainIdFrom).name,
                    netNameTo = Networks.fromChainId(chainIdTo).name

                const
                    titleSuffix = notZero ? "a value greater than zero" : "a value === zero",
                    testTitle = `getEstimatedBridgeOutput with params ${tokenFromSymbol} on ${netNameFrom} to ${tokenToSymbol} on ${netNameTo} should return ${titleSuffix}`,
                    titleSuffix1 =  wantError ? "should fail" : "should pass",
                    testTitle1 = `buildBridgeTokenTransaction with params ${tokenFromSymbol} on ${netNameFrom} to ${tokenToSymbol} on ${netNameTo} ${titleSuffix1}`

                let amountTo: BigNumber;

                it(testTitle, function(done: Done) {
                    let { chainIdFrom, ...testArgs } = args;
                    const bridgeInstance = new Bridge.SynapseBridge({ network: chainIdFrom });

                    let prom: Promise<boolean> = bridgeInstance.estimateBridgeTokenOutput(testArgs).then((res): boolean => {
                        amountTo = res.amountToReceive;

                        return notZero
                            ? amountTo.gt(0)
                            : amountTo.isZero()
                        }   
                    )

                    wantError
                        ? expect(prom).to.eventually.be.rejected.notify(done)
                        : expect(prom).to.eventually.be.true.notify(done)
                })

                it(testTitle1, function(this: Context, done: Done) {
                    this.timeout(10*1000);

                    if (!wantError) {
                        const bridgeInstance = new Bridge.SynapseBridge({ network: chainIdFrom });
                        const wallet = makeWalletSignerWithProvider(chainIdFrom, bridgeTestPrivkey);
                        const addressTo = wallet.address;
                        
                        Promise.resolve(
                            bridgeInstance.buildBridgeTokenTransaction({
                                ...args, amountTo, addressTo
                            })
                        ).catch((e) => doneWithError(e, done));
                    }

                    done();
                })
            })
        })
    })
})

function buildTransaction(
    prom: Promise<PopulatedTransaction>,
    done: Done
) {
    Promise.resolve(prom)
        .then(() => done())
        .catch((err: any) => doneWithError(err, done))
}

function executeTransaction(
    prom: Promise<TransactionResponse|ContractTransaction>,
    done: Done
) {
    Promise.resolve(prom)
        .then((txn: TransactionResponse|ContractTransaction) => {
            txn.wait(1).then(() => done())
        })
        .catch((err: any) => doneWithError(err, done))
}

describe("SynapseBridge token bridge tests", async function(this: Mocha.Suite) {
    const
        tokenFrom      = Tokens.ETH,
        tokenTo        = Tokens.WETH_E,
        chainIdFrom    = ChainId.ETH,
        chainIdTo      = ChainId.AVALANCHE,
        amountFrom     = parseEther("420.696969"),
        bridgeArgs     = {tokenFrom, tokenTo, chainIdFrom, chainIdTo, amountFrom},
        wallet         = makeWalletSignerWithProvider(chainIdFrom, bridgeTestPrivkey),
        addressTo      = await wallet.getAddress(),
        bridgeInstance = new Bridge.SynapseBridge({ network: chainIdFrom });

    let
        outputEstimate: Bridge.BridgeOutputEstimate,
        doBridgeArgs: Bridge.BridgeTransactionParams;

    async function getBridgeEstimate(this: Mocha.Context, done: Done) {
        bridgeInstance.estimateBridgeTokenOutput(bridgeArgs)
            .then((res) => {
                if (res.amountToReceive.gt(Zero)) {
                    expect(res.amountToReceive.gt(Zero)).true;
                    outputEstimate = res;
                    doBridgeArgs = {
                        ...bridgeArgs,
                        amountFrom,
                        amountTo:  outputEstimate.amountToReceive,
                        addressTo,
                    }
                    done();
                } else {
                    doneWithError(`wanted gt zero, got zero`, done);
                }
            })
            .catch((e) => doneWithError(e, done))
    }

    describe("test using transaction builders", function(this: Mocha.Suite) {
        this.timeout(DEFAULT_TEST_TIMEOUT)
        let
            approvalTxn:     PopulatedTransaction,
            bridgeTxn:       PopulatedTransaction;

        step("should return an output estimate greater than zero", getBridgeEstimate);

        step("approval transaction should be populated successfully", function(this: Context, done: Done) {
            this.timeout(DEFAULT_TEST_TIMEOUT);

            if (tokenFrom.isEqual(Tokens.ETH)) {
                done();
                return
            }

            buildTransaction(
                bridgeInstance.buildApproveTransaction({ token: tokenFrom }),
                done
            )
        })

        step("bridge transaction should be populated successfully", function(this: Context, done: Done) {
            this.timeout(DEFAULT_TEST_TIMEOUT);

            buildTransaction(
                bridgeInstance.buildBridgeTokenTransaction(doBridgeArgs),
                done
            )
        })

        describe.skip("send transactions", function(this: Mocha.Suite) {
            step("approval transaction should be sent successfully", function(this: Context, done: Done) {
                this.timeout(EXECUTORS_TEST_TIMEOUT);

                if (tokenFrom.isEqual(Tokens.ETH)) {
                    done();
                    return
                }

                executeTransaction(
                    wallet.sendTransaction(approvalTxn),
                    done
                );
            })

            step("token bridge transaction should be sent successfully", function(this: Context, done: Done) {
                this.timeout(EXECUTORS_TEST_TIMEOUT);

                if (tokenFrom.isEqual(Tokens.ETH)) {
                    done();
                    return
                }

                executeTransaction(
                    wallet.sendTransaction(bridgeTxn),
                    done
                );
            })
        })
    })

    describe.skip("magic executors", function(this: Mocha.Suite) {
        step("should return an output estimate greater than zero", getBridgeEstimate);

        describe.skip("send transactions", function(this: Mocha.Suite) {
            step("erc20 approval transaction should execute successfully", function(this: Context, done: Done) {
                this.timeout(EXECUTORS_TEST_TIMEOUT);

                executeTransaction(
                    bridgeInstance.executeApproveTransaction({token: tokenFrom}, wallet),
                    done
                );
            })

            step("token bridge transaction should execute successfully", function(this: Context, done: Done) {
                this.timeout(EXECUTORS_TEST_TIMEOUT);

                executeTransaction(
                    bridgeInstance.executeBridgeTokenTransaction(doBridgeArgs, wallet),
                    done
                );
            })
        })

        describe.skip("SynapseBridge bridge transaction", function(this: Mocha.Suite) {
            this.timeout(EXECUTORS_TEST_TIMEOUT);


        })
    })
})