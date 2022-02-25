import "../helpers/chaisetup";

import {expect} from "chai";
import {step} from "mocha-steps";

import {
    Bridge,
    ChainId,
    Tokens,
    Networks,
} from "@sdk";

import {contractAddressFor, rejectPromise} from "@common/utils";

import {ERC20} from "@bridge/erc20";

import {
    DEFAULT_TEST_TIMEOUT,
    EXECUTORS_TEST_TIMEOUT,
    bridgeTestPrivkey1,
    expectNotZero,
    expectRejected,
    expectFulfilled,
    makeWalletSignerWithProvider,
} from "../helpers";

import {bridgeInteractionsPrivkey} from "./bridge_test_utils";
import type {BridgeSwapTestCase} from "./bridge_test_utils";

import type {TransactionResponse} from "@ethersproject/providers";

import type {
    ContractTransaction,
    PopulatedTransaction,
} from "@ethersproject/contracts";

import {Wallet}     from "@ethersproject/wallet";
import {parseEther} from "@ethersproject/units";

function executeTransaction(
    prom: Promise<TransactionResponse|ContractTransaction>
): Promise<void> {
    return Promise.resolve(prom)
        .then((txn): Promise<void> =>
            txn.wait(1)
                .then(() => {})
                .catch(rejectPromise)
        )
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

    const testCases: TestCase[] = [
        {
            args: {
                tokenFrom:   Tokens.ONE_ETH,
                tokenTo:     Tokens.WETH_E,
                chainIdFrom: ChainId.HARMONY,
                chainIdTo:   ChainId.AVALANCHE,
                amountFrom:  parseEther("420.696969"),
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
                amountFrom:  parseEther("420.696969"),
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
                tokenTo:     Tokens.MIM,
                chainIdFrom: ChainId.HARMONY,
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
                prom:     Promise<ContractTransaction|TransactionResponse>,
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

            let approvalNeeded: boolean;

            step("check if approval is needed", async function(this: Mocha.Context) {
                if (tc.args.tokenFrom.isEqual(Tokens.ETH)) {
                    approvalNeeded = false;
                    return
                }

                const spender: string = contractAddressFor(tc.args.chainIdFrom, "bridge_zap");

                const tokenParams: ERC20.ERC20TokenParams = {
                    tokenAddress: tc.args.tokenFrom.address(tc.args.chainIdFrom),
                    chainId:      tc.args.chainIdFrom,
                };

                let allowanceProm = ERC20.allowanceOf(
                    bridgeInteractionsPrivkey.address,
                    spender,
                    tokenParams
                );

                try {
                    const allowance = await allowanceProm;
                    approvalNeeded = allowance.lt(tc.args.amountFrom);

                    return (await expectFulfilled(allowanceProm));
                } catch (e) {
                    return (await expectFulfilled(allowanceProm));
                }
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
                    // console.log(`approvalTxn: maxFeePerGas: ${approvalTxn.maxFeePerGas}, maxPriorityFee: ${approvalTxn.maxPriorityFeePerGas}`);
                    // console.log(`bridgeTxn: maxFeePerGas: ${bridgeTxn.maxFeePerGas}, maxPriorityFee: ${bridgeTxn.maxPriorityFeePerGas}`);
                    if (approvalNeeded) {
                        step(
                            approvalTxnTestTitle,
                            async function(this: Mocha.Context) {
                                return await executeTxnFunc(
                                    tc,
                                    wallet.sendTransaction(approvalTxn),
                                    true
                                )(this)
                            }
                        );
                    }

                    step(
                        bridgeTxnTestTitle,
                        async function(this: Mocha.Context) {
                            return await executeTxnFunc(
                                tc,
                                wallet.sendTransaction(bridgeTxn)
                            )(this)
                        });
                }
            })

            if (tc.args.execute) {
                describe("Test Magic Executors", function(this: Mocha.Suite) {
                    if (approvalNeeded) {
                        step(
                            approvalTxnTestTitle,
                            async function(this: Mocha.Context) {
                                return await executeTxnFunc(
                                    tc,
                                    bridgeInstance.executeApproveTransaction({token: tc.args.tokenFrom}, wallet),
                                    true
                                )(this)
                            }
                        );
                    }

                    step(
                        bridgeTxnTestTitle,
                        async function (this: Mocha.Context) {
                            return await executeTxnFunc(
                                tc,
                                bridgeInstance.executeBridgeTokenTransaction(doBridgeArgs, wallet)
                            )(this)
                        }
                    );
                })
            }
        })
    }
})