import "../helpers/chaisetup";

import _ from "lodash";

import type {Token} from "@token";

import {
    ChainId,
    Networks,
    Tokens,
    Bridge,
} from "@sdk";

import {tokenSwitch} from "@internal/utils";

import {
    DEFAULT_TEST_TIMEOUT,
    bridgeTestPrivkey1,
    makeWalletSignerWithProvider,
    getTestAmount,
    expectEqual,
    expectFulfilled,
    expectPromiseResolve,
    expectZero,
    expectNotZero,
    valueIfUndefined, expectRejected,
} from "../helpers";

import {makeBridgeSwapTestCase}  from "./bridge_test_utils";
import type {BridgeSwapTestCase} from "./bridge_test_utils";

import {formatUnits} from "@ethersproject/units";
import {BigNumber}   from "@ethersproject/bignumber";


describe("SynapseBridge - Bridge/Swap tests", function(this: Mocha.Suite) {
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
            makeBridgeSwapTestCase(ChainId.ETH,       Tokens.ETH,    ChainId.BOBA,      Tokens.NETH,   true),
            makeBridgeSwapTestCase(ChainId.ETH,       Tokens.ETH,    ChainId.BOBA,      Tokens.ETH,    true),
            makeBridgeSwapTestCase(ChainId.BOBA,      Tokens.ETH,    ChainId.ETH,       Tokens.ETH,    true),
            makeBridgeSwapTestCase(ChainId.BOBA,      Tokens.ETH,    ChainId.ETH,       Tokens.NETH,   true),
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
            makeBridgeSwapTestCase(ChainId.OPTIMISM,  Tokens.GOHM,   ChainId.AURORA,    Tokens.GOHM,   false),
            makeBridgeSwapTestCase(ChainId.ARBITRUM,  Tokens.GOHM,   ChainId.AVALANCHE, Tokens.GOHM,   true),
            makeBridgeSwapTestCase(ChainId.HARMONY,   Tokens.GOHM,   ChainId.AVALANCHE, Tokens.GOHM,   true),
            makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.GOHM,   ChainId.BSC,       Tokens.GOHM,   true),
            makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.GOHM,   ChainId.HARMONY,   Tokens.GOHM,   true),
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
                notZero:   valueIfUndefined(notZero,  true),
                wantError: valueIfUndefined(wantErr,  false),
                noAddrTo:  valueIfUndefined(noAddrTo, false),
            };

            return makeBridgeSwapTestCase(c1, t1, c2, t2, expected, getTestAmount(t1, c1, amt))
        }

        let testCases: TestCase[] = [
            makeTestCase(Tokens.DAI,     Tokens.USDC,    ChainId.ETH,       ChainId.BSC, "500"),
            makeTestCase(Tokens.DAI,     Tokens.USDC,    ChainId.ETH,       ChainId.BSC, "50"),
            makeTestCase(Tokens.DAI,     Tokens.USDC,    ChainId.ETH,       ChainId.BSC, "1",   false),
            makeTestCase(Tokens.NETH,    Tokens.ETH,     ChainId.BOBA,      ChainId.ETH, "555"),
            makeTestCase(Tokens.NETH,    Tokens.NETH,    ChainId.BOBA,      ChainId.ETH, "555"),
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
            makeTestCase(Tokens.GOHM,    Tokens.GOHM,    ChainId.AVALANCHE, ChainId.OPTIMISM,  "1"),
            makeTestCase(Tokens.GOHM,    Tokens.GOHM,    ChainId.ETH,       ChainId.AVALANCHE, "69"),
            makeTestCase(Tokens.GOHM,    Tokens.GOHM,    ChainId.HARMONY,   ChainId.MOONBEAM),
            makeTestCase(Tokens.GOHM,    Tokens.GOHM,    ChainId.HARMONY,   ChainId.MOONRIVER),
            makeTestCase(Tokens.GOHM,    Tokens.GOHM,    ChainId.ETH,       ChainId.AVALANCHE),
            makeTestCase(Tokens.GOHM,    Tokens.GOHM,    ChainId.CRONOS,    ChainId.AURORA,    undefined, false, true),
            makeTestCase(Tokens.USDC,    Tokens.USDC,    ChainId.AURORA,    ChainId.AVALANCHE, "69"),
            makeTestCase(Tokens.USDC,    Tokens.NUSD,    ChainId.BSC,       ChainId.AURORA,    "69"),
            makeTestCase(Tokens.USDC,    Tokens.NUSD,    ChainId.AURORA,    ChainId.ETH,       "69", false),
            makeTestCase(Tokens.USDC,    Tokens.NUSD,    ChainId.AURORA,    ChainId.ETH,       "31337"),
            makeTestCase(Tokens.USDC,    Tokens.USDC,    ChainId.AURORA,    ChainId.AVALANCHE, "0", false),
            makeTestCase(Tokens.USDC,    Tokens.NUSD,    ChainId.BSC,       ChainId.AURORA,    "0", false),
            makeTestCase(Tokens.USDC,    Tokens.NUSD,    ChainId.AURORA,    ChainId.ETH,       "0", false),
            makeTestCase(Tokens.USDC,    Tokens.NUSD,    ChainId.AURORA,    ChainId.ETH,       "0", false),
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
            makeTestCase(Tokens.USDC,    Tokens.DAI,     ChainId.BSC,       ChainId.ETH,     "2500"),
            makeTestCase(Tokens.NUSD,    Tokens.DAI,     ChainId.BSC,       ChainId.ETH,     "2500"),
            makeTestCase(Tokens.NUSD,    Tokens.USDC,    ChainId.ETH,       ChainId.BSC,     "2500"),
            makeTestCase(Tokens.NUSD,    Tokens.USDT,    ChainId.ETH,       ChainId.BSC,     "2500"),
            makeTestCase(Tokens.NUSD,    Tokens.NUSD,    ChainId.BSC,       ChainId.POLYGON, "2500"),
            makeTestCase(Tokens.NUSD,    Tokens.NUSD,    ChainId.POLYGON,   ChainId.BSC,     "2500"),
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
                netTo           = Networks.networkName(chainTo);

            const
                titleSuffix:     string = notZero ? "a value greater than zero" : "a value === zero",
                passFailSuffix:  string =  wantError ? "should fail" : "should pass",
                testParamsTitle: string = `with params ${amt} ${tokFrom} on ${netFrom} to ${tokTo} on ${netTo}`;

            const
                bridgeOutputTestTitle: string = `getEstimatedBridgeOutput ${testParamsTitle} should return ${titleSuffix}`,
                transactionTestTitle:  string = `buildBridgeTokenTransaction ${testParamsTitle} ${passFailSuffix}`,
                approveTestTitle:      string = `buildApproveTransaction ${testParamsTitle} ${passFailSuffix}`;

            return [bridgeOutputTestTitle, transactionTestTitle, approveTestTitle]
        }

        for (const tc of testCases) {
            const [bridgeOutputTestTitle, transactionTestTitle, approveTestTitle] = makeTestName(tc)

            let amountTo: BigNumber;

            it(bridgeOutputTestTitle, async function(this: Mocha.Context) {
                this.timeout(DEFAULT_TEST_TIMEOUT)

                let {args: { chainIdFrom, ...testArgs }, expected: {notZero, wantError}} = tc;

                const bridgeInstance = new Bridge.SynapseBridge({ network: chainIdFrom });

                let prom: Promise<BigNumber> = bridgeInstance.estimateBridgeTokenOutput(testArgs).then(res => res.amountToReceive);

                try {
                    amountTo = await prom;
                    return (notZero ? expectNotZero : expectZero)(amountTo)
                } catch (e) {
                    return (await expectPromiseResolve(prom, !wantError))
                }
            })

            it(approveTestTitle, async function(this: Mocha.Context) {
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

                switch (tokenSwitch(tokenFrom)) {
                    case Tokens.ETH:
                        tokenFrom = Tokens.WETH;
                        break;
                    case Tokens.AVAX:
                        tokenFrom = Tokens.WAVAX;
                        break;
                    case Tokens.MOVR:
                        tokenFrom = Tokens.WMOVR;
                        break;
                }

                let prom = bridgeInstance.buildApproveTransaction({token:  tokenFrom, amount: amountFrom});

                return (await expectFulfilled(prom))
            })

            const undefEmptyArr = [
                "", "", undefined, "", undefined,
                undefined, "", "", undefined, undefined, ""
            ];

            it(transactionTestTitle, async function(this: Mocha.Context) {
                this.timeout(DEFAULT_TEST_TIMEOUT);

                let {args: { chainIdFrom }, args, expected: {noAddrTo}} = tc;

                const
                    bridgeInstance    = new Bridge.SynapseBridge({ network: chainIdFrom }),
                    addressTo: string = noAddrTo
                    ? _.shuffle(undefEmptyArr)[0]
                    : makeWalletSignerWithProvider(chainIdFrom, bridgeTestPrivkey1).address;

                let prom = bridgeInstance.buildBridgeTokenTransaction({...args, amountTo, addressTo});

                return (await (
                    tc.expected.wantError
                        ? expectRejected(prom)
                        : expectPromiseResolve(prom, !noAddrTo)
                ))
            })
        }
    })
})


