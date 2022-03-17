import {PopulatedTransaction} from "@ethersproject/contracts";
import {step} from "mocha-steps";
import {
    bridgeTestPrivkey1,
    DEFAULT_TEST_TIMEOUT,
    expectFulfilled,
    getTestAmount,
    makeWalletSignerWithProvider
} from "@tests/helpers";
import {Bridge, ChainId, Networks, Token, Tokens} from "@sdk";

import {TransactionDescription} from "@ethersproject/abi";
import {L1BridgeZapFactory, L2BridgeZapFactory} from "@contracts";
import {expect} from "chai";
import {BridgeSwapTestCase, makeBridgeSwapTestCase} from "./bridge_test_utils";
import {formatUnits} from "@ethersproject/units";


describe("SynapseBridge - buildBridgeTokenTransaction tests", function(this: Mocha.Suite) {
    interface Expected {
        wantFn: string,
    }

    type TestCase = BridgeSwapTestCase<Expected>

    const makeTestCase = (
        t1: Token, t2: Token,
        c1: number, c2: number,
        wantFn:    string,
    ): TestCase => {
        const expected: Expected = {wantFn};

        return makeBridgeSwapTestCase(c1, t1, c2, t2, expected, getTestAmount(t1, c1))
    }

    function makeTestName(tc: TestCase): string {
        let {
            args: {
                amountFrom,
                tokenFrom,
                tokenFrom: { symbol: tokFrom },
                tokenTo:   { symbol: tokTo   },
                chainIdFrom: chainFrom,
                chainIdTo:   chainTo,
            },
            expected: {wantFn}
        } = tc;

        const
            amt             = formatUnits(amountFrom, tokenFrom.decimals(chainFrom)),
            netFrom         = Networks.networkName(chainFrom),
            netTo           = Networks.networkName(chainTo);

        const
            testPrefix:      string = "buildBridgeTokenTransaction()",
            testParamsTitle: string = `with params ${tokFrom} on ${netFrom} -> ${tokTo} on ${netTo}`,
            testWant:        string = `should be a transaction which calls ${wantFn}()`;

        return `${testPrefix} ${testParamsTitle} ${testWant}`
    }

    const
        redeem                  = "redeem",
        deposit                 = "deposit",
        depositETH              = "depositETH",
        redeemAndSwap           = "redeemAndSwap",
        redeemAndRemove         = "redeemAndRemove",
        swapAndRedeemAndRemove  = "swapAndRedeemAndRemove",
        swapETHAndRedeem        = "swapETHAndRedeem",
        swapAndRedeem           = "swapAndRedeem",
        swapETHAndRedeemAndSwap = "swapETHAndRedeemAndSwap",
        swapAndRedeemAndSwap    = "swapAndRedeemAndSwap",
        zapAndDeposit           = "zapAndDeposit",
        zapAndDepositAndSwap    = "zapAndDepositAndSwap",
        depositAndSwap          = "depositAndSwap",
        depositETHAndSwap       = "depositETHAndSwap";

    [
        makeTestCase(Tokens.DAI,     Tokens.USDC,    ChainId.ETH,       ChainId.BSC,         zapAndDepositAndSwap),
        makeTestCase(Tokens.NETH,    Tokens.ETH,     ChainId.BOBA,      ChainId.ETH,         redeem),
        makeTestCase(Tokens.NETH,    Tokens.NETH,    ChainId.BOBA,      ChainId.ETH,         redeem),
        makeTestCase(Tokens.USDC,    Tokens.NUSD,    ChainId.BOBA,      ChainId.BSC,         swapAndRedeem),
        makeTestCase(Tokens.USDC,    Tokens.USDT,    ChainId.BSC,       ChainId.BOBA,        swapAndRedeemAndSwap),
        makeTestCase(Tokens.FRAX,    Tokens.FRAX,    ChainId.MOONRIVER, ChainId.ETH,         redeem),
        makeTestCase(Tokens.FRAX,    Tokens.FRAX,    ChainId.ETH,       ChainId.MOONRIVER,   deposit),
        makeTestCase(Tokens.SYN,     Tokens.SYN,     ChainId.MOONRIVER, ChainId.ETH,         redeem),
        makeTestCase(Tokens.SYN,     Tokens.SYN,     ChainId.ETH,       ChainId.MOONRIVER,   redeem),
        makeTestCase(Tokens.ETH,     Tokens.NETH,    ChainId.OPTIMISM,  ChainId.ETH,         swapETHAndRedeem),
        makeTestCase(Tokens.ETH,     Tokens.NETH,    ChainId.ETH,       ChainId.AVALANCHE,   depositETH),
        makeTestCase(Tokens.WETH_E,  Tokens.ETH,     ChainId.AVALANCHE, ChainId.ETH,         swapAndRedeem),
        makeTestCase(Tokens.WETH_E,  Tokens.ETH,     ChainId.AVALANCHE, ChainId.ARBITRUM,    swapAndRedeemAndSwap),
        makeTestCase(Tokens.ETH,     Tokens.WETH_E,  ChainId.ETH,       ChainId.AVALANCHE,   depositETHAndSwap),
        makeTestCase(Tokens.NUSD,    Tokens.DAI,     ChainId.AVALANCHE, ChainId.ETH,         redeemAndRemove),
        makeTestCase(Tokens.DAI,     Tokens.DAI,     ChainId.AVALANCHE, ChainId.ETH,         swapAndRedeemAndRemove),
        makeTestCase(Tokens.NUSD,    Tokens.DAI,     ChainId.AVALANCHE, ChainId.POLYGON,     redeemAndSwap),
        makeTestCase(Tokens.DOG,     Tokens.DOG,     ChainId.POLYGON,   ChainId.ETH,         redeem),
        makeTestCase(Tokens.ETH,     Tokens.ETH,     ChainId.ARBITRUM,  ChainId.OPTIMISM,    swapETHAndRedeemAndSwap),
        makeTestCase(Tokens.NETH,    Tokens.ETH,     ChainId.ARBITRUM,  ChainId.OPTIMISM,    redeemAndSwap),
        makeTestCase(Tokens.JUMP,    Tokens.JUMP,    ChainId.FANTOM,    ChainId.BSC,         deposit),
        makeTestCase(Tokens.GOHM,    Tokens.GOHM,    ChainId.AVALANCHE, ChainId.OPTIMISM,    redeem),
        makeTestCase(Tokens.GOHM,    Tokens.GOHM,    ChainId.ETH,       ChainId.AVALANCHE,   deposit),
        makeTestCase(Tokens.GOHM,    Tokens.GOHM,    ChainId.HARMONY,   ChainId.MOONRIVER,   redeem),
        makeTestCase(Tokens.GOHM,    Tokens.GOHM,    ChainId.ETH,       ChainId.AVALANCHE,   deposit),
        makeTestCase(Tokens.USDC,    Tokens.USDC,    ChainId.AURORA,    ChainId.AVALANCHE,   swapAndRedeemAndSwap),
        makeTestCase(Tokens.USDC,    Tokens.NUSD,    ChainId.BSC,       ChainId.AURORA,      swapAndRedeem),
        makeTestCase(Tokens.USDC,    Tokens.NUSD,    ChainId.AURORA,    ChainId.ETH,         swapAndRedeem),
        makeTestCase(Tokens.USDC,    Tokens.NUSD,    ChainId.ETH,       ChainId.AURORA,      zapAndDeposit),
        makeTestCase(Tokens.WETH,    Tokens.WETH_E,  ChainId.ETH,       ChainId.AVALANCHE,   depositETHAndSwap),
        makeTestCase(Tokens.NUSD,    Tokens.NUSD,    ChainId.ETH,       ChainId.AVALANCHE,   deposit),
        makeTestCase(Tokens.WETH_E,  Tokens.WETH,    ChainId.AVALANCHE, ChainId.OPTIMISM,    swapAndRedeemAndSwap),
        makeTestCase(Tokens.WETH,    Tokens.ONE_ETH, ChainId.ETH,       ChainId.HARMONY,     depositETHAndSwap),
        makeTestCase(Tokens.ONE_ETH, Tokens.WETH_E,  ChainId.HARMONY,   ChainId.AVALANCHE,   swapAndRedeemAndSwap),
        makeTestCase(Tokens.HIGH,    Tokens.HIGH,    ChainId.BSC,       ChainId.ETH,         redeem),
        makeTestCase(Tokens.JUMP,    Tokens.JUMP,    ChainId.BSC,       ChainId.FANTOM,      redeem),
        makeTestCase(Tokens.DOG,     Tokens.DOG,     ChainId.BSC,       ChainId.POLYGON,     redeem),
        makeTestCase(Tokens.NFD,     Tokens.NFD,     ChainId.POLYGON,   ChainId.AVALANCHE,   deposit),
        makeTestCase(Tokens.GMX,     Tokens.GMX,     ChainId.ARBITRUM,  ChainId.AVALANCHE,   deposit),
        makeTestCase(Tokens.GMX,     Tokens.GMX,     ChainId.AVALANCHE, ChainId.ARBITRUM,    redeem),
        makeTestCase(Tokens.SOLAR,   Tokens.SOLAR,   ChainId.MOONRIVER, ChainId.MOONBEAM,    deposit),
        makeTestCase(Tokens.WAVAX,   Tokens.AVAX,    ChainId.MOONBEAM,  ChainId.AVALANCHE,   redeem),
        makeTestCase(Tokens.AVAX,    Tokens.WAVAX,   ChainId.AVALANCHE, ChainId.MOONBEAM,    depositETH),
        makeTestCase(Tokens.WMOVR,   Tokens.MOVR,    ChainId.MOONBEAM,  ChainId.MOONRIVER,   redeem),
        makeTestCase(Tokens.MOVR,    Tokens.WMOVR,   ChainId.MOONRIVER, ChainId.MOONBEAM,    depositETH),
        makeTestCase(Tokens.FTM_ETH, Tokens.WETH,    ChainId.FANTOM,    ChainId.ETH,         swapAndRedeem),
        makeTestCase(Tokens.FTM_ETH, Tokens.ETH,     ChainId.FANTOM,    ChainId.ETH,         swapAndRedeem),
        makeTestCase(Tokens.FTM_ETH, Tokens.WETH_E,  ChainId.FANTOM,    ChainId.AVALANCHE,   swapAndRedeemAndSwap),
        makeTestCase(Tokens.WETH_E,  Tokens.FTM_ETH, ChainId.AVALANCHE, ChainId.FANTOM,      swapAndRedeemAndSwap),
        makeTestCase(Tokens.ETH,     Tokens.FTM_ETH, ChainId.ETH,       ChainId.FANTOM,      depositETHAndSwap),
        makeTestCase(Tokens.WETH,    Tokens.FTM_ETH, ChainId.ETH,       ChainId.FANTOM,      depositETHAndSwap),
        makeTestCase(Tokens.ETH,     Tokens.WETH_E,  ChainId.ARBITRUM,  ChainId.AVALANCHE,   swapETHAndRedeemAndSwap),
        makeTestCase(Tokens.WETH,    Tokens.WETH_E,  ChainId.ARBITRUM,  ChainId.AVALANCHE,   swapETHAndRedeemAndSwap),
        makeTestCase(Tokens.WETH_E,  Tokens.ETH,     ChainId.AVALANCHE, ChainId.ARBITRUM,    swapAndRedeemAndSwap),
        makeTestCase(Tokens.WETH_E,  Tokens.WETH,    ChainId.AVALANCHE, ChainId.ARBITRUM,    swapAndRedeemAndSwap),
        makeTestCase(Tokens.USDC,    Tokens.DAI,     ChainId.BSC,       ChainId.ETH,         swapAndRedeemAndRemove),
        makeTestCase(Tokens.NUSD,    Tokens.DAI,     ChainId.BSC,       ChainId.ETH,         redeemAndRemove),
        makeTestCase(Tokens.NUSD,    Tokens.USDC,    ChainId.ETH,       ChainId.BSC,         depositAndSwap),
        makeTestCase(Tokens.NUSD,    Tokens.NUSD,    ChainId.BSC,       ChainId.POLYGON,     redeem),
        makeTestCase(Tokens.NUSD,    Tokens.NUSD,    ChainId.POLYGON,   ChainId.BSC,         redeem),
        makeTestCase(Tokens.UST,     Tokens.UST,     ChainId.BSC,       ChainId.POLYGON,     redeem),
        makeTestCase(Tokens.UST,     Tokens.UST,     ChainId.POLYGON,   ChainId.ETH,         redeem),
        makeTestCase(Tokens.NEWO,    Tokens.NEWO,    ChainId.ARBITRUM,  ChainId.AVALANCHE,   redeem),
        makeTestCase(Tokens.NEWO,    Tokens.NEWO,    ChainId.ETH,       ChainId.AVALANCHE,   deposit),
        makeTestCase(Tokens.NEWO,    Tokens.NEWO,    ChainId.AVALANCHE, ChainId.ETH,         redeem),
        makeTestCase(Tokens.LUNA,    Tokens.LUNA,    ChainId.ARBITRUM,  ChainId.OPTIMISM,    redeem),
        makeTestCase(Tokens.LUNA,    Tokens.LUNA,    ChainId.OPTIMISM,  ChainId.ARBITRUM,    redeem),
    ].forEach((tc: TestCase) => {
        const testTitle = makeTestName(tc);
        describe(testTitle, function(this: Mocha.Suite) {
            let builtTxn: PopulatedTransaction;

            const amountTo = tc.args.amountFrom.sub(5);

            step("build transaction", async function(this: Mocha.Context) {
                this.timeout(DEFAULT_TEST_TIMEOUT);

                let {args: { chainIdFrom }, args} = tc;

                const
                    bridgeInstance    = new Bridge.SynapseBridge({ network: chainIdFrom }),
                    addressTo: string = makeWalletSignerWithProvider(chainIdFrom, bridgeTestPrivkey1).address;

                let prom = bridgeInstance.buildBridgeTokenTransaction({...args, amountTo, addressTo});
                Promise.resolve(prom).then(built => builtTxn = built);

                return (await expectFulfilled(prom))
            })

            let txnInfo: TransactionDescription;
            const
                l1BridgeZapInterface = L1BridgeZapFactory.createInterface(),
                l2BridgeZapInterface = L2BridgeZapFactory.createInterface();


            step(`tx should be a call to function ${tc.expected.wantFn}()`, function(this: Mocha.Context) {
                txnInfo = tc.args.chainIdFrom === ChainId.ETH
                    ? l1BridgeZapInterface.parseTransaction({data: builtTxn.data || ""})
                    : l2BridgeZapInterface.parseTransaction({data: builtTxn.data || ""});

                expect(txnInfo.name).to.equal(tc.expected.wantFn);
            });
        });
    });
});