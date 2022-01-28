import "../helpers/chaisetup";

import {expect} from "chai";

import {
    Context,
    Done
} from "mocha";

import {step} from "mocha-steps";

import _ from "lodash";

import type {Token} from "../../src";

import {
    ChainId,
    Networks,
    Tokens,
    Bridge
} from "../../src";

import {newProviderForNetwork} from "../../src/internal";

import {TransactionResponse} from "@ethersproject/providers";
import {
    PopulatedTransaction,
    ContractTransaction
} from "@ethersproject/contracts";

import {formatUnits, parseEther, parseUnits} from "@ethersproject/units";
import {MaxUint256, Zero} from "@ethersproject/constants";
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";

import type {TestProvider} from "../helpers";

import {
    PROVIDER_BOBA,
    PROVIDER_MOONRIVER,
    PROVIDER_AURORA,
    PROVIDER_HARMONY,
    makeWalletSignerWithProvider,
    getActualWei,
    getTestAmount,
} from "../helpers";


// Completely clean privkey with low balances.
const bridgeTestPrivkey: string = "53354287e3023f0629b7a5e187aa1ca3458c4b7ff9d66a6e3f4b2e821aafded7";

function doneWithError(e: any, done: Done) {
    done(e instanceof Error ? e : new Error(e));
}

const makeTimeout = (seconds: number): number => seconds * 1000;

const
    DEFAULT_TEST_TIMEOUT   = makeTimeout(10),
    SHORT_TEST_TIMEOUT     = makeTimeout(4.5),
    EXECUTORS_TEST_TIMEOUT = makeTimeout(180);


describe("SynapseBridge", function(this: Mocha.Suite) {
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
                // addr2: string = "0x41fe2231639268f01383b86cc8b64fbf24b5e156",
                addr3: string = "0x89a2a295174d899c6d68dfc03535993ee15ff72e",
                addr4: string = "0x39c46cFD4711d1B4D7141d87f057C89C9D2d7019",
                addr5: string = "0xDF681Fe10B2fb7B5605107098EA3867187851DCe",
                // addr6: string = "0x982693778347b2a1817d6b0d2812be1d52964266",
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
                makeTestCase(PROVIDER_BOBA,      Tokens.NUSD, addr3, Zero),
                makeTestCase(PROVIDER_MOONRIVER, Tokens.SYN,  addr1, Zero),
                makeTestCase(PROVIDER_HARMONY,   Tokens.NUSD, addr5, Zero),
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
                chainIdFrom: number|Networks.Network,
                chainIdTo:   number|Networks.Network,
                tokenFrom:   Token,
                tokenTo:     Token,
            }

            interface TestCase {
                args:     TestArgs,
                expected: boolean,
            }

            const makeTestCase = (chainIdFrom: number|Networks.Network, tokenFrom: Token, chainIdTo: number|Networks.Network, tokenTo: Token, expected: boolean): TestCase => {
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
                makeTestCase(Networks.AVALANCHE,Tokens.WETH_E, ChainId.AURORA,    Tokens.USDC, false),
                makeTestCase(ChainId.ETH,       Tokens.WETH,   ChainId.AVALANCHE, Tokens.WETH_E,true),
                makeTestCase(ChainId.ETH,       Tokens.NUSD,   ChainId.AVALANCHE, Tokens.NUSD,true),
                makeTestCase(ChainId.ETH,       Tokens.WETH,   ChainId.HARMONY,   Tokens.ONE_ETH,true),
                makeTestCase(ChainId.HARMONY,   Tokens.ONE_ETH,ChainId.ETH,       Tokens.WETH,true),
                makeTestCase(ChainId.HARMONY,   Tokens.ONE_ETH,ChainId.AVALANCHE, Tokens.WETH_E,true),
                makeTestCase(ChainId.HARMONY,   Tokens.ONE_ETH,ChainId.OPTIMISM,  Tokens.WETH,true),
                makeTestCase(ChainId.OPTIMISM,  Tokens.WETH,   ChainId.HARMONY,   Tokens.ONE_ETH,true),
                makeTestCase(ChainId.AVALANCHE, Tokens.AVWETH, ChainId.AURORA,    Tokens.USDC, false),
                makeTestCase(Networks.AVALANCHE,Tokens.AVWETH, ChainId.ETH,       Tokens.WETH, true),
                makeTestCase(ChainId.HARMONY,   Tokens.AVWETH, ChainId.ETH,       Tokens.WETH,false),
                makeTestCase(ChainId.BSC,       Tokens.HIGH,   ChainId.ETH,       Tokens.HIGH, true),
                makeTestCase(ChainId.BSC,       Tokens.JUMP,   ChainId.FANTOM,    Tokens.JUMP, true),
                makeTestCase(ChainId.BSC,       Tokens.DOG,    ChainId.POLYGON,   Tokens.DOG, true),
                makeTestCase(ChainId.FANTOM,    Tokens.MIM,    ChainId.POLYGON,   Tokens.DAI, true),
                makeTestCase(ChainId.POLYGON,   Tokens.NFD,    ChainId.AVALANCHE, Tokens.NFD, true),
                makeTestCase(ChainId.OPTIMISM,  Tokens.WETH_E, ChainId.AVALANCHE, Tokens.WETH_E,false),
            ];

            testCases.forEach(({ args, expected }) => {
                const {
                    tokenFrom: { symbol: tokenFromSymbol },
                    tokenTo: { symbol: tokenToSymbol},
                    chainIdFrom,
                    chainIdTo
                } = args;

                const
                    netNameFrom = chainIdFrom instanceof Networks.Network ? chainIdFrom.name : Networks.fromChainId(chainIdFrom).name,
                    netNameTo   = chainIdTo instanceof Networks.Network ? chainIdTo.name : Networks.fromChainId(chainIdTo).name

                const testTitle = `checkSwapSupported with params ${tokenFromSymbol} on ${netNameFrom} to ${tokenToSymbol} on ${netNameTo} should return ${expected}`

                it(testTitle, function() {
                    let { chainIdFrom, ...testArgs } = args;
                    const bridgeInstance = new Bridge.SynapseBridge({ network: chainIdFrom });

                    let chainIdTo = testArgs.chainIdTo instanceof Networks.Network ? testArgs.chainIdTo.chainId : testArgs.chainIdTo;

                    const [swapAllowed, errReason] = bridgeInstance.swapSupported({ ...testArgs, chainIdTo });
                    expect(swapAllowed).to.equal(expected, errReason);
                })
            })
        })

        describe("getEstimatedBridgeOutput", function(this: Mocha.Suite) {
            interface TestCase {
                args: {
                    chainIdFrom: number,
                    chainIdTo:   number,
                    tokenFrom:   Token,
                    tokenTo:     Token,
                    amountFrom:  BigNumber,
                },
                notZero:   boolean,
                wantError: boolean,
                noAddrTo:  boolean,
            }

            const makeTestCase = (
                t1: Token, t2: Token,
                c1: number, c2: number,
                amt?:      string,
                notZero?:  boolean,
                wantErr?:  boolean,
                noAddrTo?: boolean,
            ): TestCase =>
                ({
                    args: {
                        tokenFrom:   t1,
                        chainIdFrom: c1,
                        tokenTo:     t2,
                        chainIdTo:   c2,
                        amountFrom:  getTestAmount(t1, c1, amt),
                    },
                    notZero:   notZero  ?? true,
                    wantError: wantErr  ?? false,
                    noAddrTo:  noAddrTo ?? false,
                })

            let testCases: TestCase[] = [
                makeTestCase(Tokens.DAI,     Tokens.USDC,    ChainId.ETH,       ChainId.BSC, "500"),
                makeTestCase(Tokens.DAI,     Tokens.USDC,    ChainId.ETH,       ChainId.BSC, "50"),
                makeTestCase(Tokens.DAI,     Tokens.USDC,    ChainId.ETH,       ChainId.BSC, "1", false),
                makeTestCase(Tokens.NETH,    Tokens.ETH,     ChainId.BOBA,      ChainId.ETH, "555", false, true),
                makeTestCase(Tokens.NETH,    Tokens.NETH,    ChainId.BOBA,      ChainId.ETH, "555", false, true),
                makeTestCase(Tokens.USDC,    Tokens.NUSD,    ChainId.BOBA,      ChainId.BSC, "20"),
                makeTestCase(Tokens.USDC,    Tokens.USDT,    ChainId.BSC,       ChainId.BOBA,"500"),
                makeTestCase(Tokens.FRAX,    Tokens.FRAX,    ChainId.MOONRIVER, ChainId.ETH),
                makeTestCase(Tokens.FRAX,    Tokens.FRAX,    ChainId.ETH,       ChainId.MOONRIVER),
                makeTestCase(Tokens.SYN,     Tokens.SYN,     ChainId.MOONRIVER, ChainId.ETH),
                makeTestCase(Tokens.SYN,     Tokens.SYN,     ChainId.ETH,       ChainId.MOONRIVER),
                makeTestCase(Tokens.WETH_E,  Tokens.NETH,    ChainId.OPTIMISM,  ChainId.ETH, "500", false, true),
                makeTestCase(Tokens.WETH_E,  Tokens.WETH,    ChainId.OPTIMISM,  ChainId.ETH, "500", false, true),
                makeTestCase(Tokens.NETH,    Tokens.NETH,    ChainId.OPTIMISM,  ChainId.ETH, "500"),
                makeTestCase(Tokens.ETH,     Tokens.NETH,    ChainId.ETH,       ChainId.OPTIMISM,  "2500"),
                makeTestCase(Tokens.ETH,     Tokens.NETH,    ChainId.ETH,       ChainId.AVALANCHE, "4200"),
                makeTestCase(Tokens.WETH_E,  Tokens.USDC,    ChainId.AVALANCHE, ChainId.ETH, "2500", false, true),
                makeTestCase(Tokens.WETH_E,  Tokens.ETH,     ChainId.AVALANCHE, ChainId.ETH, "2500"),
                makeTestCase(Tokens.WETH_E,  Tokens.ETH,     ChainId.AVALANCHE, ChainId.ARBITRUM),
                makeTestCase(Tokens.ETH,     Tokens.WETH_E,  ChainId.ETH,       ChainId.AVALANCHE),
                makeTestCase(Tokens.ETH,     Tokens.WETH_E,  ChainId.ETH,       ChainId.ETH, "101", true, true),
                makeTestCase(Tokens.NUSD,    Tokens.DAI,     ChainId.AVALANCHE, ChainId.ETH),
                makeTestCase(Tokens.MIM,     Tokens.NUSD,    ChainId.FANTOM,    ChainId.ETH),
                makeTestCase(Tokens.NUSD,    Tokens.DAI,     ChainId.AVALANCHE, ChainId.POLYGON),
                makeTestCase(Tokens.DOG,     Tokens.DOG,     ChainId.POLYGON,   ChainId.ETH, "3133731337"),
                makeTestCase(Tokens.ETH,     Tokens.ETH,     ChainId.ARBITRUM,  ChainId.OPTIMISM),
                makeTestCase(Tokens.NETH,    Tokens.ETH,     ChainId.ARBITRUM,  ChainId.OPTIMISM),
                makeTestCase(Tokens.JUMP,    Tokens.JUMP,    ChainId.FANTOM,    ChainId.BSC),
                makeTestCase(Tokens.GOHM,    Tokens.GOHM,    ChainId.AVALANCHE, ChainId.OPTIMISM,  "1", false, true),
                makeTestCase(Tokens.GOHM,    Tokens.GOHM,    ChainId.ETH,       ChainId.AVALANCHE, "69"),
                makeTestCase(Tokens.USDC,    Tokens.USDC,    ChainId.AURORA,    ChainId.AVALANCHE, "69"),
                makeTestCase(Tokens.USDC,    Tokens.NUSD,    ChainId.BSC,       ChainId.AURORA,    "69"),
                makeTestCase(Tokens.USDC,    Tokens.NUSD,    ChainId.AURORA,    ChainId.ETH,       "69", false),
                makeTestCase(Tokens.USDC,    Tokens.NUSD,    ChainId.AURORA,    ChainId.ETH,       "31337"),
                makeTestCase(Tokens.USDC,    Tokens.NUSD,    ChainId.ETH,       ChainId.AURORA),
                makeTestCase(Tokens.WETH,    Tokens.WETH_E,  ChainId.ETH,       ChainId.AVALANCHE),
                makeTestCase(Tokens.NUSD,    Tokens.NUSD,    ChainId.ETH,       ChainId.AVALANCHE),
                makeTestCase(Tokens.WETH_E,  Tokens.WETH,    ChainId.AVALANCHE, ChainId.OPTIMISM),
                makeTestCase(Tokens.WETH,    Tokens.ONE_ETH, ChainId.ETH,       ChainId.HARMONY),
                makeTestCase(Tokens.ONE_ETH, Tokens.WETH_E,  ChainId.HARMONY,   ChainId.AVALANCHE),
                makeTestCase(Tokens.HIGH,    Tokens.HIGH,    ChainId.BSC,       ChainId.ETH),
                makeTestCase(Tokens.JUMP,    Tokens.JUMP,    ChainId.BSC,       ChainId.FANTOM),
                makeTestCase(Tokens.DOG,     Tokens.DOG,     ChainId.BSC,       ChainId.POLYGON,   "3133731337"),
                makeTestCase(Tokens.MIM,     Tokens.DAI,     ChainId.FANTOM,    ChainId.POLYGON),
                makeTestCase(Tokens.NFD,     Tokens.NFD,     ChainId.POLYGON,   ChainId.AVALANCHE, "3133731337"),
                makeTestCase(Tokens.GMX,     Tokens.GMX,     ChainId.ARBITRUM,  ChainId.AVALANCHE),
                makeTestCase(Tokens.GMX,     Tokens.GMX,     ChainId.AVALANCHE, ChainId.ARBITRUM),
                makeTestCase(Tokens.SOLAR,   Tokens.SOLAR,   ChainId.MOONRIVER, ChainId.MOONBEAM),
                makeTestCase(Tokens.WAVAX,   Tokens.AVAX,    ChainId.MOONBEAM,  ChainId.AVALANCHE),
                makeTestCase(Tokens.AVAX,    Tokens.WAVAX,   ChainId.AVALANCHE, ChainId.MOONBEAM),
                makeTestCase(Tokens.WMOVR,   Tokens.MOVR,    ChainId.MOONBEAM,  ChainId.MOONRIVER),
                makeTestCase(Tokens.MOVR,    Tokens.WMOVR,   ChainId.MOONRIVER, ChainId.MOONBEAM),
                makeTestCase(Tokens.FTM_ETH, Tokens.WETH,    ChainId.FANTOM,    ChainId.ETH),
                makeTestCase(Tokens.FTM_ETH, Tokens.ETH,     ChainId.FANTOM,    ChainId.ETH),
                makeTestCase(Tokens.FTM_ETH, Tokens.WETH_E,  ChainId.FANTOM,    ChainId.AVALANCHE),
                makeTestCase(Tokens.WETH_E,  Tokens.FTM_ETH, ChainId.AVALANCHE, ChainId.FANTOM),
                makeTestCase(Tokens.ETH,     Tokens.FTM_ETH, ChainId.ETH,       ChainId.FANTOM),
                makeTestCase(Tokens.WETH,    Tokens.FTM_ETH, ChainId.ETH,       ChainId.FANTOM),
                makeTestCase(Tokens.NUSD,    Tokens.DAI,     ChainId.AVALANCHE, ChainId.POLYGON, undefined, true, false, true),
                makeTestCase(Tokens.WETH,    Tokens.FTM_ETH, ChainId.ETH,       ChainId.FANTOM,  undefined, true, false, true),
            ];

            const netName = (c: number): string => Networks.fromChainId(c).name

            const makeTestName = (tc: TestCase): [string, string, string] => {
                let {
                    args: {
                        amountFrom,
                        tokenFrom,
                        tokenFrom: { symbol: tokFrom },
                        tokenTo:   { symbol: tokTo   },
                        chainIdFrom: chainFrom,
                        chainIdTo:   chainTo,
                    },
                    notZero,
                    wantError
                } = tc;

                const
                    amt             = formatUnits(amountFrom, tokenFrom.decimals(chainFrom)),
                    netFrom         = netName(chainFrom),
                    netTo           = netName(chainTo),
                    titleSuffix     = notZero ? "a value greater than zero" : "a value === zero",
                    testParamsTitle = `with params ${amt} ${tokFrom} on ${netFrom} to ${tokTo} on ${netTo}`,
                    testTitle       = `getEstimatedBridgeOutput ${testParamsTitle} should return ${titleSuffix}`,
                    titleSuffix1    =  wantError ? "should fail" : "should pass",
                    testTitle1      = `buildBridgeTokenTransaction ${testParamsTitle} ${titleSuffix1}`,
                    testTitle2      = `buildApproveTransaction ${testParamsTitle} ${titleSuffix1}`;

                return [testTitle, testTitle1, testTitle2]
            }

            testCases.forEach((tc: TestCase) => {
                this.timeout(DEFAULT_TEST_TIMEOUT);

                const [testTitle, testTitle1, testTitle2] = makeTestName(tc)

                let amountTo: BigNumber;

                it(testTitle, function(done: Done) {
                    let { args: { chainIdFrom, ...testArgs }, notZero, wantError } = tc;
                    const bridgeInstance = new Bridge.SynapseBridge({ network: chainIdFrom });

                    let prom: Promise<boolean> = Promise.resolve(bridgeInstance.estimateBridgeTokenOutput(testArgs)
                        .then((res) => {
                            amountTo = res.amountToReceive;

                            return res
                        })
                    ).then((res): boolean => {
                        let {amountToReceive, bridgeFee} = res;


                        return notZero
                            ? amountToReceive.gt(Zero)
                            : amountToReceive.eq(Zero)
                    })

                    wantError
                        ? expect(prom).to.eventually.be.rejected.notify(done)
                        : expect(prom).to.eventually.be.true.notify(done)
                })

                it(testTitle2, function(this: Context, done: Done) {
                    this.timeout(10*1000);

                    let { args: { chainIdFrom, tokenFrom, amountFrom }, wantError } = tc;

                    if (!wantError) {
                        const bridgeInstance = new Bridge.SynapseBridge({ network: chainIdFrom });

                        switch (true) {
                            case tokenFrom.isEqual(Tokens.ETH):
                                tokenFrom = Tokens.WETH;
                                break;
                            case tokenFrom.isEqual(Tokens.AVAX):
                                tokenFrom = Tokens.WAVAX;
                                break;
                            case tokenFrom.isEqual(Tokens.MOVR):
                                tokenFrom = Tokens.WMOVR;
                                break;
                        }

                        let prom = Promise.resolve(
                            bridgeInstance.buildApproveTransaction({
                                token:  tokenFrom,
                                amount: amountFrom
                            })
                        )

                        expect(prom).to.eventually.be.fulfilled.notify(done);
                        return
                    }

                    done();
                })

                const undefEmptyArr = [
                    "", "", undefined, "", undefined,
                    undefined, "", "", undefined, undefined, ""
                ];

                it(testTitle1, function(this: Context, done: Done) {
                    this.timeout(10*1000);

                    let { args: { chainIdFrom }, args, wantError, noAddrTo } = tc;

                    if (!wantError) {
                        const bridgeInstance = new Bridge.SynapseBridge({ network: chainIdFrom });
                        let addressTo: string;

                        noAddrTo
                            ? addressTo = _.shuffle(undefEmptyArr)[0]
                            : addressTo = makeWalletSignerWithProvider(chainIdFrom, bridgeTestPrivkey).address

                        
                        let prom = Promise.resolve(
                            bridgeInstance.buildBridgeTokenTransaction({
                                ...args, amountTo, addressTo
                            })
                        )

                        noAddrTo
                            ? expect(prom).to.eventually.be.rejected.notify(done)
                            : expect(prom).to.eventually.be.fulfilled.notify(done);
                        return
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