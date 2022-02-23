import "../helpers/chaisetup";

import {step} from "mocha-steps";

import type {Token} from "@token";

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

interface TestCase {
    tokenFrom:       Token,
    tokenTo:         Token,
    chainIdFrom:     number,
    chainIdTo:       number,
    amountFrom:      BigNumber,
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
            executeSucceeds: false,
        },
        {
            tokenFrom:       Tokens.ETH,
            tokenTo:         Tokens.NETH,
            chainIdFrom:     ChainId.ETH,
            chainIdTo:       ChainId.OPTIMISM,
            amountFrom:      parseEther("420.696969"),
            executeSucceeds: false,
        },
        {
            tokenFrom:       Tokens.BUSD,
            tokenTo:         Tokens.MIM,
            chainIdFrom:     ChainId.BSC,
            chainIdTo:       ChainId.FANTOM,
            amountFrom:      parseEther("666"),
            executeSucceeds: false,
        }
    ];

    async function getBridgeEstimate(
        tc: TestCase,
        {
            address,
            bridgeInstance,
        }: WalletArgs
    ): Promise<EstimateOutputs> {
        return bridgeInstance.estimateBridgeTokenOutput(tc)
            .then(res =>
                ({
                    outputEstimate: res,
                    bridgeArgs: {
                        ...tc,
                        amountTo: res.amountToReceive,
                        addressTo: address,
                    }
                })
            )
    }

    for (const tc of testCases) {
        const
            describeTitle:       string = `Test ${tc.tokenFrom.symbol} on ${Networks.networkName(tc.chainIdFrom)} to ${tc.tokenTo.symbol} on ${Networks.networkName(tc.chainIdTo)}`,
            executionTestSuffix: string = `should ${tc.executeSucceeds ? "execute succesfully" : "fail"}`;

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

                walletArgs     = await buildWalletArgs(tc.chainIdFrom);

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
                    if (tc.tokenFrom.isEqual(Tokens.ETH)) return
                    this.timeout(DEFAULT_TEST_TIMEOUT);

                    return (await expectFulfilled(
                        bridgeInstance
                            .buildApproveTransaction({token: tc.tokenFrom})
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
                    if (tc.tokenFrom.isEqual(Tokens.ETH)) return

                    this.timeout(EXECUTORS_TEST_TIMEOUT);

                    let execProm = executeTransaction(wallet.sendTransaction(approvalTxn));

                    return (await (tc.executeSucceeds
                            ? expectFulfilled(execProm)
                            : expectRejected(execProm)
                    ))
                })

                step(bridgeTxnTestTitle, async function(this: Mocha.Context) {
                    this.timeout(EXECUTORS_TEST_TIMEOUT);

                    let execProm = executeTransaction(wallet.sendTransaction(bridgeTxn));

                    return (await (tc.executeSucceeds
                            ? expectFulfilled(execProm)
                            : expectRejected(execProm)
                    ))
                })
            })

            describe("Test Magic Executors", function(this: Mocha.Suite) {
                step(approvalTxnTestTitle, async function(this: Mocha.Context) {
                    if (tc.tokenFrom.isEqual(Tokens.ETH)) return

                    this.timeout(EXECUTORS_TEST_TIMEOUT);

                    let execProm = executeTransaction(bridgeInstance.executeApproveTransaction({token: tc.tokenFrom}, wallet));

                    return (await (tc.executeSucceeds
                            ? expectFulfilled(execProm)
                            : expectRejected(execProm)
                    ))
                })

                step(bridgeTxnTestTitle, async function(this: Mocha.Context) {
                    this.timeout(EXECUTORS_TEST_TIMEOUT);

                    let execProm = executeTransaction(bridgeInstance.executeBridgeTokenTransaction(doBridgeArgs, wallet));

                    return (await (tc.executeSucceeds
                            ? expectFulfilled(execProm)
                            : expectRejected(execProm)
                    ))
                })
            })
        })
    }
})