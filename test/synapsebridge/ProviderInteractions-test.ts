import {expect} from "chai";
import {step} from "mocha-steps";

import {Bridge, ChainId, Networks, type Token, Tokens} from "@sdk";

import {TerraSignerWrapper} from "@sdk/internal/utils";
import {CanBridgeError}   from "@sdk/bridge/bridgeutils";
import {ERC20}              from "@sdk/bridge/erc20";
import {SynapseContracts}   from "@sdk/common/synapse_contracts";

import {SynapseBridgeFactory} from "@sdk/contracts";

import {GenericSigner, GenericTxnResponse, StaticCallResult} from "@sdk/common/types";
import {decodeHexTerraAddress, rejectPromise, staticCallPopulatedTransaction} from "@sdk/common/utils";

import {
    DEFAULT_TEST_TIMEOUT,
    expectFulfilled,
    expectNothingFromPromise,
    expectNotZero,
    expectRejected,
    WalletArgs,
    buildWalletArgs,
    RunLiveBridgeTests,
    SHORT_TEST_TIMEOUT,
} from "@tests/helpers";

import {bridgeInteractionsPrivkey, type BridgeSwapTestCase, bridgeSwapTestPrivkey} from "./bridge_test_utils";

import {MockTerraSignerWrapper} from "./mockterrasigner";

import type {PopulatedTransaction} from "@ethersproject/contracts";

import {Zero} from "@ethersproject/constants";
import {BigNumber}  from "@ethersproject/bignumber";
import {Wallet as EvmWallet} from "@ethersproject/wallet";
import {TransactionResponse} from "@ethersproject/providers";
import {TransactionDescription} from "@ethersproject/abi";


import {BlockTxBroadcastResult, MsgExecuteContract, Wallet as TerraWallet} from "@terra-money/terra.js";


function executeTransaction(prom: Promise<TransactionResponse>): Promise<void> {
    return prom
        .then((response: TransactionResponse): Promise<void> =>
            response.wait(1)
                .then(() => {})
        )
}

function executeTransactionTerra(prom: Promise<BlockTxBroadcastResult>): Promise<void> {
    return prom
        .then(() => {})
        .catch(err => {
            if (err.isAxiosError) {
                const {response: {data}} = err;
                return rejectPromise(data.message)
            }

            return rejectPromise(err)
        })
}

interface EstimateOutputs {
    outputEstimate: Bridge.BridgeOutputEstimate,
    bridgeArgs:     Bridge.BridgeTransactionParams,
}


describe("SynapseBridge - Provider Interactions tests", function(this: Mocha.Suite) {
    interface TestOpts {
        executeSuccess: boolean,
        canBridge:      boolean,
    }

    interface TestCase extends BridgeSwapTestCase<TestOpts> {
        callStatic: boolean,
    }

    function makeTc(
        t1: Token,  t2: Token,
        c1: number, c2: number,
        succeeds: boolean, canBridge: boolean,
        amountFrom: BigNumber
    ): any {
        return {
            args: {
                tokenFrom:   t1,
                tokenTo:     t2,
                chainIdFrom: c1,
                chainIdTo:   c2,
                amountFrom:  amountFrom,
            },
            expected: {
                executeSuccess: succeeds,
                canBridge:      canBridge,
            },
        }
    }

    function makeCallStaticTc(
        t1: Token, t2: Token,
        c1: number, c2: number,
        succeeds: boolean, canBridge: boolean,
        amountFrom: BigNumber
    ): TestCase {
        const {args, expected} = makeTc(t1, t2, c1, c2, succeeds, canBridge, amountFrom);
        return {
            args, expected,
            callStatic: true,
        }
    }

    function makeSignerSendTc(
        t1: Token, t2: Token,
        c1: number, c2: number,
        succeeds: boolean, canBridge: boolean,
        amountFrom: BigNumber
    ): TestCase {
        const {args, expected} = makeTc(t1, t2, c1, c2, succeeds, canBridge, amountFrom);
        return {
            args, expected,
            callStatic: false,
        }
    }

    function makeUSTTest(
        c1: number, c2: number,
        succeeds: boolean, canBridge: boolean,
        amountFrom: BigNumber, callStatic: boolean=true
    ): TestCase {
        return callStatic
            ? makeCallStaticTc(Tokens.UST, Tokens.UST, c1, c2, succeeds, canBridge, amountFrom)
            : makeSignerSendTc(Tokens.UST, Tokens.UST, c1, c2, succeeds, canBridge, amountFrom)
    }

    const
        failAmt:   BigNumber = BigNumber.from("420696969000000000000"),
        beastAmt:  BigNumber = BigNumber.from("666000000"),
        bridgeAmt: BigNumber = BigNumber.from("1005000");

    let testCases: TestCase[] = [
        makeSignerSendTc(Tokens.ETH,    Tokens.WETH,     ChainId.OPTIMISM,     ChainId.ETH,         false,   false,  failAmt),
        makeCallStaticTc(Tokens.ETH,    Tokens.WETH,     ChainId.BOBA,         ChainId.ETH,         false,   false,  failAmt),
        makeCallStaticTc(Tokens.ETH,    Tokens.NETH,     ChainId.ETH,          ChainId.OPTIMISM,    false,   false,  failAmt),
        makeSignerSendTc(Tokens.ETH,    Tokens.NETH,     ChainId.ETH,          ChainId.OPTIMISM,    false,   false,  failAmt),
        makeSignerSendTc(Tokens.NUSD,   Tokens.USDT,     ChainId.POLYGON,      ChainId.FANTOM,      false,   false,  failAmt),
        makeSignerSendTc(Tokens.DAI,    Tokens.USDT,     ChainId.AVALANCHE,    ChainId.FANTOM,      false,   false,  BigNumber.from("666000000000000000000")),
        makeCallStaticTc(Tokens.ETH,    Tokens.WETH_E,   ChainId.ARBITRUM,     ChainId.AVALANCHE,   true,    true,   BigNumber.from("6000000000000000")),
    ];

    const ustTestCases: TestCase[] = [
        makeUSTTest(ChainId.POLYGON, ChainId.FANTOM,  false, false, beastAmt),
        makeUSTTest(ChainId.BSC,     ChainId.TERRA,   false, false, beastAmt),
        makeUSTTest(ChainId.POLYGON, ChainId.TERRA,   false, false, beastAmt),
        makeUSTTest(ChainId.TERRA,   ChainId.FANTOM,  false, false, beastAmt),
        makeUSTTest(ChainId.TERRA,   ChainId.FANTOM,  true,  true,  bridgeAmt),
    ];

    const liveTestCases: TestCase[] = [
    //     makeUSTTest(ChainId.TERRA,    ChainId.HARMONY, true, true,  BigNumber.from("2000000"), false),
    //     makeUSTTest(ChainId.HARMONY,  ChainId.BSC,     true, true,  BigNumber.from("8000000"), false),
    //     makeUSTTest(ChainId.BSC,      ChainId.TERRA,   true, true,  BigNumber.from("4500000"), false),
    ];

    testCases = [
        ...testCases,
        ...ustTestCases,
        ...(RunLiveBridgeTests ? liveTestCases : [])
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

    function executeTxnFunc(
        tc:       TestCase,
        prom:     Promise<GenericTxnResponse>,
        approval: boolean=false
    ): (ctx: Mocha.Context) => PromiseLike<any> {
        return async function (ctx: Mocha.Context): Promise<void | any> {
            if (approval && tc.args.tokenFrom.isEqual(Tokens.ETH)) return

            ctx.timeout(20*1000);

            if (tc.args.chainIdFrom === ChainId.TERRA) {
                let execProm = executeTransactionTerra(prom as Promise<BlockTxBroadcastResult>);

                return (await (tc.expected.executeSuccess
                        ? expectFulfilled(execProm)
                        : expectRejected(execProm)
                ))
            }

            let execProm = executeTransaction(prom as Promise<TransactionResponse>);

            if (approval) {
                return (await expectNothingFromPromise(execProm))
            }

            return (await (tc.expected.executeSuccess
                    ? expectFulfilled(execProm)
                    : expectRejected(execProm)
            ))
        }
    }

    function executeStaticCallFunc(
        tc:       TestCase,
        prom:     Promise<StaticCallResult>,
        approval: boolean=false
    ): (ctx: Mocha.Context) => PromiseLike<any> {
        return async function (ctx: Mocha.Context): Promise<void | any> {
            if (approval && tc.args.tokenFrom.isEqual(Tokens.ETH)) return

            ctx.timeout(20*1000);

            let execProm = Promise.resolve(prom)
                .then(res => {
                    if (res === StaticCallResult.Failure) {
                        return rejectPromise("static call failed")
                    }
                })
                .catch(rejectPromise)

            if (approval) {
                return (await expectNothingFromPromise(execProm))
            }

            return (await (tc.expected.executeSuccess
                    ? expectFulfilled(execProm)
                    : expectRejected(execProm)
            ))
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
            let
                walletArgs = buildWalletArgs(
                    tc.args.chainIdFrom,
                    bridgeInteractionsPrivkey.privkey
                ),
                wallet         = walletArgs.wallet,
                bridgeInstance = walletArgs.bridgeInstance;

            let
                outputEstimate: Bridge.BridgeOutputEstimate,
                doBridgeArgs:   Bridge.BridgeTransactionParams;

            step("acquire output estimate", async function(this: Mocha.Context) {
                this.timeout(DEFAULT_TEST_TIMEOUT);
                this.slow(1.5*1000);

                let prom = getBridgeEstimate(tc, walletArgs);

                await expectFulfilled(prom);

                const {outputEstimate: estimate, bridgeArgs: bridgeParams} = await prom;

                expectNotZero(estimate.amountToReceive);

                outputEstimate = estimate;
                doBridgeArgs = bridgeParams;

                if (tc.args.chainIdTo === ChainId.TERRA) {
                    doBridgeArgs.addressTo = walletArgs.terraAddress;
                } else {
                    doBridgeArgs.addressTo = walletArgs.evmAddress;
                }

                return
            });

            describe("Test checkCanBridge()", function(this: Mocha.Suite) {
                const canBridgeTestTitle: string = `should${tc.expected.canBridge ? "" : " not"} be able to bridge`;

                it(canBridgeTestTitle, function(this: Mocha.Context, done: Mocha.Done) {
                    this.timeout(5.5*1000);
                    this.slow(2.75*1000);

                    let prom = bridgeInstance.checkCanBridge({
                        token: tc.args.tokenFrom,
                        address: walletArgs.address,
                        amount: tc.args.amountFrom,
                    }).then(({canBridge}) => canBridge)

                    expect(prom).to.eventually
                        .equal(tc.expected.canBridge)
                        .notify(done);
                });
            });

            let needsApproval = true;

            step("Check approval", async function(this: Mocha.Context) {
                if (tc.args.chainIdFrom === ChainId.TERRA) {
                    needsApproval = false;
                    return
                }

                if (tc.args.tokenFrom.isEqual(Tokens.ETH)) {
                    needsApproval = false;
                    return
                }

                this.slow(1.5*1000);

                const _contracts = SynapseContracts.contractsForChainId(tc.args.chainIdFrom);

                const spender: string = tc.args.tokenFrom.isEqual(Tokens.UST) && tc.args.chainIdTo === ChainId.TERRA
                    ? _contracts.bridgeAddress
                    : _contracts.bridgeZapAddress;

                const allowanceArgs = {
                    tokenAddress: tc.args.tokenFrom.address(tc.args.chainIdFrom),
                    chainId:      tc.args.chainIdFrom
                };

                let allowance = await ERC20.allowanceOf(
                    walletArgs.evmAddress,
                    spender,
                    allowanceArgs
                );

                needsApproval = allowance.lt(tc.args.amountFrom);
            });

            function getGenericSigner(
                w: TerraWallet | EvmWallet,
                callStatic: boolean,
                wantFail:   boolean
            ): GenericSigner {
                let _wallet: GenericSigner;

                if (w instanceof TerraWallet) {
                    _wallet = callStatic
                        ? new MockTerraSignerWrapper(w, wantFail)
                        : new TerraSignerWrapper(w);
                } else {
                    _wallet = w as EvmWallet;
                }

                return _wallet
            }

            describe("Test Transaction Builders", function(this: Mocha.Suite) {
                let
                    approvalTxn:     PopulatedTransaction,
                    bridgeTxn:       PopulatedTransaction | MsgExecuteContract;

                const
                    approveTitle: string = "approval transaction should be populated successfully",
                    bridgeTitle:  string = "bridge transaction should be populated successfully";

                describe("- build transactions", function(this: Mocha.Suite) {
                    step(approveTitle, function(this: Mocha.Context, done: Mocha.Done) {
                        if (tc.args.tokenFrom.isEqual(Tokens.ETH)) {
                            done();
                            return
                        }
                        if (tc.args.chainIdFrom === ChainId.TERRA) {
                            done();
                            return
                        }

                        this.timeout(DEFAULT_TEST_TIMEOUT);

                        let prom = bridgeInstance.buildApproveTransaction({token: tc.args.tokenFrom});
                        Promise.resolve(prom).then(t => approvalTxn = t);

                        expect(prom).to.eventually.be.fulfilled.notify(done);
                    });

                    step(bridgeTitle, function(this: Mocha.Context, done: Mocha.Done) {
                        this.timeout(DEFAULT_TEST_TIMEOUT);

                        let prom = bridgeInstance.buildBridgeTokenTransaction(doBridgeArgs);
                        Promise.resolve(prom).then(t => bridgeTxn = t);

                        expect(prom).to.eventually.be.fulfilled.notify(done);
                    });

                    if (tc.args.chainIdTo === ChainId.TERRA) {
                        describe("* Test properties of populated redeemV2 transaction", function(this: Mocha.Suite) {
                            let decoded: TransactionDescription;

                            step("Bridge transaction should decode to redeemV2", function(this: Mocha.Context) {
                                const
                                    t = bridgeTxn as PopulatedTransaction,
                                    synBridge = SynapseBridgeFactory.createInterface();

                                try {
                                    decoded = synBridge.parseTransaction({data: t.data});
                                } catch (e) {
                                    expect.fail();
                                }
                            });

                            it("tx data should have a 'name' property equal to 'redeemV2'", function(this: Mocha.Context) {
                                expect(decoded).to.have.property("name", "redeemV2");
                            });

                            it("tx data should have 4 arguments, one of them being 'to'", function(this: Mocha.Context) {
                                expect(decoded).to.have.property("args").with.length(4);
                                expect(decoded.args).to.have.property("to");
                            });

                            it("tx data should  have a 'value' property equal to 0", function(this: Mocha.Context) {
                                expect(decoded).to.have.property("value").which.equals(Zero);
                            });

                            it("tx data should have its 'to' argument set to the correct Terra address", function(this: Mocha.Context) {
                                const
                                    addrTo = decoded.args["to"];

                                expect(decodeHexTerraAddress(addrTo)).to.equal(walletArgs.terraAddress);
                            });
                        });
                    }
                });

                const execOnTerra: boolean = tc.args.chainIdFrom === ChainId.TERRA && !tc.callStatic;

                if (!execOnTerra) {
                    describe("- execute transactions", function(this: Mocha.Suite) {
                        step(approvalTxnTestTitle, async function(this: Mocha.Context) {
                            if (!needsApproval) {
                                return
                            }

                            const _wallet = getGenericSigner(wallet, tc.callStatic, tc.expected.executeSuccess);

                            this.slow(SHORT_TEST_TIMEOUT);

                            if (tc.callStatic && tc.args.chainIdFrom !== ChainId.TERRA) {
                                return await executeStaticCallFunc(
                                    tc,
                                    staticCallPopulatedTransaction(approvalTxn as PopulatedTransaction, wallet as EvmWallet)
                                )(this)
                            }

                            return await executeTxnFunc(
                                tc,
                                _wallet.sendTransaction(approvalTxn),
                                true
                            )(this)
                        });

                        step(bridgeTxnTestTitle, async function(this: Mocha.Context) {
                            this.slow(SHORT_TEST_TIMEOUT);

                            const _wallet = getGenericSigner(wallet, tc.callStatic, tc.expected.executeSuccess);

                            if (tc.callStatic && tc.args.chainIdFrom !== ChainId.TERRA) {
                                return await executeStaticCallFunc(
                                    tc,
                                    staticCallPopulatedTransaction(bridgeTxn as PopulatedTransaction, wallet as EvmWallet)
                                )(this)
                            }

                            return await executeTxnFunc(
                                tc,
                                _wallet.sendTransaction(bridgeTxn)
                            )(this)
                        });
                    });
                }
            });

            if (!tc.callStatic) {
                describe("Test Magic Executors", function(this: Mocha.Suite) {
                    step(approvalTxnTestTitle, async function(this: Mocha.Context) {
                        if (!needsApproval) {
                            if (!(tc.args.tokenFrom.isEqual(Tokens.DAI) && tc.args.chainIdFrom === ChainId.AVALANCHE)) {
                                return
                            }
                        }

                        this.slow(1.5*1000);

                        return await executeTxnFunc(
                            tc,
                            bridgeInstance.executeApproveTransaction({token: tc.args.tokenFrom}, wallet as EvmWallet),
                            true
                        )(this)
                    });

                    step(bridgeTxnTestTitle, async function (this: Mocha.Context) {
                        this.slow(SHORT_TEST_TIMEOUT);

                        const _wallet = getGenericSigner(wallet, tc.callStatic, tc.expected.executeSuccess);

                        let prom: Promise<GenericTxnResponse> =
                            bridgeInstance.executeBridgeTokenTransaction(doBridgeArgs, _wallet);

                        return await executeTxnFunc(
                            tc,
                            prom
                        )(this)
                    });
                });
            }
        });
    });

    describe("* Validation tests", function(this: Mocha.Suite) {
        const
            chainIdFrom = ChainId.BSC,
            walletArgs = buildWalletArgs(
                chainIdFrom,
                bridgeInteractionsPrivkey.privkey
            ),
            bridgeInstance = walletArgs.bridgeInstance;

        let
            outEstimate:    Bridge.BridgeOutputEstimate;

        const params: Bridge.BridgeParams = {
            tokenFrom:   Tokens.UST,
            tokenTo:     Tokens.UST,
            chainIdTo:   ChainId.TERRA,
            amountFrom:  Tokens.UST.valueToWei("10", chainIdFrom),
        };

        step("- get output estimate", function(this: Mocha.Context, done: Mocha.Done) {
            this.timeout(5*1000);
            this.slow(1.5*1000);

            let prom = bridgeInstance.estimateBridgeTokenOutput(params);
            Promise.resolve(prom).then(res => outEstimate = res);

            return expect(prom).to.eventually.not.be.rejected.notify(done);
        });

        it("buildBridgeTokenTransaction should throw an error when passed an invalid terra address", function(this: Mocha.Context, done: Mocha.Done) {
            const bridgeArgs: Bridge.BridgeTransactionParams = {
                ...params,
                amountFrom: Tokens.UST.valueToWei("5", chainIdFrom),
                amountTo:   outEstimate.amountToReceive,
                addressTo:  walletArgs.evmAddress,
            };

            let prom = bridgeInstance.buildBridgeTokenTransaction(bridgeArgs);

            const wantErrMsg: string = `${bridgeArgs.addressTo} passed as BridgeTransactionParams.addressTo is not a valid Terra address`;

            return expect(prom).to.eventually
                .be.rejectedWith(wantErrMsg)
                .and.be.an.instanceOf(CanBridgeError)
                .notify(done);
        });

        it("buildBridgeTokenTransaction should throw an error when passed an invalid EVM address", function(this: Mocha.Context, done: Mocha.Done) {
            const
                terraBridge = new Bridge.SynapseBridge({network: ChainId.TERRA}),
                amountFrom  = Tokens.UST.valueToWei("5", ChainId.TERRA),
                bridgeParams: Bridge.BridgeParams = {
                    tokenFrom:   Tokens.UST,
                    tokenTo:     Tokens.UST,
                    chainIdTo:   ChainId.BSC,
                    amountFrom,
                };

            const bridgeArgs: Bridge.BridgeTransactionParams = {
                ...bridgeParams,
                amountFrom,
                amountTo:   outEstimate.amountToReceive,
                addressTo:  walletArgs.terraAddress,
            };

            let prom = terraBridge.buildBridgeTokenTransaction(bridgeArgs);

            const wantErrMsg: string = `${bridgeArgs.addressTo} passed as BridgeTransactionParams.addressTo is not a valid EVM address`;

            return expect(prom).to.eventually
                .be.rejectedWith(wantErrMsg)
                .and.be.an.instanceOf(CanBridgeError)
                .notify(done);
        });

        describe("attempt to execute a transaction on Terra, but fail", function(this: Mocha.Suite) {
            const
                terraBridge = new Bridge.SynapseBridge({network: ChainId.TERRA}),
                amountFrom  = Tokens.UST.valueToWei("500000000000", ChainId.TERRA),
                bridgeParams: Bridge.BridgeParams = {
                    tokenFrom:   Tokens.UST,
                    tokenTo:     Tokens.UST,
                    chainIdTo:   ChainId.BSC,
                    amountFrom,
                };

            let
                walletArgs = buildWalletArgs(ChainId.TERRA),
                terraWallet = walletArgs.wallet as TerraWallet,
                estimate: Bridge.BridgeOutputEstimate;

            step("get another output estimate", function(this: Mocha.Context, done: Mocha.Done) {
                this.timeout(5*1000);
                this.slow(1.5*1000);

                let prom = terraBridge.estimateBridgeTokenOutput(bridgeParams);
                Promise.resolve(prom).then(res => estimate = res);

                expect(prom).to.eventually.not.be.rejected.notify(done);
            });

            it("magic executor should fail", function(this: Mocha.Context, done: Mocha.Done) {
                this.slow(1.5*1000);

                const txnParams: Bridge.BridgeTransactionParams = {
                    ...bridgeParams,
                    amountFrom,
                    amountTo:  estimate.amountToReceive,
                    addressTo: walletArgs.evmAddress,
                };

                const wantErrMsg: string = `Balance of token ${Tokens.UST.symbol} is too low`;

                let prom = terraBridge.executeBridgeTokenTransaction(txnParams, terraWallet);

                expect(prom).to.eventually
                    .be.rejectedWith(wantErrMsg)
                    .and.be.an.instanceof(CanBridgeError)
                    .notify(done);
            });

            it("executing built transaction should fail", function(this: Mocha.Context, done: Mocha.Done) {
                this.slow(1.5*1000);

                const txnParams: Bridge.BridgeTransactionParams = {
                    ...bridgeParams,
                    amountFrom: BigNumber.from("500000000000"),
                    amountTo:   BigNumber.from("400000000000"),
                    addressTo:  walletArgs.evmAddress,
                };

                let walletWrapper = new TerraSignerWrapper(terraWallet);

                let prom: Promise<any> = terraBridge
                    .buildBridgeTokenTransaction(txnParams)
                    .then((m): Promise<any> => walletWrapper.sendTransaction(m as MsgExecuteContract));

                expect(prom).to.eventually.be.rejected.notify(done);
            });
        });
    });
});