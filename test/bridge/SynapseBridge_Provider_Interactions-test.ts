import "@tests/setup";

import {expect} from "chai";
import {step} from "mocha-steps";

import {Bridge, ChainId, Networks, Tokens,} from "@sdk";

import {rejectPromise, staticCallPopulatedTransaction} from "@sdk/common/utils";

import {
    bridgeTestPrivkey1,
    DEFAULT_TEST_TIMEOUT,
    EXECUTORS_TEST_TIMEOUT,
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

function resolveStatisCallResult(res: StaticCallResult): Promise<void> {
    return new Promise((resolve, reject) => {
        if (res === StaticCallResult.Success) {
            resolve()
            return
        }

        reject()
    })
}

function executeTransaction(
    prom: Promise<TxnResponse | StaticCallResult>
): Promise<void> {
    return Promise.resolve(prom)
        .then((response: TxnResponse | StaticCallResult): Promise<void> => {
            return typeof response === "number"
                ? resolveStatisCallResult(response as StaticCallResult)
                : (response as TransactionResponse).wait(1)
                    .then(() => {})
                    .catch(rejectPromise)
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

    type TestCase = BridgeSwapTestCase<TestOpts>;

    const executeFailAmt: BigNumber = parseEther("420.696969");

    const testCases: TestCase[] = [
        {
            args: {
                tokenFrom:   Tokens.ETH,
                tokenTo:     Tokens.WETH,
                chainIdFrom: ChainId.OPTIMISM,
                chainIdTo:   ChainId.ETH,
                amountFrom:  executeFailAmt,
                execute:     true,
            },
            expected: {
                executeSuccess: false,
                canBridge:      false,
            }
        },
        {
            args: {
                tokenFrom:   Tokens.ETH,
                tokenTo:     Tokens.WETH,
                chainIdFrom: ChainId.BOBA,
                chainIdTo:   ChainId.ETH,
                amountFrom:  executeFailAmt,
                execute:     true,
            },
            expected: {
                executeSuccess: false,
                canBridge:      false,
            }
        },
        {
            args: {
                tokenFrom:   Tokens.ETH,
                tokenTo:     Tokens.WETH_E,
                chainIdFrom: ChainId.ARBITRUM,
                chainIdTo:   ChainId.AVALANCHE,
                amountFrom:  parseEther("0.006"),
                execute:     false,
            },
            expected: {
                executeSuccess: true,
                canBridge:      true,
            }
        },
        {
            args: {
                tokenFrom:   Tokens.WETH_E,
                tokenTo:     Tokens.ETH,
                chainIdFrom: ChainId.AVALANCHE,
                chainIdTo:   ChainId.ARBITRUM,
                amountFrom:  parseEther("0.0051"),
                execute:     false,
            },
            expected: {
                executeSuccess: true,
                canBridge:      true,
            }
        },
        {
            args: {
                tokenFrom:   Tokens.ETH,
                tokenTo:     Tokens.NETH,
                chainIdFrom: ChainId.ETH,
                chainIdTo:   ChainId.OPTIMISM,
                amountFrom:  executeFailAmt,
                execute:     true,
            },
            expected: {
                executeSuccess: false,
                canBridge:      false,
            }
        },
        {
            args: {
                tokenFrom:   Tokens.NUSD,
                tokenTo:     Tokens.USDT,
                chainIdFrom: ChainId.POLYGON,
                chainIdTo:   ChainId.FANTOM,
                amountFrom:  parseEther("666"),
                execute:     true,
            },
            expected: {
                executeSuccess: false,
                canBridge:      false,
            }
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

    for (const tc of testCases) {
        const
            describeTitle:       string = `Test ${tc.args.tokenFrom.symbol} on ${Networks.networkName(tc.args.chainIdFrom)} to ${tc.args.tokenTo.symbol} on ${Networks.networkName(tc.args.chainIdTo)}`,
            executionTestSuffix: string = `should ${tc.expected.executeSuccess ? "execute succesfully" : "fail"}`;

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

            const executeTxnFunc = (
                tc:       TestCase,
                prom:     Promise<TxnResponse | StaticCallResult>,
                approval: boolean=false
            ): (ctx: Mocha.Context) => PromiseLike<any> =>
                async function (ctx: Mocha.Context): Promise<void|any> {
                    if (approval && tc.args.tokenFrom.isEqual(Tokens.ETH)) return

                    ctx.timeout(EXECUTORS_TEST_TIMEOUT);

                    let execProm = executeTransaction(prom);

                    return (await (tc.expected.executeSuccess
                            ? expectFulfilled(execProm)
                            : expectRejected(execProm)
                    ))
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
            })

            describe("Test checkCanBridge()", function(this: Mocha.Suite) {
                const canBridgeTestTitle: string = `should${tc.expected.canBridge ? "" : " not"} be able to bridge`;

                it(canBridgeTestTitle, async function(this: Mocha.Context) {
                    let prom = bridgeInstance.checkCanBridge({
                        token: tc.args.tokenFrom,
                        signer: wallet,
                        amount: tc.args.amountFrom,
                    }).then(([canBridge]) => canBridge)

                    expect(prom).to.eventually.not.be.rejected;
                    return expect(await prom).to.eq(tc.expected.canBridge);
                })
            })

            describe("test using transaction builders", function(this: Mocha.Suite) {
                let
                    approvalTxn:     PopulatedTransaction,
                    bridgeTxn:       PopulatedTransaction;

                step(
                    "approval transaction should be populated successfully",
                    async function(this: Mocha.Context) {
                        if (tc.args.tokenFrom.isEqual(Tokens.ETH)) return
                        this.timeout(DEFAULT_TEST_TIMEOUT);

                        return (await expectFulfilled(
                            bridgeInstance
                                .buildApproveTransaction({token: tc.args.tokenFrom})
                                .then((txn) => approvalTxn = txn)
                        ))
                    })

                step(
                    "bridge transaction should be populated successfully",
                    async function(this: Mocha.Context) {
                        this.timeout(DEFAULT_TEST_TIMEOUT);

                        return (await expectFulfilled(
                            bridgeInstance.buildBridgeTokenTransaction(doBridgeArgs)
                                .then((txn) => bridgeTxn = txn)
                        ))
                    })

                if (tc.args.execute) {
                    step(
                        approvalTxnTestTitle,
                        async function(this: Mocha.Context) {
                            let prom: Promise<any> = tc.args.execute
                                ? wallet.sendTransaction(approvalTxn)
                                : staticCallPopulatedTransaction(approvalTxn, wallet)

                            return await executeTxnFunc(
                                tc,
                                prom,
                                true
                            )(this)
                        }
                    );

                    step(
                        bridgeTxnTestTitle,
                        async function(this: Mocha.Context) {
                            let prom: Promise<any> = tc.args.execute
                                ? wallet.sendTransaction(bridgeTxn)
                                : staticCallPopulatedTransaction(bridgeTxn, wallet)

                            return await executeTxnFunc(
                                tc,
                                prom
                            )(this)
                        });
                }
            })

            describe("Test Magic Executors", function(this: Mocha.Suite) {
                const doStaticCall: boolean = !tc.args.execute;

                step(
                    approvalTxnTestTitle,
                    async function(this: Mocha.Context) {
                        return await executeTxnFunc(
                            tc,
                            bridgeInstance.executeApproveTransaction(
                                {token: tc.args.tokenFrom},
                                wallet,
                                doStaticCall
                            ),
                            true
                        )(this)
                    }
                );

                step(
                    bridgeTxnTestTitle,
                    async function (this: Mocha.Context) {
                        return await executeTxnFunc(
                            tc,
                            bridgeInstance.executeBridgeTokenTransaction(
                                doBridgeArgs,
                                wallet,
                                doStaticCall
                            )
                        )(this)
                    }
                );
            })
        })
    }
})