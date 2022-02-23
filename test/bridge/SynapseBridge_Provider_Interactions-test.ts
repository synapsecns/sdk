import "../helpers/chaisetup";

import {step} from "mocha-steps";


import {
    Bridge,
    ChainId,
    Tokens,
    Networks,
} from "@sdk";

import {
    DEFAULT_TEST_TIMEOUT,
    EXECUTORS_TEST_TIMEOUT,
    bridgeTestPrivkey,
    expectFulfilled,
    makeWalletSignerWithProvider, expectNotZero, expectRejected,
} from "../helpers";

import type {TransactionResponse} from "@ethersproject/providers";

import type {
    ContractTransaction,
    PopulatedTransaction,
} from "@ethersproject/contracts";

import {parseEther} from "@ethersproject/units";
import {Wallet}     from "@ethersproject/wallet";

import {rejectPromise} from "@common/utils";
import type {BridgeSwapTestCase} from "./bridge_test_utils";

function executeTransaction(
    prom: Promise<TransactionResponse|ContractTransaction>
): Promise<void> {
    return Promise.resolve(prom)
        .then((txn: TransactionResponse|ContractTransaction): void => {
            txn.wait(1).then(() => {})
        })
}

interface EstimateOutputs {
    outputEstimate: Bridge.BridgeOutputEstimate,
    bridgeArgs:     Bridge.BridgeTransactionParams,
}

interface WalletArgs {
    wallet:         Wallet,
    address:        string,
    bridgeInstance: Bridge.SynapseBridge,
}

async function buildWalletArgs(chainId: number): Promise<WalletArgs> {
    const wallet = makeWalletSignerWithProvider(chainId, bridgeTestPrivkey);

    return {
        wallet,
        address: (await wallet.getAddress()),
        bridgeInstance: new Bridge.SynapseBridge({ network: chainId })
    }
}

describe("SynapseBridge - Provider Interactions tests", async function(this: Mocha.Suite) {
    type TestCase = BridgeSwapTestCase<boolean>;

    const testCases: TestCase[] = [
        {
            args: {
                tokenFrom:   Tokens.ETH,
                tokenTo:     Tokens.WETH_E,
                chainIdFrom: ChainId.ARBITRUM,
                chainIdTo:   ChainId.AVALANCHE,
                amountFrom:  parseEther("420.696969"),
            },
            expected: false, // whether we desire success
        },
        {
            args: {
                tokenFrom:   Tokens.ETH,
                tokenTo:     Tokens.NETH,
                chainIdFrom: ChainId.ETH,
                chainIdTo:   ChainId.OPTIMISM,
                amountFrom:  parseEther("420.696969"),
            },
            expected: false, // whether we desire success
        },
        {
            args: {
                tokenFrom:   Tokens.BUSD,
                tokenTo:     Tokens.MIM,
                chainIdFrom: ChainId.BSC,
                chainIdTo:   ChainId.FANTOM,
                amountFrom:  parseEther("666"),
            },
            expected: false, // whether we desire success
        }
    ];

    const getBridgeEstimate = async (
        tc: TestCase,
        {
            address,
            bridgeInstance,
        }: WalletArgs
    ): Promise<EstimateOutputs> =>
        bridgeInstance.estimateBridgeTokenOutput(tc.args)
            .then(res =>
                ({
                    outputEstimate: res,
                    bridgeArgs: {
                        ...tc.args,
                        amountTo: res.amountToReceive,
                        addressTo: address,
                    }
                })
            )
            .catch(rejectPromise)

    for (const tc of testCases) {
        const
            describeTitle:       string = `Test ${tc.args.tokenFrom.symbol} on ${Networks.networkName(tc.args.chainIdFrom)} to ${tc.args.tokenTo.symbol} on ${Networks.networkName(tc.args.chainIdTo)}`,
            executionTestSuffix: string = `should ${tc.expected ? "execute succesfully" : "fail"}`;

        const
            executeTxnTestTitle = (txnKind: string): string => `${txnKind} transaction ${executionTestSuffix}`,
            approvalTxnTestTitle: string = executeTxnTestTitle("ERC20.Approve"),
            bridgeTxnTestTitle:   string = executeTxnTestTitle("SynapseBridge token bridge");

        describe(describeTitle, function(this: Mocha.Suite) {
            let
                walletArgs:     WalletArgs,
                wallet:         Wallet,
                bridgeInstance: Bridge.SynapseBridge;

            before(async function(this: Mocha.Context) {
                this.timeout(DEFAULT_TEST_TIMEOUT);

                walletArgs     = await buildWalletArgs(tc.args.chainIdFrom);

                wallet         = walletArgs.wallet;
                bridgeInstance = walletArgs.bridgeInstance;
            })

            let
                outputEstimate: Bridge.BridgeOutputEstimate,
                doBridgeArgs:   Bridge.BridgeTransactionParams;

            step("acquire output estimate", async function(this: Mocha.Context) {
                this.timeout(DEFAULT_TEST_TIMEOUT);

                let prom = getBridgeEstimate(tc, walletArgs);

                await expectFulfilled(prom);

                const {outputEstimate: estimate, bridgeArgs: bridgeParams} = await prom;

                expectNotZero(estimate.amountToReceive);

                outputEstimate = estimate;
                doBridgeArgs = bridgeParams;

                return
            })

            describe("test using transaction builders", function(this: Mocha.Suite) {
                let
                    approvalTxn:     PopulatedTransaction,
                    bridgeTxn:       PopulatedTransaction;

                step("approval transaction should be populated successfully", async function(this: Mocha.Context) {
                    if (tc.args.tokenFrom.isEqual(Tokens.ETH)) return
                    this.timeout(DEFAULT_TEST_TIMEOUT);

                    return (await expectFulfilled(
                        bridgeInstance
                            .buildApproveTransaction({token: tc.args.tokenFrom})
                            .then((txn) => approvalTxn = txn)
                    ))
                })

                step("bridge transaction should be populated successfully", async function(this: Mocha.Context) {
                    this.timeout(DEFAULT_TEST_TIMEOUT);

                    return (await expectFulfilled(
                        bridgeInstance
                            .buildBridgeTokenTransaction(doBridgeArgs)
                            .then((txn) => bridgeTxn = txn)
                    ))
                })

                step(approvalTxnTestTitle, async function (this: Mocha.Context) {
                    if (tc.args.tokenFrom.isEqual(Tokens.ETH)) return

                    this.timeout(EXECUTORS_TEST_TIMEOUT);

                    let execProm = executeTransaction(wallet.sendTransaction(approvalTxn));

                    return (await (tc.expected
                            ? expectFulfilled(execProm)
                            : expectRejected(execProm)
                    ))
                })

                step(bridgeTxnTestTitle, async function(this: Mocha.Context) {
                    this.timeout(EXECUTORS_TEST_TIMEOUT);

                    let execProm = executeTransaction(wallet.sendTransaction(bridgeTxn));

                    return (await (tc.expected
                            ? expectFulfilled(execProm)
                            : expectRejected(execProm)
                    ))
                })
            })

            describe("Test Magic Executors", function(this: Mocha.Suite) {
                step(approvalTxnTestTitle, async function(this: Mocha.Context) {
                    if (tc.args.tokenFrom.isEqual(Tokens.ETH)) return

                    this.timeout(EXECUTORS_TEST_TIMEOUT);

                    let execProm = executeTransaction(bridgeInstance.executeApproveTransaction({token: tc.args.tokenFrom}, wallet));

                    return (await (tc.expected
                            ? expectFulfilled(execProm)
                            : expectRejected(execProm)
                    ))
                })

                step(bridgeTxnTestTitle, async function(this: Mocha.Context) {
                    this.timeout(EXECUTORS_TEST_TIMEOUT);

                    let execProm = executeTransaction(bridgeInstance.executeBridgeTokenTransaction(doBridgeArgs, wallet));

                    return (await (tc.expected
                            ? expectFulfilled(execProm)
                            : expectRejected(execProm)
                    ))
                })
            })
        })
    }
})