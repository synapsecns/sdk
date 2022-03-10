import {expect} from "chai";
import {step} from "mocha-steps";

import {Bridge, ChainId, Networks, Tokens} from "@sdk";

import {rejectPromise, staticCallPopulatedTransaction} from "@sdk/common/utils";

import {
    bridgeTestPrivkey1,
    DEFAULT_TEST_TIMEOUT,
    expectFulfilled,
    expectNotZero,
    expectRejected,
    makeWalletSignerWithProvider,
} from "@tests/helpers";

import {bridgeInteractionsPrivkey, type BridgeSwapTestCase} from "./bridge_test_utils";

import type {TransactionResponse} from "@ethersproject/providers";

import type {ContractTransaction, PopulatedTransaction,} from "@ethersproject/contracts";

import {Wallet} from "@ethersproject/wallet";
import {parseEther} from "@ethersproject/units";
import {BigNumber} from "@ethersproject/bignumber";
import {StaticCallResult} from "@common/types";

type TxnResponse = ContractTransaction | TransactionResponse;

function executeTransaction(prom: Promise<TxnResponse>): Promise<void> {
    return Promise.resolve(prom)
        .then((response: TxnResponse): Promise<void> => {
            return response.wait(1)
                .then(() => {})
                .catch(rejectPromise)
        })
}

function callStatic(prom: Promise<StaticCallResult>): Promise<void> {
    return Promise.resolve(prom)
        .then((response: StaticCallResult): Promise<void> => {
            if (response === StaticCallResult.Failure) {
                return rejectPromise("Static Call Failed")
            }

            return
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

async function buildWalletArgs(chainId: number, privkey: string=bridgeTestPrivkey1): Promise<WalletArgs> {
    const wallet = makeWalletSignerWithProvider(chainId, privkey);

    return {
        wallet,
        address:       (await wallet.getAddress()),
        bridgeInstance: new Bridge.SynapseBridge({ network: Networks.fromChainId(chainId) })
    }
}

describe("SynapseBridge - Provider Interactions tests", async function(this: Mocha.Suite) {

    interface TestOpts {
        executeSuccess: boolean,
        canBridge:      boolean,
    }

    interface TestCase extends BridgeSwapTestCase<TestOpts> {
        callStatic: boolean,
    }

    const executeFailAmt: BigNumber = parseEther("420.696969");

    const testCases: TestCase[] = [
        {
            args: {
                tokenFrom:   Tokens.ETH,
                tokenTo:     Tokens.WETH,
                chainIdFrom: ChainId.OPTIMISM,
                chainIdTo:   ChainId.ETH,
                amountFrom:  executeFailAmt,
            },
            expected: {
                executeSuccess: false,
                canBridge:      false,
            },
            callStatic:         false,
        },
        {
            args: {
                tokenFrom:   Tokens.ETH,
                tokenTo:     Tokens.WETH,
                chainIdFrom: ChainId.BOBA,
                chainIdTo:   ChainId.ETH,
                amountFrom:  executeFailAmt,
            },
            expected: {
                executeSuccess: false,
                canBridge:      false,
            },
            callStatic:         true,
        },
        {
            args: {
                tokenFrom:   Tokens.ETH,
                tokenTo:     Tokens.WETH_E,
                chainIdFrom: ChainId.ARBITRUM,
                chainIdTo:   ChainId.AVALANCHE,
                amountFrom:  parseEther("0.006"),
            },
            expected: {
                executeSuccess: true,
                canBridge:      true,
            },
            callStatic:         true,
        },
        {
            args: {
                tokenFrom:   Tokens.WETH_E,
                tokenTo:     Tokens.ETH,
                chainIdFrom: ChainId.AVALANCHE,
                chainIdTo:   ChainId.ARBITRUM,
                amountFrom:  parseEther("0.0051"),
            },
            expected: {
                executeSuccess: true,
                canBridge:      true,
            },
            callStatic:         true,
        },
        {
            args: {
                tokenFrom:   Tokens.ETH,
                tokenTo:     Tokens.NETH,
                chainIdFrom: ChainId.ETH,
                chainIdTo:   ChainId.OPTIMISM,
                amountFrom:  executeFailAmt,
            },
            expected: {
                executeSuccess: false,
                canBridge:      false,
            },
            callStatic:         true,
        },
        {
            args: {
                tokenFrom:   Tokens.ETH,
                tokenTo:     Tokens.NETH,
                chainIdFrom: ChainId.ETH,
                chainIdTo:   ChainId.OPTIMISM,
                amountFrom:  executeFailAmt,
            },
            expected: {
                executeSuccess: false,
                canBridge:      false,
            },
            callStatic:         false,
        },
        {
            args: {
                tokenFrom:   Tokens.NUSD,
                tokenTo:     Tokens.USDT,
                chainIdFrom: ChainId.POLYGON,
                chainIdTo:   ChainId.FANTOM,
                amountFrom:  parseEther("666"),
            },
            expected: {
                executeSuccess: false,
                canBridge:      false,
            },
            callStatic:         false,
        },
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

    testCases.forEach(tc => {
        const
            describeNetFromTitle: string = `${tc.args.tokenFrom.symbol} on ${Networks.networkName(tc.args.chainIdFrom)}`,
            desribeNetToTitle:    string = `${tc.args.tokenTo.symbol} on ${Networks.networkName(tc.args.chainIdTo)}`,
            execModeTitle:        string = tc.callStatic ? "(CallStatic)" : "(Signer Sends)",
            describeTitle:        string = `Test ${describeNetFromTitle} to ${desribeNetToTitle} ${execModeTitle}`,
            executionTestSuffix:  string = `should ${tc.expected.executeSuccess ? "execute succesfully" : "fail"}`;

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

                walletArgs = await buildWalletArgs(
                    tc.args.chainIdFrom,
                    bridgeInteractionsPrivkey.privkey
                );

                wallet         = walletArgs.wallet;
                bridgeInstance = walletArgs.bridgeInstance;
            })

            function executeTxnFunc(
                tc:       TestCase,
                prom:     Promise<TxnResponse>,
                approval: boolean=false
            ): (ctx: Mocha.Context) => PromiseLike<any> {
                return async function (ctx: Mocha.Context): Promise<void | any> {
                    if (approval && tc.args.tokenFrom.isEqual(Tokens.ETH)) return

                    ctx.timeout(20*1000);

                    let execProm = executeTransaction(prom);

                    return (await (tc.expected.executeSuccess
                            ? expectFulfilled(execProm)
                            : expectRejected(execProm)
                    ))
                }
            }

            function callStaticFunc(
                tc:       TestCase,
                prom:     Promise<StaticCallResult>,
                approval: boolean=false
            ): (ctx: Mocha.Context) => PromiseLike<any> {
                return async function (ctx: Mocha.Context): Promise<void | any> {
                    if (approval && tc.args.tokenFrom.isEqual(Tokens.ETH)) return

                    ctx.timeout(5*1000);

                    let execProm = callStatic(prom);

                    return (await (tc.expected.executeSuccess
                            ? expectFulfilled(execProm)
                            : expectRejected(execProm)
                    ))
                }
            }

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
            });

            describe("- checkCanBridge()", function(this: Mocha.Suite) {
                const canBridgeTestTitle: string = `should${tc.expected.canBridge ? "" : " not"} be able to bridge`;

                it(canBridgeTestTitle, function(this: Mocha.Context, done: Mocha.Done) {
                    this.timeout(3.5*1000);
                    this.slow(2*1000);

                    let prom = bridgeInstance.checkCanBridge({
                        token: tc.args.tokenFrom,
                        signer: wallet,
                        amount: tc.args.amountFrom,
                    }).then(([canBridge]) => canBridge)

                    expect(prom).to.eventually
                        .equal(tc.expected.canBridge)
                        .and.not.be.rejected
                        .notify(done);
                })
            });

            describe("- Transaction Builders", function(this: Mocha.Suite) {
                let
                    approvalTxn:     PopulatedTransaction,
                    bridgeTxn:       PopulatedTransaction;

                const
                    approveTitle: string = "approval transaction should be populated successfully",
                    bridgeTitle:  string = "bridge transaction should be populated successfully";

                step(approveTitle, async function(this: Mocha.Context) {
                    if (tc.args.tokenFrom.isEqual(Tokens.ETH)) return
                    this.timeout(DEFAULT_TEST_TIMEOUT);

                    return (await expectFulfilled(
                        bridgeInstance
                            .buildApproveTransaction({token: tc.args.tokenFrom})
                            .then((txn) => approvalTxn = txn)
                    ))
                });

                step(bridgeTitle, async function(this: Mocha.Context) {
                    this.timeout(DEFAULT_TEST_TIMEOUT);

                    return (await expectFulfilled(
                        bridgeInstance.buildBridgeTokenTransaction(doBridgeArgs)
                            .then((txn) => bridgeTxn = txn)
                    ))
                });

                const approval = true;

                step(approvalTxnTestTitle, async function(this: Mocha.Context) {
                    if (tc.callStatic) {
                        return await callStaticFunc(
                            tc,
                            staticCallPopulatedTransaction(approvalTxn, wallet),
                            approval
                        )(this)
                    } else {
                        return await executeTxnFunc(
                            tc,
                            wallet.sendTransaction(approvalTxn),
                            approval
                        )(this)
                    }
                });

                step(bridgeTxnTestTitle, async function(this: Mocha.Context) {
                    if (tc.callStatic) {
                        return await callStaticFunc(
                            tc,
                            staticCallPopulatedTransaction(bridgeTxn, wallet)
                        )(this)
                    } else {
                        return await executeTxnFunc(
                            tc,
                            wallet.sendTransaction(bridgeTxn)
                        )(this)
                    }
                });
            });

            (tc.callStatic ? describe.skip : describe)("- Magic Executors", function(this: Mocha.Suite) {
                const approval = true;

                step(approvalTxnTestTitle, async function(this: Mocha.Context) {
                    return await executeTxnFunc(
                        tc,
                        bridgeInstance.executeApproveTransaction({token: tc.args.tokenFrom}, wallet),
                        approval
                    )(this)
                });

                step(bridgeTxnTestTitle, async function (this: Mocha.Context) {
                    return await executeTxnFunc(
                        tc,
                        bridgeInstance.executeBridgeTokenTransaction(doBridgeArgs, wallet)
                    )(this)
                });
            })
        })
    })
})