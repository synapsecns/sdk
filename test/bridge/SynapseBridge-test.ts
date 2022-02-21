import "../helpers/chaisetup";

import {expect} from "chai";

import {step} from "mocha-steps";

import _ from "lodash";

import type {Token} from "../../src";

import {
    ChainId,
    Networks,
    Tokens,
    Bridge,
    supportedChainIds,
} from "../../src";

import {contractAddressFor} from "../../src/common/utils";

import {ERC20} from "../../src/bridge/erc20";

import {newProviderForNetwork} from "../../src/internal/rpcproviders";

import {JsonRpcProvider} from "@ethersproject/providers";
import {Wallet}           from "@ethersproject/wallet";
import {BigNumber}        from "@ethersproject/bignumber";
import {MaxUint256, Zero} from "@ethersproject/constants";
import {formatUnits, parseEther, parseUnits} from "@ethersproject/units";

import {
    DEFAULT_TEST_TIMEOUT,
    SHORT_TEST_TIMEOUT,
    EXECUTORS_TEST_TIMEOUT,
    makeWalletSignerWithProvider,
    getActualWei,
    getTestAmount,
    doneWithError,
    expectEqual,
    expectFulfilled,
    expectPromiseResolve,
    expectBnEqual,
    expectZero,
    expectNotZero,
} from "../helpers";

import dotenv from "dotenv";

import type {TransactionResponse} from "@ethersproject/providers";
import type {
    PopulatedTransaction,
    ContractTransaction
} from "@ethersproject/contracts";

import type {BigNumberish} from "@ethersproject/bignumber";


// Completely clean privkey with low balances.
const bridgeTestPrivkey: string = "53354287e3023f0629b7a5e187aa1ca3458c4b7ff9d66a6e3f4b2e821aafded7";


describe("SynapseBridge", function(this: Mocha.Suite) {
    const ALL_CHAIN_IDS = supportedChainIds();

    describe("read-only wrapper functions", function(this: Mocha.Suite) {
        describe(".bridgeVersion()", function(this: Mocha.Suite) {
            const expected = 6;

            for (const network of ALL_CHAIN_IDS) {
                const
                    provider          = newProviderForNetwork(network),
                    bridgeInstance    = new Bridge.SynapseBridge({ network, provider}),
                    testTitle: string = `Should return ${expected.toString()} on Chain ID ${network}`;

                it(testTitle, async function(this: Mocha.Context) {
                    this.timeout(DEFAULT_TEST_TIMEOUT);
                    return expectBnEqual(await bridgeInstance.bridgeVersion(), expected)
                })
            }
        })

        describe(".WETH_ADDRESS", function(this: Mocha.Suite) {
            for (const network of ALL_CHAIN_IDS) {
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
                    }})(),
                    testTitle: string = `Should return ${expected} for Chain ID ${network}`;

                it(testTitle, async function(this: Mocha.Context) {
                    this.timeout(SHORT_TEST_TIMEOUT);

                    try {
                        return expect(await bridgeInstance.WETH_ADDRESS()).to.equal(expected)
                    } catch (err) {
                        const e: Error = err instanceof Error ? err : new Error(err);
                        expect(e.message).to.equal("");
                    }
                })
            }
        })

        describe(".getAllowanceForAddress", function(this: Mocha.Suite) {
            interface testCase {
                provider:   JsonRpcProvider,
                chainId:    number,
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
                infiniteCheckAmt: BigNumber = MaxUint256.div(2);

            const makeTestCase = (c: number, t: Token, a: string, n: BigNumberish): testCase => {
                return {
                    provider:   newProviderForNetwork(c),
                    chainId:    c,
                    token:      t,
                    address:    a,
                    want:       BigNumber.from(n),
                    isInfinite: MaxUint256.eq(n),
                }
            }
            function runTestCase(tc: testCase) {
                const
                    {provider, chainId: network} = tc,
                    chainName: string = Networks.fromChainId(network).name,
                    wantNum: string = parseUnits(tc.want.toString(), tc.token.decimals(network)).toString(),
                    spendAllowanceTitle: string = `should have a spend allowance of ${tc.isInfinite ? "unlimited" : wantNum} wei`,
                    title:               string = `SynapseBridge on chain ${chainName} ${spendAllowanceTitle} for ${tc.token.name} holdings of ${tc.address}`;

                it(title, async function (this: Mocha.Context) {
                    this.timeout(DEFAULT_TEST_TIMEOUT);

                    let bridgeInstance = new Bridge.SynapseBridge({network, provider});

                    const
                        {address, token} = tc,
                        decimals = token.decimals(network),
                        checkAmt: BigNumber = tc.isInfinite ? infiniteCheckAmt : tc.want;

                    let res = await Promise.resolve(bridgeInstance.getAllowanceForAddress({address, token})).then(res => getActualWei(res, decimals));

                    return tc.isInfinite
                        ? expect(res).to.be.gte(checkAmt)
                        : expect(res).to.be.eq(checkAmt)
                })
            }

            describe("- infinite approval", function(this: Mocha.Suite) {
                const infiniteApprovalTestAddress: string = "0xcac129e42e4c224c2af58f7cefe9432c1e633947"

                step("Ensure infinite approval test address has infinite approval", async function(this: Mocha.Context) {
                    this.timeout(EXECUTORS_TEST_TIMEOUT);

                    dotenv.config();

                    const bscZapAddr: string = contractAddressFor(ChainId.BSC, "bridge_zap");
                    const tokenParams = {tokenAddress: Tokens.BUSD.address(ChainId.BSC), chainId: ChainId.BSC};

                    try {
                        const allowance = await ERC20.allowanceOf(
                            infiniteApprovalTestAddress,
                            bscZapAddr,
                            tokenParams
                        );

                        if (allowance.lte(infiniteCheckAmt)) {
                            const testPrivKey: string = process.env.TEST_PRIVKEY_A;
                            const wallet = new Wallet(testPrivKey, newProviderForNetwork(ChainId.BSC));
                            let txn: ContractTransaction = (await ERC20.approve({spender: bscZapAddr}, tokenParams, wallet)) as ContractTransaction;
                            await txn.wait(1);

                            const newAllowance = await ERC20.allowanceOf(
                                infiniteApprovalTestAddress,
                                bscZapAddr,
                                tokenParams
                            );

                            expect(newAllowance).to.be.gte(infiniteCheckAmt);
                        }

                        return
                    } catch (err) {
                        const e: Error = err instanceof Error ? err : new Error(err);
                        expect(e.message).to.eq("");
                    }
                })

                runTestCase(makeTestCase(
                    ChainId.BSC,
                    Tokens.BUSD,
                    infiniteApprovalTestAddress,
                    MaxUint256
                ));
            })

            describe("- zero approval", function(this: Mocha.Suite) {
                [
                    makeTestCase(ChainId.AURORA,    Tokens.DAI,  addr4, Zero),
                    makeTestCase(ChainId.BOBA,      Tokens.NUSD, addr3, Zero),
                    makeTestCase(ChainId.MOONRIVER, Tokens.SYN,  addr1, Zero),
                    makeTestCase(ChainId.HARMONY,   Tokens.NUSD, addr5, Zero),
                ].forEach(runTestCase);
            })
        })

        interface BridgeSwapTestArgs {
            chainIdFrom: number,
            chainIdTo:   number,
            tokenFrom:   Token,
            tokenTo:     Token,
            amountFrom:  BigNumber,
        }

        interface BridgeSwapTestCase<T> {
            args:     BridgeSwapTestArgs,
            expected: T,
        }

        function makeBridgeSwapTestCase<T>(
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

        describe("checkSwapSupported", function(this: Mocha.Suite) {
            type TestCase = BridgeSwapTestCase<boolean>

            let testCases: TestCase[] = [
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.DAI,    ChainId.BSC,       Tokens.USDC,   true),
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.ETH,    ChainId.BSC,       Tokens.USDC,   false),
                makeBridgeSwapTestCase(ChainId.ARBITRUM,  Tokens.WETH,   ChainId.ETH,       Tokens.ETH,    true),
                makeBridgeSwapTestCase(ChainId.ARBITRUM,  Tokens.WETH,   ChainId.AVALANCHE, Tokens.ETH,    true),
                makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.SYN,    ChainId.BSC,       Tokens.SYN,    true),
                makeBridgeSwapTestCase(ChainId.POLYGON,   Tokens.MIM,    ChainId.BSC,       Tokens.USDT,   false),
                makeBridgeSwapTestCase(ChainId.FANTOM,    Tokens.MIM,    ChainId.BSC,       Tokens.USDT,   true),
                makeBridgeSwapTestCase(ChainId.BOBA,      Tokens.MIM,    ChainId.ETH,       Tokens.MIM,    false),
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.ETH,    ChainId.BOBA,      Tokens.NETH,   false),
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.ETH,    ChainId.BOBA,      Tokens.ETH,    false),
                makeBridgeSwapTestCase(ChainId.BOBA,      Tokens.ETH,    ChainId.ETH,       Tokens.ETH,    false),
                makeBridgeSwapTestCase(ChainId.BOBA,      Tokens.ETH,    ChainId.ETH,       Tokens.NETH,   false),
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.ETH,    ChainId.BOBA,      Tokens.USDT,   false),
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.NETH,   ChainId.BOBA,      Tokens.USDC,   false),
                makeBridgeSwapTestCase(ChainId.BOBA,      Tokens.ETH,    ChainId.ETH,       Tokens.USDT,   false),
                makeBridgeSwapTestCase(ChainId.BOBA,      Tokens.NETH,   ChainId.ETH,       Tokens.USDC,   false),
                makeBridgeSwapTestCase(ChainId.BOBA,      Tokens.USDC,   ChainId.ETH,       Tokens.USDT,   true),
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.USDT,   ChainId.ETH,       Tokens.USDC,   true),
                makeBridgeSwapTestCase(ChainId.BOBA,      Tokens.SYN,    ChainId.ETH,       Tokens.SYN,    true),
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.SYN,    ChainId.BOBA,      Tokens.SYN,    true),
                makeBridgeSwapTestCase(ChainId.BOBA,      Tokens.SYN,    ChainId.ETH,       Tokens.NUSD,   false),
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.NUSD,   ChainId.BOBA,      Tokens.NUSD,   true),
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.SYN,    ChainId.MOONRIVER, Tokens.SYN,    true),
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.NUSD,   ChainId.MOONRIVER, Tokens.FRAX,   false),
                makeBridgeSwapTestCase(ChainId.MOONRIVER, Tokens.FRAX,   ChainId.ETH,       Tokens.FRAX,   true),
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.FRAX,   ChainId.MOONRIVER, Tokens.FRAX,   true),
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.ETH,    ChainId.OPTIMISM,  Tokens.NETH,   true),
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.ETH,    ChainId.OPTIMISM,  Tokens.ETH,    true),
                makeBridgeSwapTestCase(ChainId.OPTIMISM,  Tokens.ETH,    ChainId.ETH,       Tokens.ETH,    true),
                makeBridgeSwapTestCase(ChainId.OPTIMISM,  Tokens.ETH,    ChainId.ETH,       Tokens.NETH,   true),
                makeBridgeSwapTestCase(ChainId.AURORA,    Tokens.USDT,   ChainId.BSC,       Tokens.USDC,   true),
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.ETH,    ChainId.AURORA,    Tokens.USDC,   false),
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.NETH,   ChainId.AURORA,    Tokens.USDC,   false),
                makeBridgeSwapTestCase(Networks.AVALANCHE,Tokens.WETH_E, ChainId.AURORA,    Tokens.USDC,   false),
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.WETH,   ChainId.AVALANCHE, Tokens.WETH_E, true),
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.NUSD,   ChainId.AVALANCHE, Tokens.NUSD,   true),
                makeBridgeSwapTestCase(ChainId.ETH,       Tokens.WETH,   ChainId.HARMONY,   Tokens.ONE_ETH,true),
                makeBridgeSwapTestCase(ChainId.HARMONY,   Tokens.ONE_ETH,ChainId.ETH,       Tokens.WETH,   true),
                makeBridgeSwapTestCase(ChainId.HARMONY,   Tokens.ONE_ETH,ChainId.AVALANCHE, Tokens.WETH_E, true),
                makeBridgeSwapTestCase(ChainId.HARMONY,   Tokens.ONE_ETH,ChainId.OPTIMISM,  Tokens.WETH,   true),
                makeBridgeSwapTestCase(ChainId.OPTIMISM,  Tokens.WETH,   ChainId.HARMONY,   Tokens.ONE_ETH,true),
                makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.AVWETH, ChainId.AURORA,    Tokens.USDC,   false),
                makeBridgeSwapTestCase(Networks.AVALANCHE,Tokens.AVWETH, ChainId.ETH,       Tokens.WETH,   true),
                makeBridgeSwapTestCase(ChainId.HARMONY,   Tokens.AVWETH, ChainId.ETH,       Tokens.WETH,   false),
                makeBridgeSwapTestCase(ChainId.BSC,       Tokens.HIGH,   ChainId.ETH,       Tokens.HIGH,   true),
                makeBridgeSwapTestCase(ChainId.BSC,       Tokens.JUMP,   ChainId.FANTOM,    Tokens.JUMP,   true),
                makeBridgeSwapTestCase(ChainId.BSC,       Tokens.DOG,    ChainId.POLYGON,   Tokens.DOG,    true),
                makeBridgeSwapTestCase(ChainId.FANTOM,    Tokens.MIM,    ChainId.POLYGON,   Tokens.DAI,    true),
                makeBridgeSwapTestCase(ChainId.POLYGON,   Tokens.NFD,    ChainId.AVALANCHE, Tokens.NFD,    true),
                makeBridgeSwapTestCase(ChainId.OPTIMISM,  Tokens.WETH_E, ChainId.AVALANCHE, Tokens.WETH_E, false),
                makeBridgeSwapTestCase(ChainId.ARBITRUM,  Tokens.ETH,    ChainId.AVALANCHE, Tokens.WETH_E, true),
                makeBridgeSwapTestCase(ChainId.ARBITRUM,  Tokens.WETH,   ChainId.AVALANCHE, Tokens.WETH_E, true),
                makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.WETH_E, ChainId.ARBITRUM,  Tokens.ETH,    true),
                makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.WETH_E, ChainId.ARBITRUM,  Tokens.WETH,   true),
            ];

            for (const tc of testCases) {
                const {args, expected} = tc;

                const {
                    tokenFrom: { symbol: tokenFromSymbol },
                    tokenTo:   { symbol: tokenToSymbol},
                    chainIdFrom,
                    chainIdTo
                } = args;

                const
                    netNameFrom = Networks.fromChainId(chainIdFrom).name,
                    netNameTo   = Networks.fromChainId(chainIdTo).name;

                const testTitle = `checkSwapSupported with params ${tokenFromSymbol} on ${netNameFrom} to ${tokenToSymbol} on ${netNameTo} should return ${expected}`

                it(testTitle, function(this: Mocha.Context) {
                    let { chainIdFrom, ...testArgs } = args;
                    const bridgeInstance = new Bridge.SynapseBridge({ network: chainIdFrom });

                    const [swapAllowed, errReason] = bridgeInstance.swapSupported({ ...testArgs, chainIdTo });
                    expectEqual(swapAllowed, expected, errReason);
                })
            }
        })

        describe("getEstimatedBridgeOutput", function(this: Mocha.Suite) {
            interface Expected {
                notZero:   boolean,
                wantError: boolean,
                noAddrTo:  boolean,
            }

            type TestCase = BridgeSwapTestCase<Expected>

            const makeTestCase = (
                t1: Token, t2: Token,
                c1: number, c2: number,
                amt?:      string,
                notZero?:  boolean,
                wantErr?:  boolean,
                noAddrTo?: boolean,
            ): TestCase => {
                const expected: Expected = {
                    notZero:   notZero  ?? true,
                    wantError: wantErr  ?? false,
                    noAddrTo:  noAddrTo ?? false,
                };

                return makeBridgeSwapTestCase(c1, t1, c2, t2, expected, getTestAmount(t1, c1, amt))
            }

            let testCases: TestCase[] = [
                makeTestCase(Tokens.DAI,     Tokens.USDC,    ChainId.ETH,       ChainId.BSC, "500"),
                makeTestCase(Tokens.DAI,     Tokens.USDC,    ChainId.ETH,       ChainId.BSC, "50"),
                makeTestCase(Tokens.DAI,     Tokens.USDC,    ChainId.ETH,       ChainId.BSC, "1",   false),
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
                makeTestCase(Tokens.ETH,     Tokens.WETH_E,  ChainId.ARBITRUM,  ChainId.AVALANCHE),
                makeTestCase(Tokens.WETH,    Tokens.WETH_E,  ChainId.ARBITRUM,  ChainId.AVALANCHE),
                makeTestCase(Tokens.WETH_E,  Tokens.ETH,     ChainId.AVALANCHE, ChainId.ARBITRUM),
                makeTestCase(Tokens.WETH_E,  Tokens.WETH,    ChainId.AVALANCHE, ChainId.ARBITRUM),
            ];

            function makeTestName(tc: TestCase): [string, string, string] {
                let {
                    args: {
                        amountFrom,
                        tokenFrom,
                        tokenFrom: { symbol: tokFrom },
                        tokenTo:   { symbol: tokTo   },
                        chainIdFrom: chainFrom,
                        chainIdTo:   chainTo,
                    },
                    expected: {
                        notZero,
                        wantError
                    }
                } = tc;

                const
                    amt             = formatUnits(amountFrom, tokenFrom.decimals(chainFrom)),
                    netFrom         = Networks.networkName(chainFrom),
                    netTo           = Networks.networkName(chainTo),
                    titleSuffix     = notZero ? "a value greater than zero" : "a value === zero",
                    testParamsTitle = `with params ${amt} ${tokFrom} on ${netFrom} to ${tokTo} on ${netTo}`,
                    testTitle       = `getEstimatedBridgeOutput ${testParamsTitle} should return ${titleSuffix}`,
                    titleSuffix1    =  wantError ? "should fail" : "should pass",
                    testTitle1      = `buildBridgeTokenTransaction ${testParamsTitle} ${titleSuffix1}`,
                    testTitle2      = `buildApproveTransaction ${testParamsTitle} ${titleSuffix1}`;

                return [testTitle, testTitle1, testTitle2]
            }

            for (const tc of testCases) {
                const [testTitle, testTitle1, testTitle2] = makeTestName(tc)

                let amountTo: BigNumber;

                it(testTitle, async function(this: Mocha.Context) {
                    this.timeout(DEFAULT_TEST_TIMEOUT)

                    let {args: { chainIdFrom, ...testArgs }, expected: {notZero, wantError}} = tc;

                    const bridgeInstance = new Bridge.SynapseBridge({ network: chainIdFrom });

                    let prom: Promise<BigNumber> = Promise.resolve(bridgeInstance.estimateBridgeTokenOutput(testArgs)
                        .then((res) => res.amountToReceive)
                    )

                    try {
                        amountTo = await prom;
                        return (notZero ? expectNotZero : expectZero)(amountTo)
                    } catch (e) {
                        return (await expectPromiseResolve(prom, !wantError))
                    }
                })

                it(testTitle2, async function(this: Mocha.Context) {
                    if (tc.expected.wantError) return

                    this.timeout(DEFAULT_TEST_TIMEOUT);

                    let {
                        args: {
                            chainIdFrom,
                            tokenFrom,
                            amountFrom,
                        },
                    } = tc;

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

                    return (await expectFulfilled(
                        bridgeInstance.buildApproveTransaction({token:  tokenFrom, amount: amountFrom})
                    ))
                })

                const undefEmptyArr = [
                    "", "", undefined, "", undefined,
                    undefined, "", "", undefined, undefined, ""
                ];


                it(testTitle1, async function(this: Mocha.Context) {
                    if (tc.expected.wantError) return

                    this.timeout(DEFAULT_TEST_TIMEOUT);

                    let {args: { chainIdFrom }, args, expected: {noAddrTo}} = tc;

                    const
                        bridgeInstance    = new Bridge.SynapseBridge({ network: chainIdFrom }),
                        addressTo: string = noAddrTo
                        ? _.shuffle(undefEmptyArr)[0]
                        : makeWalletSignerWithProvider(chainIdFrom, bridgeTestPrivkey).address;


                    return (await expectPromiseResolve(
                        bridgeInstance.buildBridgeTokenTransaction({...args, amountTo, addressTo}),
                        !noAddrTo
                    ))
                })
            }
        })
    })
})


function executeTransaction(
    prom: Promise<TransactionResponse|ContractTransaction>,
    done: Mocha.Done
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
        chainIdFrom    = ChainId.ARBITRUM,
        chainIdTo      = ChainId.AVALANCHE,
        amountFrom     = parseEther("420.696969"),
        bridgeArgs     = {tokenFrom, tokenTo, chainIdFrom, chainIdTo, amountFrom},
        wallet         = makeWalletSignerWithProvider(chainIdFrom, bridgeTestPrivkey),
        addressTo      = await wallet.getAddress(),
        bridgeInstance = new Bridge.SynapseBridge({ network: chainIdFrom });

    let
        outputEstimate: Bridge.BridgeOutputEstimate,
        doBridgeArgs: Bridge.BridgeTransactionParams;

    async function getBridgeEstimate(this: Mocha.Context, done: Mocha.Done) {
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

        step("approval transaction should be populated successfully", async function(this: Mocha.Context) {
            if (tokenFrom.isEqual(Tokens.ETH)) return

            this.timeout(DEFAULT_TEST_TIMEOUT);

            return (await expectFulfilled(
                bridgeInstance.buildApproveTransaction({token: tokenFrom}).then((txn) => approvalTxn = txn)
            ))
        })

        step("bridge transaction should be populated successfully", async function(this: Mocha.Context) {
            this.timeout(DEFAULT_TEST_TIMEOUT);

            return (await expectFulfilled(
                bridgeInstance.buildBridgeTokenTransaction(doBridgeArgs).then((txn) => bridgeTxn = txn)
            ))
        })

        describe.skip("send transactions", function(this: Mocha.Suite) {
            step("approval transaction should be sent successfully", function(this: Mocha.Context, done: Mocha.Done) {
                if (tokenFrom.isEqual(Tokens.ETH)) {
                    done();
                    return
                }

                this.timeout(EXECUTORS_TEST_TIMEOUT);

                executeTransaction(
                    wallet.sendTransaction(approvalTxn),
                    done
                );
            })

            step("token bridge transaction should be sent successfully", function(this: Mocha.Context, done: Mocha.Done) {
                if (tokenFrom.isEqual(Tokens.ETH)) {
                    done();
                    return
                }

                this.timeout(EXECUTORS_TEST_TIMEOUT);

                executeTransaction(
                    wallet.sendTransaction(bridgeTxn),
                    done
                );
            })
        })
    })

    describe("magic executors", function(this: Mocha.Suite) {
        step("should return an output estimate greater than zero", getBridgeEstimate);

        describe.skip("send transactions", function(this: Mocha.Suite) {
            step("erc20 approval transaction should execute successfully", function(this: Mocha.Context, done: Mocha.Done) {
                this.timeout(EXECUTORS_TEST_TIMEOUT);

                executeTransaction(
                    bridgeInstance.executeApproveTransaction({token: tokenFrom}, wallet),
                    done
                );
            })

            step("token bridge transaction should execute successfully", function(this: Mocha.Context, done: Mocha.Done) {
                this.timeout(EXECUTORS_TEST_TIMEOUT);

                executeTransaction(
                    bridgeInstance.executeBridgeTokenTransaction(doBridgeArgs, wallet),
                    done
                );
            })
        })

        // describe.skip("SynapseBridge bridge transaction", function(this: Mocha.Suite) {
        //     this.timeout(EXECUTORS_TEST_TIMEOUT);
        //
        //
        // })
    })
})