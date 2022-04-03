import _ from "lodash";

import {
    ChainId,
    Networks,
    Tokens,
    Bridge,
    type Token
} from "@sdk";

import {tokenSwitch} from "@sdk/internal/utils";

import {
    DEFAULT_TEST_TIMEOUT,
    getTestAmount,
    expectPromiseResolve,
    valueIfUndefined,
    makeWalletSignerWithProvider,
    bridgeTestPrivkey1
} from "@tests/helpers";

import {
    type BridgeSwapTestCase,
    makeBridgeSwapTestCase
}  from "./bridge_test_utils";

import {formatUnits} from "@ethersproject/units";
import {BigNumber}   from "@ethersproject/bignumber";
import {expect} from "chai";
import {Zero} from "@ethersproject/constants";


describe("SynapseBridge - getEstimatedBridgeOutput tests", function(this: Mocha.Suite) {
    interface Expected {
        notZero:   boolean;
        wantError: boolean;
        noAddrTo:  boolean;
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

    function makeTestName(tc: TestCase): [string, string, string, string] {
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
            passFailSuffix:  string = wantError ? "should fail" : "should pass",
            passFailSuffix2: string = wantError || tc.expected.noAddrTo ? "should fail" : "should pass",
            testParamsTitle: string = `with params ${amt} ${tokFrom} on ${netFrom} to ${tokTo} on ${netTo}`;

        const
            describeTitle:         string = `Test bridge output estimation ${testParamsTitle}`,
            bridgeOutputTestTitle: string = `getEstimatedBridgeOutput should return ${titleSuffix}`,
            transactionTestTitle:  string = `buildBridgeTokenTransaction ${passFailSuffix2}`,
            approveTestTitle:      string = `buildApproveTransaction ${passFailSuffix}`;

        return [describeTitle, bridgeOutputTestTitle, transactionTestTitle, approveTestTitle]
    }

    const
        returnsEstimate: boolean = true,
        zeroEstimate:    boolean = false,
        returnsError:    boolean = true,
        noError:         boolean = false,
        invalidAddrTo:   boolean = true,
        randomAmtETH:    string  = undefined;

    const
        zeroETH:        string = "0",
        oneETH:         string = "1",
        niceETH:        string = "69",
        oneHundredETH:  string = "100",
        fiveHundredETH: string = "500",
        standardETH:    string = "2500",
        eliteETH:       string = "3133731337";

    [
        makeTestCase(Tokens.DAI,       Tokens.USDC,      ChainId.ETH,         ChainId.BSC,       fiveHundredETH),
        makeTestCase(Tokens.DAI,       Tokens.USDC,      ChainId.ETH,         ChainId.BSC,       "50"),
        makeTestCase(Tokens.DAI,       Tokens.USDC,      ChainId.ETH,         ChainId.BSC,       oneETH, zeroEstimate),
        makeTestCase(Tokens.NETH,      Tokens.ETH,       ChainId.BOBA,        ChainId.ETH,       "555"),
        makeTestCase(Tokens.NETH,      Tokens.NETH,      ChainId.BOBA,        ChainId.ETH,       "555"),
        makeTestCase(Tokens.USDC,      Tokens.NUSD,      ChainId.BOBA,        ChainId.BSC,       "20"),
        makeTestCase(Tokens.USDC,      Tokens.USDT,      ChainId.BSC,         ChainId.BOBA,      fiveHundredETH),
        makeTestCase(Tokens.FRAX,      Tokens.FRAX,      ChainId.MOONRIVER,   ChainId.ETH),
        makeTestCase(Tokens.FRAX,      Tokens.FRAX,      ChainId.ETH,         ChainId.MOONRIVER),
        makeTestCase(Tokens.SYN,       Tokens.SYN,       ChainId.MOONRIVER,   ChainId.ETH),
        makeTestCase(Tokens.SYN,       Tokens.SYN,       ChainId.ETH,         ChainId.MOONRIVER),
        makeTestCase(Tokens.WETH_E,    Tokens.NETH,      ChainId.OPTIMISM,    ChainId.ETH,       fiveHundredETH,  zeroEstimate,    returnsError),
        makeTestCase(Tokens.WETH_E,    Tokens.WETH,      ChainId.OPTIMISM,    ChainId.ETH,       fiveHundredETH,  zeroEstimate,    returnsError),
        makeTestCase(Tokens.WETH_E,    Tokens.USDC,      ChainId.AVALANCHE,   ChainId.ETH,       standardETH,     zeroEstimate,    returnsError),
        makeTestCase(Tokens.ETH,       Tokens.WETH_E,    ChainId.ETH,         ChainId.ETH,       "101",           returnsEstimate, returnsError),
        makeTestCase(Tokens.WETH,      Tokens.NETH,      ChainId.ETH,         ChainId.OPTIMISM,  standardETH),
        makeTestCase(Tokens.ETH,       Tokens.NETH,      ChainId.ETH,         ChainId.AVALANCHE, "4200"),
        makeTestCase(Tokens.WETH_E,    Tokens.ETH,       ChainId.AVALANCHE,   ChainId.ETH,       standardETH),
        makeTestCase(Tokens.WETH_E,    Tokens.ETH,       ChainId.AVALANCHE,   ChainId.ARBITRUM),
        makeTestCase(Tokens.ETH,       Tokens.WETH_E,    ChainId.ETH,         ChainId.AVALANCHE),
        makeTestCase(Tokens.NUSD,      Tokens.DAI,       ChainId.AVALANCHE,   ChainId.ETH),
        makeTestCase(Tokens.NUSD,      Tokens.DAI,       ChainId.AVALANCHE,   ChainId.POLYGON),
        makeTestCase(Tokens.DOG,       Tokens.DOG,       ChainId.POLYGON,     ChainId.ETH,       eliteETH),
        makeTestCase(Tokens.ETH,       Tokens.ETH,       ChainId.ARBITRUM,    ChainId.OPTIMISM),
        makeTestCase(Tokens.NETH,      Tokens.ETH,       ChainId.ARBITRUM,    ChainId.OPTIMISM),
        makeTestCase(Tokens.JUMP,      Tokens.JUMP,      ChainId.FANTOM,      ChainId.BSC),
        makeTestCase(Tokens.GOHM,      Tokens.GOHM,      ChainId.AVALANCHE,   ChainId.OPTIMISM,  oneETH),
        makeTestCase(Tokens.GOHM,      Tokens.GOHM,      ChainId.ETH,         ChainId.AVALANCHE, niceETH),
        makeTestCase(Tokens.GOHM,      Tokens.GOHM,      ChainId.HARMONY,     ChainId.MOONBEAM),
        makeTestCase(Tokens.GOHM,      Tokens.GOHM,      ChainId.ETH,         ChainId.AVALANCHE),
        makeTestCase(Tokens.GOHM,      Tokens.GOHM,      ChainId.CRONOS,      ChainId.AURORA,    randomAmtETH, zeroEstimate, returnsError),
        makeTestCase(Tokens.USDC,      Tokens.USDC,      ChainId.AURORA,      ChainId.AVALANCHE, niceETH),
        makeTestCase(Tokens.USDC,      Tokens.NUSD,      ChainId.BSC,         ChainId.AURORA,    niceETH),
        makeTestCase(Tokens.USDC,      Tokens.NUSD,      ChainId.AURORA,      ChainId.ETH,       "31337"),
        makeTestCase(Tokens.USDC,      Tokens.USDC,      ChainId.AURORA,      ChainId.AVALANCHE, zeroETH, zeroEstimate),
        makeTestCase(Tokens.USDC,      Tokens.NUSD,      ChainId.BSC,         ChainId.AURORA,    zeroETH, zeroEstimate),
        makeTestCase(Tokens.USDC,      Tokens.NUSD,      ChainId.AURORA,      ChainId.ETH,       zeroETH, zeroEstimate),
        makeTestCase(Tokens.USDC,      Tokens.NUSD,      ChainId.ETH,         ChainId.AURORA),
        makeTestCase(Tokens.WETH,      Tokens.WETH_E,    ChainId.ETH,         ChainId.AVALANCHE),
        makeTestCase(Tokens.NUSD,      Tokens.NUSD,      ChainId.ETH,         ChainId.AVALANCHE),
        makeTestCase(Tokens.WETH_E,    Tokens.WETH,      ChainId.AVALANCHE,   ChainId.OPTIMISM),
        makeTestCase(Tokens.WETH,      Tokens.ONE_ETH,   ChainId.ETH,         ChainId.HARMONY),
        makeTestCase(Tokens.ONE_ETH,   Tokens.WETH_E,    ChainId.HARMONY,     ChainId.AVALANCHE),
        makeTestCase(Tokens.HIGH,      Tokens.HIGH,      ChainId.BSC,         ChainId.ETH),
        makeTestCase(Tokens.JUMP,      Tokens.JUMP,      ChainId.BSC,         ChainId.FANTOM),
        makeTestCase(Tokens.DOG,       Tokens.DOG,       ChainId.BSC,         ChainId.POLYGON,   eliteETH),
        makeTestCase(Tokens.NFD,       Tokens.NFD,       ChainId.POLYGON,     ChainId.AVALANCHE, eliteETH),
        makeTestCase(Tokens.GMX,       Tokens.GMX,       ChainId.ARBITRUM,    ChainId.AVALANCHE),
        makeTestCase(Tokens.GMX,       Tokens.GMX,       ChainId.AVALANCHE,   ChainId.ARBITRUM),
        makeTestCase(Tokens.SOLAR,     Tokens.SOLAR,     ChainId.MOONRIVER,   ChainId.MOONBEAM),
        makeTestCase(Tokens.WAVAX,     Tokens.AVAX,      ChainId.MOONBEAM,    ChainId.AVALANCHE),
        makeTestCase(Tokens.AVAX,      Tokens.WAVAX,     ChainId.AVALANCHE,   ChainId.MOONBEAM),
        makeTestCase(Tokens.WMOVR,     Tokens.MOVR,      ChainId.MOONBEAM,    ChainId.MOONRIVER),
        makeTestCase(Tokens.MOVR,      Tokens.WMOVR,     ChainId.MOONRIVER,   ChainId.MOONBEAM),
        makeTestCase(Tokens.FTM_ETH,   Tokens.WETH,      ChainId.FANTOM,      ChainId.ETH),
        makeTestCase(Tokens.FTM_ETH,   Tokens.ETH,       ChainId.FANTOM,      ChainId.ETH),
        makeTestCase(Tokens.FTM_ETH,   Tokens.WETH_E,    ChainId.FANTOM,      ChainId.AVALANCHE),
        makeTestCase(Tokens.WETH_E,    Tokens.FTM_ETH,   ChainId.AVALANCHE,   ChainId.FANTOM),
        makeTestCase(Tokens.ETH,       Tokens.FTM_ETH,   ChainId.ETH,         ChainId.FANTOM),
        makeTestCase(Tokens.NUSD,      Tokens.DAI,       ChainId.AVALANCHE,   ChainId.POLYGON,   randomAmtETH, returnsEstimate, noError, invalidAddrTo),
        makeTestCase(Tokens.WETH,      Tokens.FTM_ETH,   ChainId.ETH,         ChainId.FANTOM,    randomAmtETH, returnsEstimate, noError, invalidAddrTo),
        makeTestCase(Tokens.ETH,       Tokens.WETH_E,    ChainId.ARBITRUM,    ChainId.AVALANCHE),
        makeTestCase(Tokens.WETH_E,    Tokens.ETH,       ChainId.AVALANCHE,   ChainId.ARBITRUM),
        makeTestCase(Tokens.USDC,      Tokens.DAI,       ChainId.BSC,         ChainId.ETH,       standardETH),
        makeTestCase(Tokens.NUSD,      Tokens.DAI,       ChainId.BSC,         ChainId.ETH,       standardETH),
        makeTestCase(Tokens.NUSD,      Tokens.USDC,      ChainId.ETH,         ChainId.BSC,       standardETH),
        makeTestCase(Tokens.NUSD,      Tokens.NUSD,      ChainId.POLYGON,     ChainId.BSC,       standardETH),
        makeTestCase(Tokens.UST,       Tokens.UST,       ChainId.BSC,         ChainId.POLYGON,   standardETH),
        makeTestCase(Tokens.UST,       Tokens.UST,       ChainId.POLYGON,     ChainId.ETH,       standardETH),
        makeTestCase(Tokens.NEWO,      Tokens.NEWO,      ChainId.AVALANCHE,   ChainId.HARMONY,   randomAmtETH, zeroEstimate, returnsError),
        makeTestCase(Tokens.NEWO,      Tokens.GMX,       ChainId.AVALANCHE,   ChainId.ARBITRUM,  randomAmtETH, zeroEstimate, returnsError),
        makeTestCase(Tokens.NEWO,      Tokens.NEWO,      ChainId.ARBITRUM,    ChainId.BSC,       randomAmtETH, zeroEstimate, returnsError),
        makeTestCase(Tokens.NEWO,      Tokens.NEWO,      ChainId.AURORA,      ChainId.HARMONY,   randomAmtETH, zeroEstimate, returnsError),
        makeTestCase(Tokens.NEWO,      Tokens.NEWO,      ChainId.ETH,         ChainId.BSC,       randomAmtETH, zeroEstimate, returnsError),
        makeTestCase(Tokens.NEWO,      Tokens.SDT,       ChainId.FANTOM,      ChainId.AVALANCHE, randomAmtETH, zeroEstimate, returnsError),
        makeTestCase(Tokens.NEWO,      Tokens.NEWO,      ChainId.AVALANCHE,   ChainId.ARBITRUM),
        makeTestCase(Tokens.NEWO,      Tokens.NEWO,      ChainId.ARBITRUM,    ChainId.AVALANCHE),
        makeTestCase(Tokens.NEWO,      Tokens.NEWO,      ChainId.ETH,         ChainId.AVALANCHE),
        makeTestCase(Tokens.NEWO,      Tokens.NEWO,      ChainId.ARBITRUM,    ChainId.ETH,       "800"),
        makeTestCase(Tokens.SDT,       Tokens.SDT,       ChainId.AVALANCHE,   ChainId.HARMONY),
        makeTestCase(Tokens.SDT,       Tokens.SDT,       ChainId.ETH,         ChainId.BSC,       randomAmtETH, zeroEstimate, returnsError),
        makeTestCase(Tokens.LUNA,      Tokens.LUNA,      ChainId.OPTIMISM,    ChainId.ARBITRUM),
        makeTestCase(Tokens.LUNA,      Tokens.LUNA,      ChainId.OPTIMISM,    ChainId.HARMONY,   randomAmtETH, zeroEstimate, returnsError),
        makeTestCase(Tokens.METIS_ETH, Tokens.ETH,       ChainId.METIS,       ChainId.ETH),
        makeTestCase(Tokens.ETH,       Tokens.METIS_ETH, ChainId.ETH,         ChainId.METIS),
        makeTestCase(Tokens.METIS_ETH, Tokens.ETH,       ChainId.METIS,       ChainId.BOBA),
        makeTestCase(Tokens.NETH,      Tokens.ETH,       ChainId.METIS,       ChainId.ETH),
        makeTestCase(Tokens.METIS_ETH, Tokens.ETH,       ChainId.METIS,       ChainId.ARBITRUM),
        makeTestCase(Tokens.METIS_ETH, Tokens.WETH_E,    ChainId.METIS,       ChainId.AVALANCHE),
        makeTestCase(Tokens.ONE_ETH,   Tokens.METIS_ETH, ChainId.HARMONY,     ChainId.METIS),
        makeTestCase(Tokens.FTM_ETH,   Tokens.METIS_ETH, ChainId.FANTOM,      ChainId.METIS),
        makeTestCase(Tokens.USDC,      Tokens.USDC,      ChainId.FANTOM,      ChainId.METIS,    oneHundredETH),
        makeTestCase(Tokens.USDC,      Tokens.USDC,      ChainId.ETH,         ChainId.METIS,    oneHundredETH),
        makeTestCase(Tokens.USDC,      Tokens.USDC,      ChainId.ARBITRUM,    ChainId.METIS,    oneHundredETH),
        makeTestCase(Tokens.USDC,      Tokens.NUSD,      ChainId.ARBITRUM,    ChainId.METIS,    oneHundredETH),
        makeTestCase(Tokens.AVAX,      Tokens.WAVAX,     ChainId.AVALANCHE,   ChainId.DFK),
        makeTestCase(Tokens.AVAX,      Tokens.SYN_AVAX,  ChainId.AVALANCHE,   ChainId.HARMONY),
        makeTestCase(Tokens.GAS_JEWEL, Tokens.JEWEL,     ChainId.DFK,         ChainId.HARMONY),
        makeTestCase(Tokens.JEWEL,     Tokens.JEWEL,     ChainId.HARMONY,     ChainId.AVALANCHE),
        makeTestCase(Tokens.USDC,      Tokens.DFK_USDC,  ChainId.ARBITRUM,    ChainId.DFK),
        makeTestCase(Tokens.DAI,       Tokens.DFK_USDC,  ChainId.HARMONY,     ChainId.DFK),
        makeTestCase(Tokens.NUSD,      Tokens.DFK_USDC,  ChainId.HARMONY,     ChainId.DFK),
        makeTestCase(Tokens.DFK_USDC,  Tokens.DAI,       ChainId.DFK,         ChainId.HARMONY),
        makeTestCase(Tokens.DFK_USDC,  Tokens.NUSD,      ChainId.DFK,         ChainId.HARMONY),
        makeTestCase(Tokens.USDT,      Tokens.DFK_USDC,  ChainId.FANTOM,      ChainId.DFK),
        makeTestCase(Tokens.NUSD,      Tokens.DFK_USDC,  ChainId.FANTOM,      ChainId.DFK),
        makeTestCase(Tokens.DFK_USDC,  Tokens.NUSD,      ChainId.DFK,         ChainId.FANTOM),
        makeTestCase(Tokens.DFK_USDC,  Tokens.USDT,      ChainId.DFK,         ChainId.FANTOM),
        makeTestCase(Tokens.USDT,      Tokens.DFK_USDC,  ChainId.FANTOM,      ChainId.DFK,       randomAmtETH, returnsEstimate, noError, invalidAddrTo),
        makeTestCase(Tokens.DFK_USDC,  Tokens.NUSD,      ChainId.DFK,         ChainId.AURORA,    randomAmtETH, returnsEstimate, noError, invalidAddrTo),
        makeTestCase(Tokens.USDC,      Tokens.DFK_USDC,  ChainId.FANTOM,      ChainId.DFK,       zeroETH,      zeroEstimate),
        makeTestCase(Tokens.DFK_USDC,  Tokens.NUSD,      ChainId.DFK,         ChainId.FANTOM,    oneETH,       zeroEstimate),
        makeTestCase(Tokens.DFK_USDC,  Tokens.DAI,       ChainId.DFK,         ChainId.AVALANCHE, "4",          zeroEstimate),
        makeTestCase(Tokens.DFK_USDC,  Tokens.NUSD,      ChainId.DFK,         ChainId.ETH,       "50",         zeroEstimate),
        makeTestCase(Tokens.NUSD,      Tokens.DFK_USDC,  ChainId.ETH,         ChainId.DFK,       "500",        returnsEstimate),
        makeTestCase(Tokens.NUSD,      Tokens.DFK_USDC,  ChainId.METIS,       ChainId.DFK,       oneETH,       returnsEstimate),
        makeTestCase(Tokens.DAI,       Tokens.DFK_USDC,  ChainId.AVALANCHE,   ChainId.DFK,       "3",          returnsEstimate),
    ].forEach((tc: TestCase) => {
        const [describeTitle, bridgeOutputTestTitle, transactionTestTitle, approveTestTitle] = makeTestName(tc)

        describe(describeTitle, function(this: Mocha.Suite) {
            let amountTo: BigNumber;

            it(bridgeOutputTestTitle, async function(this: Mocha.Context) {
                this.timeout(DEFAULT_TEST_TIMEOUT)

                let {args: { chainIdFrom, ...testArgs }, expected: {notZero, wantError}} = tc;

                const bridgeInstance = new Bridge.SynapseBridge({ network: chainIdFrom });

                let prom: Promise<Bridge.BridgeOutputEstimate> = bridgeInstance.estimateBridgeTokenOutput(testArgs);

                let amountToReceive: BigNumber;

                try {
                    const {amountToReceive: amt} = await prom;
                    amountToReceive = amt;
                } catch (e) {
                    return (await expectPromiseResolve(prom, !wantError))
                }

                amountTo = amountToReceive;

                if (notZero) {
                    return expect(amountToReceive).to.be.gt(Zero)
                }

                return expect(amountToReceive).to.equal(Zero)
            });

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
                    case Tokens.GAS_JEWEL:
                        tokenFrom = Tokens.JEWEL;
                        break;
                }

                let prom = bridgeInstance.buildApproveTransaction({token:  tokenFrom, amount: amountFrom});

                return (await expect(prom).to.eventually.be.fulfilled)
            });

            const undefEmptyArr = [
                "", "", undefined, "", undefined,
                undefined, "", "", undefined, undefined, ""
            ];

            it(transactionTestTitle, async function(this: Mocha.Context) {
                this.timeout(DEFAULT_TEST_TIMEOUT);

                let {args: { chainIdFrom }, args, expected: {wantError, noAddrTo}} = tc;

                const
                    bridgeInstance    = new Bridge.SynapseBridge({ network: chainIdFrom }),
                    addressTo: string = noAddrTo
                        ? _.shuffle(undefEmptyArr)[0]
                        : makeWalletSignerWithProvider(chainIdFrom, bridgeTestPrivkey1).address;

                let prom = bridgeInstance.buildBridgeTokenTransaction({...args, amountTo, addressTo});

                if (wantError || noAddrTo) {
                    return (await expect(prom).to.eventually.be.rejected)
                }

                return (await expect(prom).to.eventually.be.fulfilled)
            });
        });
    });
});


