import {expect} from "chai";
import {step} from "mocha-steps";

import {Bridge, ChainId, Networks, Tokens} from "@sdk";
import {ERC20Factory}     from "@sdk/contracts";
import {StaticCallResult} from "@sdk/common/types";
import {terraRpcProvider} from "@sdk/internal/rpcproviders";

import {rejectPromise, staticCallPopulatedTransaction} from "@sdk/common/utils";


import {
    DEFAULT_TEST_TIMEOUT,
    expectFulfilled,
    expectNotZero,
    expectRejected,
    makeWalletSignerWithProvider,
} from "@tests/helpers";

import {bridgeInteractionsPrivkey, type BridgeSwapTestCase} from "./bridge_test_utils";

import type {TransactionResponse} from "@ethersproject/providers";
import type {
    ContractTransaction,
    PopulatedTransaction
} from "@ethersproject/contracts";

import {Wallet as EvmWallet} from "@ethersproject/wallet";

import {BytesLike}  from "@ethersproject/bytes";
import {parseEther} from "@ethersproject/units";
import {BigNumber} from "@ethersproject/bignumber";

import {
    SyncTxBroadcastResult,
    TxError,
    isTxError,
    Wallet as TerraWallet,
    MnemonicKey,
    MsgExecuteContract, RawKey
} from "@terra-money/terra.js";

type TxnResponse = ContractTransaction | TransactionResponse;

function executeTransaction(prom: Promise<TxnResponse>): Promise<void> {
    return prom
        .then((response: TxnResponse): Promise<void> =>
            response.wait(1)
                .then(() => {})
        )
}

function executeTransactionTerra(prom: Promise<SyncTxBroadcastResult>): Promise<void> {
    return prom
        .then((response: SyncTxBroadcastResult): Promise<void> => {
            if (isTxError(response)) {
                return rejectPromise((response as TxError).code)
            }
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
        // .catch(rejectPromise)
}

interface EstimateOutputs {
    outputEstimate: Bridge.BridgeOutputEstimate,
    bridgeArgs:     Bridge.BridgeTransactionParams,
}

interface WalletArgs {
    wallet:         EvmWallet | TerraWallet;
    address:        string;
    evmAddress:     string;
    terraAddress:   string;
    bridgeInstance: Bridge.SynapseBridge;
}

async function buildWalletArgs(chainId: number, privkey: string=bridgeInteractionsPrivkey.privkey): Promise<WalletArgs> {
    const
        _terra = chainId === ChainId.TERRA,
        _evmChainId = _terra ? ChainId.ETH : chainId,
        evmWallet:   EvmWallet   = makeWalletSignerWithProvider(_evmChainId, privkey),
        terraWallet: TerraWallet = terraRpcProvider(ChainId.TERRA).wallet(new RawKey(
            Buffer.from(
                process.env["BRIDGE_INTERACTIONS_PRIVKEY_TERRA"] || "",
                "hex"
            )
        ));

    const
        wallet       = _terra ? terraWallet : evmWallet,
        evmAddress   = (await evmWallet.getAddress()),
        terraAddress = terraWallet.key.accAddress,
        address      = _terra ? terraAddress : evmAddress;

    return {
        wallet,
        address,
        evmAddress,
        terraAddress,
        bridgeInstance: new Bridge.SynapseBridge({ network: Networks.fromChainId(chainId) })
    }
}

describe("SynapseBridge - Provider Interactions tests", function(this: Mocha.Suite) {

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
                amountFrom:  parseEther("0.005"),
            },
            expected: {
                executeSuccess: true,
                canBridge:      true,
            },
            callStatic:         true,
        },
        // {
        //     args: {
        //         tokenFrom:   Tokens.WETH_E,
        //         tokenTo:     Tokens.ETH,
        //         chainIdFrom: ChainId.AVALANCHE,
        //         chainIdTo:   ChainId.ARBITRUM,
        //         amountFrom:  parseEther("0.05"),
        //     },
        //     expected: {
        //         executeSuccess: false,
        //         canBridge:      false,
        //     },
        //     callStatic:         true,
        // },
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
        {
            args: {
                tokenFrom:   Tokens.UST,
                tokenTo:     Tokens.UST,
                chainIdFrom: ChainId.POLYGON,
                chainIdTo:   ChainId.FANTOM,
                amountFrom:  Tokens.UST.valueToWei("666", ChainId.POLYGON),
            },
            expected: {
                executeSuccess: false,
                canBridge:      false,
            },
            callStatic:         true,
        },
        {
            args: {
                tokenFrom:   Tokens.UST,
                tokenTo:     Tokens.UST,
                chainIdFrom: ChainId.POLYGON,
                chainIdTo:   ChainId.TERRA,
                amountFrom:  Tokens.UST.valueToWei("666", ChainId.POLYGON),
            },
            expected: {
                executeSuccess: false,
                canBridge:      false,
            },
            callStatic:         true,
        },
        {
            args: {
                tokenFrom:   Tokens.UST,
                tokenTo:     Tokens.UST,
                chainIdFrom: ChainId.TERRA,
                chainIdTo:   ChainId.FANTOM,
                amountFrom:  Tokens.UST.valueToWei("666", ChainId.TERRA),
            },
            expected: {
                executeSuccess: false,
                canBridge:      false,
            },
            callStatic:         true,
        },
        {
            args: {
                tokenFrom:   Tokens.UST,
                tokenTo:     Tokens.UST,
                chainIdFrom: ChainId.TERRA,
                chainIdTo:   ChainId.FANTOM,
                amountFrom:  Tokens.UST.valueToWei("2", ChainId.TERRA),
            },
            expected: {
                executeSuccess: false,
                canBridge:      true,
            },
            callStatic:         true,
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
                wallet:         EvmWallet | TerraWallet,
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
                prom:     Promise<TxnResponse | SyncTxBroadcastResult>,
                approval: boolean=false
            ): (ctx: Mocha.Context) => PromiseLike<any> {
                return async function (ctx: Mocha.Context): Promise<void | any> {
                    if (approval && tc.args.tokenFrom.isEqual(Tokens.ETH)) return

                    ctx.timeout(20*1000);

                    if (tc.args.chainIdFrom === ChainId.TERRA) {
                        let execProm = executeTransactionTerra(prom as Promise<SyncTxBroadcastResult>);

                        return (await (tc.expected.executeSuccess
                                ? expectFulfilled(execProm)
                                : expectRejected(execProm)
                        ))
                    }

                    let execProm = executeTransaction(prom as Promise<TxnResponse>);

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
                    if (approval) {
                        return (await expect(execProm).to.eventually.be.fulfilled)
                    }

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

                if (tc.args.chainIdTo === ChainId.TERRA) {
                    doBridgeArgs.addressTo = walletArgs.terraAddress;
                }

                return
            });

            describe("- checkCanBridge()", function(this: Mocha.Suite) {
                const canBridgeTestTitle: string = `should${tc.expected.canBridge ? "" : " not"} be able to bridge`;

                it(canBridgeTestTitle, function(this: Mocha.Context, done: Mocha.Done) {
                    this.timeout(3.5*1000);
                    this.slow(2*1000);

                    let prom = bridgeInstance.checkCanBridge({
                        token: tc.args.tokenFrom,
                        address: walletArgs.address,
                        amount: tc.args.amountFrom,
                    }).then(({canBridge}) => canBridge)

                    expect(prom).to.eventually.equal(tc.expected.canBridge).notify(done);
                })
            });

            describe("- Transaction Builders", function(this: Mocha.Suite) {
                let
                    approvalTxn:     PopulatedTransaction,
                    bridgeTxn:       PopulatedTransaction | MsgExecuteContract;

                const
                    approveTitle: string = "approval transaction should be populated successfully",
                    bridgeTitle:  string = "bridge transaction should be populated successfully";

                function approveTxSuccessFn(result: BytesLike): boolean {
                    const contractInterface = ERC20Factory.createInterface();
                    try {
                        let decoded = contractInterface.decodeFunctionResult("approve", result);
                        return decoded[0] as boolean
                    } catch (e) {
                        return false
                    }
                }

                step(approveTitle, async function(this: Mocha.Context) {
                    if (tc.args.tokenFrom.isEqual(Tokens.ETH)) return
                    if (tc.args.chainIdFrom === ChainId.TERRA) return

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
                        bridgeInstance
                            .buildBridgeTokenTransaction(doBridgeArgs)
                            .then((txn) => bridgeTxn = txn)
                    ))
                });

                const approval = true;

                step(approvalTxnTestTitle, async function(this: Mocha.Context) {
                    if (tc.args.chainIdFrom === ChainId.TERRA) {
                        return
                    }

                    if (tc.callStatic) {
                        return await callStaticFunc(
                            tc,
                            staticCallPopulatedTransaction(
                                approvalTxn,
                                wallet as EvmWallet,
                                approveTxSuccessFn
                            ),
                            approval
                        )(this)
                    } else {
                        return await executeTxnFunc(
                            tc,
                            (wallet as EvmWallet).sendTransaction(approvalTxn),
                            approval
                        )(this)
                    }
                });

                step(bridgeTxnTestTitle, async function(this: Mocha.Context) {
                    if (tc.callStatic) {
                        if (tc.args.chainIdFrom === ChainId.TERRA) {
                            return
                        }

                        return await callStaticFunc(
                            tc,
                            staticCallPopulatedTransaction(
                                bridgeTxn as PopulatedTransaction,
                                wallet    as EvmWallet
                            )
                        )(this)
                    } else {
                        const promFn = tc.args.chainIdFrom === ChainId.TERRA
                            ? (wallet as TerraWallet)
                                .createTx({msgs: [bridgeTxn as MsgExecuteContract]})
                                .then(tx => (wallet as TerraWallet).lcd.tx.broadcastSync(tx))
                            : (wallet as EvmWallet)
                                .sendTransaction(bridgeTxn as PopulatedTransaction)
                                .then(res => res)

                        return await executeTxnFunc(
                            tc,
                            promFn
                        )(this)
                    }
                });
            });

            (tc.callStatic ? describe.skip : describe)("- Magic Executors", function(this: Mocha.Suite) {
                const approval = true;

                step(approvalTxnTestTitle, async function(this: Mocha.Context) {
                    if (tc.args.chainIdFrom === ChainId.TERRA) {
                        return
                    }

                    return await executeTxnFunc(
                        tc,
                        bridgeInstance.executeApproveTransaction({token: tc.args.tokenFrom}, wallet as EvmWallet),
                        approval
                    )(this)
                });

                step(bridgeTxnTestTitle, async function (this: Mocha.Context) {
                    let prom: Promise<TxnResponse> = bridgeInstance
                        .executeBridgeTokenTransaction(doBridgeArgs, wallet)
                        .then(res => res as ContractTransaction)

                    return await executeTxnFunc(
                        tc,
                        prom
                    )(this)
                });
            })
        })
    })
})