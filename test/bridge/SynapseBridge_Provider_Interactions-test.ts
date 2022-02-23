import "../helpers/chaisetup";

import {step} from "mocha-steps";

import type {Token} from "../../src";

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
import {BigNumber}  from "@ethersproject/bignumber";
import {Wallet} from "@ethersproject/wallet";

function executeTransaction(
    prom: Promise<TransactionResponse|ContractTransaction>
): Promise<void> {
    return Promise.resolve(prom)
        .then((txn: TransactionResponse|ContractTransaction): void => {
            txn.wait(1).then(() => {})
        })
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

interface TestCase {
    tokenFrom:       Token,
    tokenTo:         Token,
    chainIdFrom:     number,
    chainIdTo:       number,
    amountFrom:      BigNumber,
    testExecution:   boolean,
    executeSucceeds: boolean,
}

describe("SynapseBridge - Provider Interactions tests", async function(this: Mocha.Suite) {
    const testCases: TestCase[] = [
        {
            tokenFrom:       Tokens.ETH,
            tokenTo:         Tokens.WETH_E,
            chainIdFrom:     ChainId.ARBITRUM,
            chainIdTo:       ChainId.AVALANCHE,
            amountFrom:      parseEther("420.696969"),
            testExecution:   false,
            executeSucceeds: false,
        },
        {
            tokenFrom:       Tokens.ETH,
            tokenTo:         Tokens.NETH,
            chainIdFrom:     ChainId.ETH,
            chainIdTo:       ChainId.OPTIMISM,
            amountFrom:      parseEther("420.696969"),
            testExecution:   true,
            executeSucceeds: false,
        },
        {
            tokenFrom:       Tokens.BUSD,
            tokenTo:         Tokens.MIM,
            chainIdFrom:     ChainId.BSC,
            chainIdTo:       ChainId.FANTOM,
            amountFrom:      parseEther("666"),
            testExecution:   true,
            executeSucceeds: false,
        }
    ];

    interface EstimateOutputs {
        outputEstimate: Bridge.BridgeOutputEstimate,
        bridgeArgs:     Bridge.BridgeTransactionParams,
    }

    async function getBridgeEstimate(tc: TestCase, walletArgs: WalletArgs): Promise<EstimateOutputs> {
        return  walletArgs.bridgeInstance.estimateBridgeTokenOutput(tc)
            .then((res) => {
                return {
                    outputEstimate: res,
                    bridgeArgs: {
                        ...tc,
                        amountTo:  res.amountToReceive,
                        addressTo: walletArgs.address,
                    }
                }
            })
    }

    function testExecuteTxnStep(
        tc:       TestCase,
        txnProm:  Promise<TransactionResponse|ContractTransaction>,
        approval: boolean=false
    ): Mocha.AsyncFunc {
        return async function(this: Mocha.Context) {
            if (approval && tc.tokenFrom.isEqual(Tokens.ETH)) return

            this.timeout(EXECUTORS_TEST_TIMEOUT);

            let execProm = executeTransaction(txnProm);

            return tc.executeSucceeds
                ? (await expectFulfilled(execProm))
                : (await expectRejected(execProm))
        }
    }

    for (const tc of testCases) {
        const
            describeTitle:       string = `Test ${tc.tokenFrom.symbol} on ${Networks.networkName(tc.chainIdFrom)} to ${tc.tokenTo.symbol} on ${Networks.networkName(tc.chainIdTo)}`,
            executionTestSuffix: string = `should ${tc.executeSucceeds ? "execute succesfully" : "fail"}`;


        describe(describeTitle, async function(this: Mocha.Suite) {
            const walletArgs = await buildWalletArgs(tc.chainIdFrom);

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
                this.timeout(DEFAULT_TEST_TIMEOUT)
                let
                    approvalTxn:     PopulatedTransaction,
                    bridgeTxn:       PopulatedTransaction;

                step("approval transaction should be populated successfully", async function(this: Mocha.Context) {
                    if (tc.tokenFrom.isEqual(Tokens.ETH)) return

                    this.timeout(DEFAULT_TEST_TIMEOUT);

                    return (await expectFulfilled(
                        walletArgs.bridgeInstance.buildApproveTransaction({token: tc.tokenFrom}).then((txn) => approvalTxn = txn)
                    ))
                })

                step("bridge transaction should be populated successfully", async function(this: Mocha.Context) {
                    this.timeout(DEFAULT_TEST_TIMEOUT);

                    return (await expectFulfilled(
                        walletArgs.bridgeInstance.buildBridgeTokenTransaction(doBridgeArgs).then((txn) => bridgeTxn = txn)
                    ))
                })

                if (tc.testExecution) {
                    step(
                        `erc20 approval transaction ${executionTestSuffix}`,
                        testExecuteTxnStep(tc, walletArgs.wallet.sendTransaction(approvalTxn), true)
                    )

                    step(
                        `token bridge transaction transaction ${executionTestSuffix}`,
                        testExecuteTxnStep(tc, walletArgs.wallet.sendTransaction(bridgeTxn))
                    )
                }
            })

            if (tc.testExecution) {
                describe("magic executors", function(this: Mocha.Suite) {
                    describe("send transactions", function (this: Mocha.Suite) {
                        step(
                            `erc20 approval transaction ${executionTestSuffix}`,
                            testExecuteTxnStep(
                                tc,
                                walletArgs.bridgeInstance.executeApproveTransaction({token: tc.tokenFrom}, walletArgs.wallet),
                                true
                            )
                        )

                        step(
                            `token bridge transaction transaction ${executionTestSuffix}`,
                            testExecuteTxnStep(
                                tc,
                                walletArgs.bridgeInstance.executeBridgeTokenTransaction(doBridgeArgs, walletArgs.wallet)
                            )
                        )
                    })
                })
            }
        })
    }
})