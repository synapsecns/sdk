import {StaticCallResult} from "@common/types";

import {GasOptions} from "@common/gasoptions";

import {BigNumber} from "@ethersproject/bignumber";

import type {ContractTransaction, PopulatedTransaction,} from "@ethersproject/contracts";

import type {TransactionResponse} from "@ethersproject/providers";
import {parseEther, parseUnits} from "@ethersproject/units";

import {Wallet} from "@ethersproject/wallet";

import type {
    Token,
    BridgeOutputEstimate,
    BridgeTransactionParams
} from "@sdk";

import {
    SynapseBridge,
    ChainId,
    Networks,
    Tokens
} from "@sdk";

import {rejectPromise, staticCallPopulatedTransaction} from "@sdk/common/utils";

import {
    bridgeTestPrivkey1,
    expectFulfilled,
    expectNothingFromPromise,
    expectNotZero,
    makeWalletSignerWithProvider,
} from "@tests/helpers";
import {expect} from "chai";
import {step} from "mocha-steps";

import {bridgeInteractionsPrivkey, type BridgeSwapTestCase} from "./bridge_test_utils";

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
    outputEstimate: BridgeOutputEstimate;
    bridgeArgs:     BridgeTransactionParams;
}

interface WalletArgs {
    wallet:         Wallet;
    address:        string;
    bridgeInstance: SynapseBridge;
}

function buildWalletArgs(chainId: number, privkey: string=bridgeTestPrivkey1): WalletArgs {
    const wallet = makeWalletSignerWithProvider(chainId, privkey);

    return {
        wallet,
        address:       wallet.address,
        bridgeInstance: new SynapseBridge({ network: Networks.fromChainId(chainId) })
    }
}

describe("SynapseBridge - Provider Interactions tests", function(this: Mocha.Suite) {

    type TxExecResult = TxnResponse | StaticCallResult

    interface TestOpts {
        executeSuccess: boolean;
        canBridge:      boolean;
    }

    interface TestCase extends BridgeSwapTestCase<TestOpts> {
        callStatic:  boolean;
        gasOptions?: GasOptions;
    }

    function makeTestCase(
        tokenFrom:   Token,  tokenTo:   Token,
        chainIdFrom: number, chainIdTo: number,
        amountFrom:  BigNumber,
        opts: TestOpts & {callStatic: boolean, gasOptions?: GasOptions}
    ): TestCase {
        return {
            args:     {tokenFrom, tokenTo, chainIdFrom, chainIdTo, amountFrom},
            expected: {...opts},
            callStatic: opts.callStatic,
            gasOptions: opts.gasOptions
        }
    }

    const testAmts: {[k: string]: BigNumber} = {
        executeFail:  parseEther("420.696969"),
        small:        parseEther("0.005"),
        ironMaiden:   parseEther("666"),
    } as const;

    const makeGwei = (n: string): BigNumber => parseUnits(n, "gwei")

    const AVALANCHE_GAS_OPTIONS: GasOptions = {
        maxPriorityFeePerGas: makeGwei("3.5")
    };

    const HARMONY_GAS_OPTIONS: GasOptions = {
        gasPrice: makeGwei("65")
    };

    type MakeOpts = TestOpts & {callStatic: boolean}

    function setTimeout(ctx: Mocha.Context, chainId: number) {
        let timeout: number;
        ctx.slow(3.5*1000);

        switch (chainId) {
            case ChainId.AURORA:
            case ChainId.CRONOS:
                timeout = 12000;
                break;
            default:
                timeout = 8000;
                break;
        }

        ctx.timeout(timeout);
    }

    const
        failAllOpts            = (callStatic: boolean): MakeOpts => ({executeSuccess: false,  canBridge: false, callStatic}),
        passAllOpts            = (callStatic: boolean): MakeOpts => ({executeSuccess: true,   canBridge: true,  callStatic}),
        canBridgeExecFailOpts  = (callStatic: boolean): MakeOpts => ({executeSuccess: false,  canBridge: true,  callStatic}),
        bridgeFailExecPassOpts = (callStatic: boolean): MakeOpts => ({executeSuccess: true,   canBridge: false, callStatic});

    let testCases: TestCase[] = [
        makeTestCase(Tokens.ETH,    Tokens.WETH_E, ChainId.ARBITRUM,  ChainId.AVALANCHE, testAmts.small,       failAllOpts(false)),
        makeTestCase(Tokens.ETH,    Tokens.WETH,   ChainId.OPTIMISM,  ChainId.ETH,       testAmts.executeFail, failAllOpts(true)),
        makeTestCase(Tokens.ETH,    Tokens.WETH,   ChainId.BOBA,      ChainId.ETH,       testAmts.executeFail, failAllOpts(true)),
        makeTestCase(Tokens.ETH,    Tokens.NETH,   ChainId.ETH,       ChainId.OPTIMISM,  testAmts.executeFail, failAllOpts(true)),
    ];

    const dfkTestCases: TestCase[] = [
        makeTestCase(Tokens.AVAX,        Tokens.SYN_AVAX,    ChainId.AVALANCHE,   ChainId.HARMONY,    parseEther("0.6"),   {...failAllOpts(false), gasOptions: AVALANCHE_GAS_OPTIONS}),
        makeTestCase(Tokens.AVAX,        Tokens.WAVAX,       ChainId.AVALANCHE,   ChainId.DFK,        parseEther("0.6"),   failAllOpts(false)),
        makeTestCase(Tokens.XJEWEL,      Tokens.XJEWEL,      ChainId.HARMONY,     ChainId.DFK,        parseEther("1.5"),   {...bridgeFailExecPassOpts(true), gasOptions: HARMONY_GAS_OPTIONS}),
        makeTestCase(Tokens.GAS_JEWEL,   Tokens.JEWEL,       ChainId.DFK,         ChainId.HARMONY,    parseEther("1.5"),   passAllOpts(true)),
        makeTestCase(Tokens.GAS_JEWEL,   Tokens.JEWEL,       ChainId.DFK,         ChainId.AVALANCHE,  parseEther("1.5"),   passAllOpts(true)),
        makeTestCase(Tokens.GAS_JEWEL,   Tokens.SYN_JEWEL,   ChainId.DFK,         ChainId.HARMONY,    parseEther("1.5"),   passAllOpts(true)),
        makeTestCase(Tokens.JEWEL,       Tokens.SYN_JEWEL,   ChainId.AVALANCHE,   ChainId.HARMONY,    parseEther("1.5"),   failAllOpts(true)),
        makeTestCase(Tokens.JEWEL,       Tokens.JEWEL,       ChainId.AVALANCHE,   ChainId.HARMONY,    parseEther("1.5"),   failAllOpts(true)),
        makeTestCase(Tokens.MULTIJEWEL,  Tokens.JEWEL,       ChainId.AVALANCHE,   ChainId.DFK,        parseEther("0.75"),  failAllOpts(true)),
        makeTestCase(Tokens.MULTIJEWEL,  Tokens.JEWEL,       ChainId.AVALANCHE,   ChainId.DFK,        parseEther("3"),     failAllOpts(true)),
        makeTestCase(Tokens.DFK_USDC,    Tokens.USDT,        ChainId.DFK,         ChainId.AVALANCHE,  parseEther("8"),     passAllOpts(true)),
        makeTestCase(Tokens.DFK_USDC,    Tokens.DAI,         ChainId.DFK,         ChainId.AVALANCHE,  parseEther("9"),     passAllOpts(true)),
    ];

    testCases.push(...dfkTestCases);

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

    function executeTxn(
        tc:         TestCase,
        prom:       Promise<TxExecResult>,
        staticCall: boolean,
        approval:   boolean = false,
    ): (ctx: Mocha.Context) => PromiseLike<any> {
        return async function(ctx: Mocha.Context): Promise<void | any> {
            if (approval && tc.args.tokenFrom.isGasToken) {
                return
            }

            setTimeout(ctx, tc.args.chainIdFrom);

            let execProm: Promise<void>;
            if (staticCall) {
                execProm = callStatic(prom as Promise<StaticCallResult>);
            } else {
                execProm = executeTransaction(prom as Promise<TransactionResponse>);
            }

            if (approval) {
                return (await expectNothingFromPromise(execProm))
            }

            if (tc.expected.executeSuccess) {
                return (await expect(execProm).to.eventually.be.fulfilled)
            }

            return (await expect(execProm).to.eventually.be.rejected)
        }
    }

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
            const
                walletArgs = buildWalletArgs(tc.args.chainIdFrom, bridgeInteractionsPrivkey.privkey),
                {wallet, bridgeInstance} = walletArgs;

            let
                canBridge:      boolean,
                outputEstimate: BridgeOutputEstimate,
                doBridgeArgs:   BridgeTransactionParams;

            step("[*] acquire output estimate", async function(this: Mocha.Context) {
                setTimeout(this, tc.args.chainIdFrom);

                let prom = getBridgeEstimate(tc, walletArgs);

                await expectFulfilled(prom);

                const {outputEstimate: estimate, bridgeArgs: bridgeParams} = await prom;

                expectNotZero(estimate.amountToReceive);

                outputEstimate = estimate;
                doBridgeArgs = bridgeParams;

                return
            });

            describe("- checkCanBridge() test", function(this: Mocha.Suite) {
                const canBridgeTestTitle: string = `should${tc.expected.canBridge ? "" : " not"} be able to bridge`;

                it(canBridgeTestTitle, async function(this: Mocha.Context) {
                    const {chainIdFrom, chainIdTo} = tc.args;
                    if (chainIdFrom === ChainId.HARMONY || chainIdTo === ChainId.HARMONY) {
                        this.timeout(15 * 1000);
                    } else {
                        this.timeout(5.5 * 1000);
                    }

                    setTimeout(this, tc.args.chainIdFrom);

                    let prom = bridgeInstance.checkCanBridge({
                        token: tc.args.tokenFrom,
                        signer: wallet,
                        amount: tc.args.amountFrom,
                    }).then(({canBridge: res}) => {
                        canBridge = res;
                        return res
                    });

                    return (await expect(prom)
                        .to
                        .eventually
                        .equal(tc.expected.canBridge)
                    )
                });
            });

            describe("- Transaction Builders Tests", function(this: Mocha.Suite) {
                let
                    approvalTxn:     PopulatedTransaction,
                    bridgeTxn:       PopulatedTransaction;

                const makeBuilderTitle = (txKind: string): string => `${txKind} should build successfully`;

                const
                    approveTitle: string = makeBuilderTitle("approval"),
                    bridgeTitle:  string = makeBuilderTitle("token bridge");

                step(approveTitle, async function(this: Mocha.Context) {
                    if (tc.args.tokenFrom.isGasToken) return

                    setTimeout(this, tc.args.chainIdFrom);

                    const prom = bridgeInstance.buildApproveTransaction({token: tc.args.tokenFrom});
                    Promise.resolve(prom).then((txn) => approvalTxn = txn);

                    return (await expectFulfilled(prom))
                });

                step(bridgeTitle, async function(this: Mocha.Context) {
                    setTimeout(this, tc.args.chainIdFrom);

                    const prom = bridgeInstance.buildBridgeTokenTransaction(doBridgeArgs)
                    Promise.resolve(prom).then((txn) => bridgeTxn = txn).catch(err => {
                        let e = (err as Error);
                        console.error(e.stack)
                    });

                    return (await expectFulfilled(prom))
                });

                step(approvalTxnTestTitle, async function(this: Mocha.Context) {
                    if (tc.args.tokenFrom.isGasToken) return

                    let prom: Promise<TxExecResult> = tc.callStatic
                        ? staticCallPopulatedTransaction(approvalTxn, wallet)
                        : wallet.sendTransaction(approvalTxn);

                    return await executeTxn(
                        tc,
                        prom,
                        tc.callStatic,
                        true
                    )(this)
                });

                step(bridgeTxnTestTitle, async function(this: Mocha.Context) {
                    let prom: Promise<TxExecResult> = tc.callStatic
                        ? staticCallPopulatedTransaction(bridgeTxn, wallet)
                        : wallet.sendTransaction(bridgeTxn);

                    return await executeTxn(
                        tc,
                        prom,
                        tc.callStatic
                    )(this)
                });
            });

            if (!tc.callStatic) {
                describe("- Magic Executors tests", function(this: Mocha.Suite) {
                    step(approvalTxnTestTitle, async function(this: Mocha.Context) {
                        if (tc.args.tokenFrom.isGasToken) return

                        let prom = bridgeInstance.executeApproveTransaction({token: tc.args.tokenFrom}, wallet);

                        return await executeTxn(
                            tc,
                            prom,
                            tc.callStatic,
                            true
                        )(this)
                    });

                    step(bridgeTxnTestTitle, async function (this: Mocha.Context) {
                        let prom = bridgeInstance.executeBridgeTokenTransaction(doBridgeArgs, wallet);

                        return await executeTxn(
                            tc,
                            prom,
                            tc.callStatic
                        )(this)
                    });
                });
            }
        });
    });
});