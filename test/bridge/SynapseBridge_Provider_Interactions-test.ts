import "../helpers/chaisetup";

import {expect} from "chai";
import {step} from "mocha-steps";

import {
    Bridge,
    ChainId,
    Tokens,
} from "../../src";

import {
    DEFAULT_TEST_TIMEOUT,
    EXECUTORS_TEST_TIMEOUT,
    bridgeTestPrivkey,
    doneWithError,
    expectFulfilled,
    makeWalletSignerWithProvider,
} from "../helpers";

import type {TransactionResponse} from "@ethersproject/providers";

import type {
    ContractTransaction,
    PopulatedTransaction,
} from "@ethersproject/contracts";

import {parseEther} from "@ethersproject/units";
import {Zero}       from "@ethersproject/constants";


function executeTransaction(
    prom: Promise<TransactionResponse|ContractTransaction>,
    done: Mocha.Done
) {
    Promise.resolve(prom)
        .then((txn: TransactionResponse|ContractTransaction) => {
            txn.wait(1).then(() => done())
        })
        .catch((err: any) => doneWithError(err, done))
}

describe("SynapseBridge - Provider Interactions tests", function(this: Mocha.Suite) {
    const
        tokenFrom      = Tokens.ETH,
        tokenTo        = Tokens.WETH_E,
        chainIdFrom    = ChainId.ARBITRUM,
        chainIdTo      = ChainId.AVALANCHE,
        amountFrom     = parseEther("420.696969"),
        bridgeArgs     = {tokenFrom, tokenTo, chainIdFrom, chainIdTo, amountFrom},
        wallet         = makeWalletSignerWithProvider(chainIdFrom, bridgeTestPrivkey),
        addressTo      = wallet.address,
        bridgeInstance = new Bridge.SynapseBridge({ network: chainIdFrom });

    let
        outputEstimate: Bridge.BridgeOutputEstimate,
        doBridgeArgs: Bridge.BridgeTransactionParams;

    async function getBridgeEstimate(this: Mocha.Context, done: Mocha.Done) {
        this.timeout(DEFAULT_TEST_TIMEOUT);

        bridgeInstance.estimateBridgeTokenOutput(bridgeArgs)
            .then((res) => {
                if (res.amountToReceive.gt(Zero)) {
                    expect(res.amountToReceive.gt(Zero)).true;
                    outputEstimate = res;
                    doBridgeArgs = {
                        ...bridgeArgs,
                        amountFrom,
                        amountTo:  outputEstimate.amountToReceive,
                        addressTo,
                    }
                    done();
                } else {
                    doneWithError(`wanted gt zero, got zero`, done);
                }
            })
            .catch((e) => doneWithError(e, done))
    }

    describe("test using transaction builders", function(this: Mocha.Suite) {
        this.timeout(DEFAULT_TEST_TIMEOUT)
        let
            approvalTxn:     PopulatedTransaction,
            bridgeTxn:       PopulatedTransaction;

        step("should return an output estimate greater than zero", getBridgeEstimate);

        step("approval transaction should be populated successfully", async function(this: Mocha.Context) {
            if (tokenFrom.isEqual(Tokens.ETH)) return

            this.timeout(DEFAULT_TEST_TIMEOUT);

            return (await expectFulfilled(
                bridgeInstance.buildApproveTransaction({token: tokenFrom}).then((txn) => approvalTxn = txn)
            ))
        })

        step("bridge transaction should be populated successfully", async function(this: Mocha.Context) {
            this.timeout(DEFAULT_TEST_TIMEOUT);

            return (await expectFulfilled(
                bridgeInstance.buildBridgeTokenTransaction(doBridgeArgs).then((txn) => bridgeTxn = txn)
            ))
        })

        describe.skip("send transactions", function(this: Mocha.Suite) {
            step("approval transaction should be sent successfully", function(this: Mocha.Context, done: Mocha.Done) {
                if (tokenFrom.isEqual(Tokens.ETH)) {
                    done();
                    return
                }

                this.timeout(EXECUTORS_TEST_TIMEOUT);

                executeTransaction(
                    wallet.sendTransaction(approvalTxn),
                    done
                );
            })

            step("token bridge transaction should be sent successfully", function(this: Mocha.Context, done: Mocha.Done) {
                if (tokenFrom.isEqual(Tokens.ETH)) {
                    done();
                    return
                }

                this.timeout(EXECUTORS_TEST_TIMEOUT);

                executeTransaction(
                    wallet.sendTransaction(bridgeTxn),
                    done
                );
            })
        })
    })

    describe("magic executors", function(this: Mocha.Suite) {
        step("should return an output estimate greater than zero", getBridgeEstimate);

        describe.skip("send transactions", function(this: Mocha.Suite) {
            step("erc20 approval transaction should execute successfully", function(this: Mocha.Context, done: Mocha.Done) {
                this.timeout(EXECUTORS_TEST_TIMEOUT);

                executeTransaction(
                    bridgeInstance.executeApproveTransaction({token: tokenFrom}, wallet),
                    done
                );
            })

            step("token bridge transaction should execute successfully", function(this: Mocha.Context, done: Mocha.Done) {
                this.timeout(EXECUTORS_TEST_TIMEOUT);

                executeTransaction(
                    bridgeInstance.executeBridgeTokenTransaction(doBridgeArgs, wallet),
                    done
                );
            })
        })

        // describe.skip("SynapseBridge bridge transaction", function(this: Mocha.Suite) {
        //     this.timeout(EXECUTORS_TEST_TIMEOUT);
        //
        //
        // })
    })
})