import {
    ChainId,
    Networks
} from "../common";
import {SwapType} from "../common/swaptype";
import {
    contractAddressFor,
    executePopulatedTransaction,
    rejectPromise,
} from "../common/utils";

import {
    Tokens,
} from "../tokens";

import type {Token} from "../token";

import {SwapPools} from "../swappools";

import {GenericZapBridgeContract, L1BridgeZapContract, SynapseBridgeContract} from "../contracts";

import {SynapseEntities} from "../entities";

import {newProviderForNetwork} from "../rpcproviders";

import {Zero} from "@ethersproject/constants";
import {Signer} from "@ethersproject/abstract-signer";
import {Provider} from "@ethersproject/providers";
import {formatUnits} from "@ethersproject/units";
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import {ContractTransaction, PopulatedTransaction} from "@ethersproject/contracts";

import {UnsupportedSwapReason} from "./errors";

import {
    ERC20,
    MAX_APPROVAL_AMOUNT
} from "./erc20";

import {BridgeUtils} from "./bridgeutils";
import {GasUtils} from "./gasutils";
import {BaseToken, WrappedToken} from "../token";


/**
 * Bridge provides a wrapper around common Synapse Bridge interactions, such as output estimation, checking supported swaps/bridges,
 * and most importantly, executing Bridge transactions.
 */
export namespace Bridge {
    type CanBridgeResult = [boolean, Error];
    export type CheckCanBridgeResult = [boolean, BigNumber];

    export interface BridgeOutputEstimate {
        amountToReceive: BigNumber,
        bridgeFee:       BigNumber,
    }

    /**
     * @param {BaseToken} tokenFrom {@link BaseToken} user will send to the bridge on the source chain
     * @param {BaseToken} tokenTo {@link BaseToken} user will receive from the bridge on the destination chain
     * @param {number} chainIdTo Chain ID of the destination chain
     * @param {BigNumber} amountFrom not necessarily used by this interface, and overriden in BridgeParamsWithAmounts.
     */
    export interface BridgeParams {
        tokenFrom:   Token,
        tokenTo:     Token
        chainIdTo:   number,
        amountFrom?: BigNumber,
    }

    /**
     * @param {BigNumber} amountFrom Amount of tokenFrom (denoted in wei) that the user will send to the bridge on the source chain.
     * @param {BigNumber} amountTo Amount of tokenTo (denoted in wei) that the user will receive from the bridge on the destination chain.
     * @param {string} addressTo Optional, user can provide an address other than the one retrieved from signer to receive tokens
     * on the destination chain.
     */
    export interface BridgeTransactionParams extends BridgeParams {
        amountFrom: BigNumber,
        amountTo:   BigNumber,
        addressTo?: string
    }

    interface BridgeTokenArgs {
        fromChainTokens: Token[],
        toChainTokens:   Token[],
        tokenFrom:       Token,
        tokenTo:         Token,
        tokenIndexFrom:  number,
        tokenIndexTo:    number,
    }

    /**
     * SynapseBridge is a wrapper around any Synapse Bridge contract which exists on chains supported by the Synapse Protocol.
     */
    export class SynapseBridge {
        protected network: Networks.Network;
        protected chainId: number;
        protected provider: Provider;

        private readonly bridgeAddress: string;
        private readonly bridgeInstance: SynapseBridgeContract;
        private readonly networkZapBridgeInstance: GenericZapBridgeContract;
        private readonly isL2Zap: boolean;

        private readonly zapBridgeAddress: string;

        private readonly bridgeConfigInstance = SynapseEntities.bridgeConfig();
        private readonly zapBridgeInstance = SynapseEntities.l1BridgeZap({
            chainId: ChainId.ETH,
            signerOrProvider: newProviderForNetwork(ChainId.ETH),
        });

        readonly requiredConfirmations: number;

        constructor(args: {
            network: Networks.Network | number,
            provider?: Provider
        }) {
            let {network, provider} = args;

            this.network = network instanceof Networks.Network ? network : Networks.fromChainId(network);
            this.chainId = this.network.chainId;
            this.provider = provider ?? newProviderForNetwork(this.chainId);

            this.requiredConfirmations = getRequiredConfirmationsForBridge(this.network);

            this.isL2Zap = this.network.zapIsL2BridgeZap;

            let factoryParams = {chainId: this.chainId, signerOrProvider: this.provider};
            this.bridgeInstance = SynapseEntities.synapseBridge(factoryParams);
            this.bridgeAddress = contractAddressFor(this.chainId, "bridge");

            this.networkZapBridgeInstance = SynapseEntities.zapBridge({ chainId: this.chainId, signerOrProvider: this.provider })

            this.zapBridgeAddress = this.networkZapBridgeInstance.address;
        }

        bridgeVersion(): Promise<BigNumber> {
            return this.bridgeInstance.bridgeVersion()
        }

        WETH_ADDRESS(): Promise<string> {
            return this.bridgeInstance.WETH_ADDRESS()
        }

        /**
         * Returns whether a swap/bridge from this Bridge's chain to another chain between two tokens
         * is supported.
         * @param {BaseToken} args.tokenFrom {@link Token} user will send to the bridge
         * @param {BaseToken} args.tokenTo {@link Token} user will receive from the bridge on the destination chain
         * @param {number} args.chainIdTo Chain ID of the destination chain
         * @return boolean value denoting whether the input params constitute a valid swap/bridge, along with a
         * string value denoting the reason for an unsupported swap, if applicable.
         */
        swapSupported(args: {
            tokenFrom: Token,
            tokenTo: Token
            chainIdTo: number,
        }): [boolean, string] {
            let {tokenFrom, tokenTo, chainIdTo} = args;

            if (!this.network.supportsToken(tokenFrom)) {
                return [false, UnsupportedSwapReason.TokenNotSupported_From]
            }

            if (!Networks.networkSupportsToken(chainIdTo, tokenTo)) {
                return [false, UnsupportedSwapReason.TokenNotSupported_To]
            }

            if (tokenFrom.swapType !== tokenTo.swapType) {
                return [false, UnsupportedSwapReason.NonmatchingSwapTypes]
            }

            let
                isEthFromBoba = (this.chainId === ChainId.BOBA) && (tokenFrom.swapType === SwapType.ETH),
                isEthToBoba = (chainIdTo === ChainId.BOBA) && (tokenTo.swapType === SwapType.ETH);

            if (isEthFromBoba || isEthToBoba) {
                return [false, UnsupportedSwapReason.ETHOnBOBA]
            }
            // if ((this.chainId === ChainId.BOBA) && (tokenFrom.swapType === SwapType.ETH)) {
            //     if ((chainIdTo === ChainId.ETH) && (tokenTo.isETH)) {
            //         return [false, UnsupportedSwapReason.BOBAToL1]
            //     }
            // }

            return [true, ""]
        }

        /**
         * Returns the estimated output of a given token on the destination chain were a user to send
         * some amount of another given token on the source chain.
         * @param {BridgeParams} args Parameters for the output estimation.
         * @return {Promise<BridgeOutputEstimate>} Object containing the estimated output of args.tokenTo, as well
         * as the estimated fee to be taken by the bridge. Note that the estimated output already accounts for the
         * bridge fee, so the bridge fee is entirely for user-facing purposes. Do not use it for calculations.
         */
        async estimateBridgeTokenOutput(args: BridgeParams): Promise<BridgeOutputEstimate> {
            try {
                await this.checkSwapSupported(args);
            } catch (e) {
                return rejectPromise(e);
            }

            return this.calculateBridgeRate(args)
        }

        /**
         * Returns a populated transaction for initiating a token bridge between this Bridge (the source chain) and the bridge contract on the destination chain.
         * Note that this function **does not** send a signed transaction.
         * @param {BridgeTransactionParams} args Parameters for the bridge transaction
         * @return {Promise<PopulatedTransaction>} Populated transaction instance which can be sent via ones choice
         * of web3/ethers/etc.
         */
        async buildBridgeTokenTransaction(args: BridgeTransactionParams): Promise<PopulatedTransaction> {
            const
                {addressTo} = args,
                tokenArgs = this.makeBridgeTokenArgs(args),
                {tokenFrom, tokenTo} = tokenArgs;

            if ((!addressTo) || addressTo === "") {
                return rejectPromise(
                    new Error("BridgeTransactionParams.addressTo cannot be empty string or undefined")
                )
            }

            args = {...args, tokenFrom, tokenTo};

            let newTxn: Promise<PopulatedTransaction> = this.chainId === ChainId.ETH
                ? this.buildETHMainnetBridgeTxn(args, tokenArgs)
                : this.buildL2BridgeTxn(args, tokenArgs);

            return newTxn
                .then((txn) => {
                    let {maxPriorityFee, gasPrice, bridgeGasLimit} = GasUtils.makeGasParams(this.chainId);

                    if (maxPriorityFee) {
                        txn.maxPriorityFeePerGas = maxPriorityFee;
                    }

                    if (gasPrice) {
                        txn.gasPrice = gasPrice;
                    }

                    if (bridgeGasLimit) {
                        txn.gasLimit = bridgeGasLimit;
                    }

                    return txn
                })
                .catch(rejectPromise)
        }

        /**
         * Starts the Bridge process between this Bridge (the source chain) and the bridge contract on the destination chain.
         * Note that this function **does** send a signed transaction.
         * @param {BridgeTransactionParams} args Parameters for the bridge transaction.
         * @param {Signer} signer Some instance which implements the Ethersjs {@link Signer} interface.
         * @return {Promise<ContractTransaction>}
         */
        async executeBridgeTokenTransaction(args: BridgeTransactionParams, signer: Signer): Promise<ContractTransaction> {
            try {
                await this.checkSwapSupported(args);
            } catch (e) {
                return rejectPromise(e);
            }

            const
                {tokenFrom, amountFrom, addressTo} = args,
                signerAddress = await signer.getAddress();

            args.addressTo = addressTo ?? signerAddress

            return this.checkCanBridge({
                address: signerAddress,
                token: tokenFrom,
                amount: amountFrom,
            })
                .then((canBridgeRes: CanBridgeResult) => {
                    const [canBridge, err] = canBridgeRes;

                    if (!canBridge) {
                        return rejectPromise(err)
                    }

                    let txnProm = this.buildBridgeTokenTransaction(args);

                    return executePopulatedTransaction(txnProm, signer)
                })
                .catch(rejectPromise)
        }

        /**
         * Builds an ethers PopulatedTransaction instance for an ERC20 Approve call,
         * approving some amount of a given token to be spent by the Synapse Bridge on its chain.
         * The returned PopulatedTransaction must then be passed to the user via Web3 or some other
         * framework so they can ultimately send the transaction.
         * Should ALWAYS be called before performing any bridge transactions to ensure they don't fail.
         * @param {Object} args
         * @param {BaseToken|string} args.token {@link BaseToken} instance or valid on-chain address of the token the user will be sending
         * to the bridge on the source chain.
         * @param {BigNumberish} args.amount Optional, a specific amount of args.token to approve. By default, this function
         * builds an Approve call using an "infinite" approval amount.
         * @return {Promise<PopulatedTransaction>} Populated transaction instance which can be sent via ones choice
         * of web3/ethers/etc.
         */
        async buildApproveTransaction(args: {
            token: Token | string,
            amount?: BigNumberish
        }): Promise<PopulatedTransaction> {
            const [approveArgs, tokenAddress] = this.buildERC20ApproveArgs(args);

            return ERC20.buildApproveTransaction(approveArgs, {tokenAddress, chainId: this.chainId})
        }

        /**
         * Builds and executes an ERC20 Approve call,
         * approving some amount of a given token to be spent by the Synapse Bridge on its chain.
         * The returned PopulatedTransaction must then be passed to the user via Web3 or some other
         * framework so they can ultimately send the transaction.
         * Should ALWAYS be called before performing any bridge transactions to ensure they don't fail.
         * @param {Object} args
         * @param {BaseToken|string} args.token {@link BaseToken} instance or valid on-chain address of the token the user will be sending
         * to the bridge on the source chain.
         * @param {BigNumberish} args.amount Optional, a specific amount of args.token to approve. By default, this function
         * @param {Signer} signer Valid ethers Signer instance for building a fully and properly populated
         * transaction.
         */
        async executeApproveTransaction(args: {
            token: Token | string,
            amount?: BigNumberish
        }, signer: Signer): Promise<ContractTransaction> {
            const [approveArgs, tokenAddress] = this.buildERC20ApproveArgs(args);

            return Promise.resolve(
                ERC20.approve(approveArgs, {tokenAddress, chainId: this.chainId}, signer)
                    .then((res: ContractTransaction) => res)
            )
        }

        async getAllowanceForAddress(args: {
            address: string,
            token:   Token,
        }): Promise<BigNumber> {
            let { address, token } = args;
            let tokenAddress = token.address(this.chainId);

            return ERC20.allowanceOf(address, this.zapBridgeAddress, {tokenAddress, chainId: this.chainId})
        }

        private async checkNeedsApprove(args: {
            address: string,
            token: Token | string,
            amount?: BigNumberish,
        }): Promise<CheckCanBridgeResult> {
            let {amount} = args;
            amount = amount ?? MAX_APPROVAL_AMOUNT.sub(1);

            const {address} = args;
            const [{spender}, tokenAddress] = this.buildERC20ApproveArgs(args);

            return ERC20.allowanceOf(address, spender, {tokenAddress, chainId: this.chainId})
                .then((allowance: BigNumber) => {
                    const res: CheckCanBridgeResult = [allowance.lt(amount), allowance];
                    return res
                })
                .catch(rejectPromise)
        }

        private async checkHasBalance(args: {
            address: string,
            token: Token | string,
            amount: BigNumberish,
        }): Promise<CheckCanBridgeResult> {
            const
                {address, amount} = args,
                [, tokenAddress] = this.buildERC20ApproveArgs(args);

            return ERC20.balanceOf(address, {tokenAddress, chainId: this.chainId})
                .then((balance: BigNumber) => {
                    const res: CheckCanBridgeResult = [balance.gte(amount), balance];
                    return res
                })
                .catch(rejectPromise)
        }

        private async checkCanBridge(args: {
            address: string,
            token: Token,
            amount: BigNumberish,
        }): Promise<CanBridgeResult> {
            const {token} = args;

            const hasBalanceRes = this.checkHasBalance(args)
                .then((balanceRes) => {
                    const [hasBalance, balance] = balanceRes;
                    if (!hasBalance) {
                        let balanceEth: string = formatUnits(balance, token.decimals(this.chainId)).toString();
                        let ret: CanBridgeResult = [false, new Error(`Balance of token ${token.symbol} is too low; current balance is ${balanceEth}`)];
                        return ret
                    }

                    let ret: CanBridgeResult = [true, null];
                    return ret
                })
                .catch(rejectPromise)

            return this.checkNeedsApprove(args)
                .then((approveRes) => {
                    const [needsApprove, allowance] = approveRes;
                    if (needsApprove) {
                        let allowanceEth: string = formatUnits(allowance, token.decimals(this.chainId)).toString();
                        let ret: CanBridgeResult = [false, new Error(`Spend allowance of Bridge too low for token ${token.symbol}; current allowance for Bridge is ${allowanceEth}`)];
                        return ret
                    }

                    return hasBalanceRes
                })
                .catch(rejectPromise)
        }

        private buildERC20ApproveArgs(args: {
            token: Token | string,
            amount?: BigNumberish
        }): [ERC20.ApproveArgs, string] {
            const {token, amount} = args;

            let tokenAddr: string = (token instanceof BaseToken) || (token instanceof WrappedToken)
                ? token.address(this.chainId)
                : token as string;

            return [{
                spender: this.zapBridgeAddress,
                amount
            }, tokenAddr]
        }

        private async checkSwapSupported(args: BridgeParams): Promise<boolean> {
            const
                {chainIdTo, tokenFrom, tokenTo} = args,
                networkTo = Networks.fromChainId(chainIdTo);

            return new Promise<boolean>((resolve, reject) => {
                let [swapSupported, errReason] = this.swapSupported({tokenFrom, chainIdTo, tokenTo});
                if (!swapSupported) {
                    switch (errReason) {
                        case UnsupportedSwapReason.TokenNotSupported_From:
                            reject(`Network '${this.network.name}' does not support token ${tokenFrom.name} (param: tokenFrom)`);
                            break;
                        case UnsupportedSwapReason.TokenNotSupported_To:
                            reject(`Network '${networkTo.name}' (param: chainIdTo) does not support token ${tokenTo.name} (param: tokenTo)`);
                            break;
                        case UnsupportedSwapReason.NonmatchingSwapTypes:
                            reject(`param tokenFrom with swapType '${tokenFrom.swapType}' cannot be bridge to param tokenTo with swapType '${tokenTo.swapType}'`);
                            break;
                        default:
                            reject(errReason);
                            break;
                    }
                }

                resolve(true);
            })
        }

        private async calculateBridgeRate(args: BridgeParams): Promise<BridgeOutputEstimate> {
            let {chainIdTo, amountFrom} = args;

            const toChainZapParams = {chainId: chainIdTo, signerOrProvider: newProviderForNetwork(chainIdTo)};
            const toChainZap: GenericZapBridgeContract = SynapseEntities.zapBridge(toChainZapParams);

            const {
                tokenFrom, tokenTo,
                tokenIndexFrom, tokenIndexTo,
                fromChainTokens
            } = this.makeBridgeTokenArgs(args);

            const mintBurnSwapTypes = [
                SwapType.HIGH, SwapType.DOG, SwapType.JUMP,
                SwapType.NFD,  SwapType.OHM, SwapType.SOLAR,
                SwapType.GMX,
            ];

            let [intermediateToken, bridgeConfigIntermediateToken] = ((): [Token, Token] => {
                if (mintBurnSwapTypes.includes(tokenFrom.swapType)) {
                    return [tokenFrom, tokenFrom]
                }

                switch (tokenFrom.swapType) {
                    case SwapType.SYN:
                        return [Tokens.SYN, Tokens.SYN]
                    case SwapType.FRAX:
                        if (chainIdTo === ChainId.ETH) {
                            return [null, Tokens.FRAX]
                        } else {
                            return [null, Tokens.SYN_FRAX]
                        }
                    case SwapType.ETH:
                        let intermediate: Token;
                        if (chainIdTo === ChainId.ETH) {
                            intermediate = Tokens.WETH;
                        } else {
                            intermediate = Tokens.NETH;
                        }

                        return [Tokens.NETH, intermediate]
                    case SwapType.AVAX:
                        return [Tokens.WAVAX, Tokens.WAVAX]
                    case SwapType.MOVR:
                        return [Tokens.WMOVR, Tokens.WMOVR]
                    default:
                        return [Tokens.NUSD, Tokens.NUSD]
                }
            })();

            const BIGNUM_TEN = BigNumber.from(10);

            bridgeConfigIntermediateToken = bridgeConfigIntermediateToken ?? intermediateToken;
            const bridgeFeeRequest = this.bridgeConfigInstance.calculateSwapFee(
                bridgeConfigIntermediateToken.address(chainIdTo),
                chainIdTo,
                amountFrom.mul(BIGNUM_TEN.pow(18 - tokenFrom.decimals(this.chainId)))
            );

            let amountToReceive_from: BigNumber;

            if (amountFrom === Zero) {
                amountToReceive_from = Zero;
            } else if (tokenFrom.isWrappedToken) {
                amountToReceive_from = amountFrom;
            } else if (Tokens.isMintBurnToken(tokenFrom)) {
                amountToReceive_from = amountFrom;
            } else if (this.chainId === ChainId.ETH) {
                if (BridgeUtils.isL2ETHChain(chainIdTo) && (tokenTo.swapType === SwapType.ETH)) {
                    amountToReceive_from = amountFrom;
                } else {
                    const liquidityAmounts = fromChainTokens.map((t) => tokenFrom.isEqual(t) ? amountFrom : Zero);
                    amountToReceive_from = await this.zapBridgeInstance.calculateTokenAmount(liquidityAmounts, true);
                }
            } else {
                amountToReceive_from = await BridgeUtils.calculateSwapL2Zap(
                    this.networkZapBridgeInstance,
                    intermediateToken.address(this.chainId),
                    tokenIndexFrom,
                    0,
                    amountFrom
                )
            }

            let bridgeFee: BigNumber;
            try {
                bridgeFee = await bridgeFeeRequest;
            } catch (e) {
                console.error(`Error in bridge fee request: ${e}`);
                return null
            }

            amountToReceive_from = BridgeUtils.subBigNumSafe(amountToReceive_from, bridgeFee);

            let amountToReceive_to: BigNumber;
            if (amountToReceive_from.isZero()) {
                amountToReceive_to = Zero;
            } else if (tokenTo.isWrappedToken) {
                amountToReceive_to = amountToReceive_from;
            } else if (Tokens.isMintBurnToken(tokenTo)) {
                amountToReceive_to = amountToReceive_from;
            } else if (chainIdTo === ChainId.ETH) {
                if ((BridgeUtils.isL2ETHChain(this.chainId)) && (tokenFrom.swapType === SwapType.ETH)) {
                    amountToReceive_to = amountToReceive_from;
                } else {
                    amountToReceive_to = await (toChainZap as L1BridgeZapContract)
                        .calculateRemoveLiquidityOneToken(amountToReceive_from, tokenIndexTo);
                }
            } else {
                amountToReceive_to = await BridgeUtils.calculateSwapL2Zap(
                    toChainZap,
                    intermediateToken.address(chainIdTo),
                    0,
                    tokenIndexTo,
                    amountToReceive_from
                );
            }

            return {
                amountToReceive: amountToReceive_to,
                bridgeFee
            }
        }

        private checkEasyArgs(
            args: BridgeTransactionParams,
            zapBridge: GenericZapBridgeContract,
            easyDeposits:    string[],
            easyRedeems:     string[],
            easyDepositETH?: string[],
        ): EasyArgsCheck {
            let castArgs = args as BridgeUtils.BridgeTxParams;

            if (easyRedeems.includes(args.tokenTo.hash)) {
                return {
                    castArgs,
                    isEasy: true,
                    txn: zapBridge.populateTransaction.redeem(...BridgeUtils.makeEasyParams(castArgs, this.chainId, args.tokenTo))
                }
            } else if (easyDeposits.includes(args.tokenTo.hash)) {
                return {
                    castArgs,
                    isEasy: true,
                    txn: zapBridge.populateTransaction.deposit(...BridgeUtils.makeEasyParams(castArgs, this.chainId, args.tokenTo))
                }
            } else if (easyDepositETH.includes(args.tokenTo.hash)) {
                return {
                    castArgs,
                    isEasy: true,
                    txn: zapBridge.populateTransaction.depositETH(...BridgeUtils.depositETHParams(castArgs), {value: args.amountFrom})
                }
            }

            return {castArgs, isEasy: false}
        }

        private buildETHMainnetBridgeTxn(
            args: BridgeTransactionParams,
            tokenArgs: BridgeTokenArgs
        ): Promise<PopulatedTransaction> {
            const
                {addressTo, chainIdTo, amountFrom, amountTo} = args,
                zapBridge = SynapseEntities.l1BridgeZap({
                    chainId: this.chainId,
                    signerOrProvider: this.provider
                });

            let
                easyRedeems:    string[] = [Tokens.SYN.hash],
                easyDeposits:   string[] = [Tokens.HIGH.hash, Tokens.DOG.hash, Tokens.FRAX.hash],
                easyDepositETH: string[] = [Tokens.NETH.hash]

            if (args.tokenFrom.isEqual(Tokens.NUSD)) {
                easyDeposits.push(Tokens.NUSD.hash);
            }

            let {castArgs, isEasy, txn} = this.checkEasyArgs(args, zapBridge, easyDeposits, easyRedeems, easyDepositETH);
            if (isEasy && txn) {
                return txn
            }

            const {
                transactionDeadline,
                bridgeTransactionDeadline,
                minToSwapDestFromOrigin,
                minToSwapDest,
                minToSwapOriginMediumSlippage,
                minToSwapDestFromOriginMediumSlippage,
            } = BridgeUtils.getSlippages(amountFrom, amountTo);

            switch (args.tokenTo.hash) {
                case Tokens.NUSD.hash:
                    if (!args.tokenFrom.isEqual(Tokens.NUSD)) {
                        const liquidityAmounts = tokenArgs.fromChainTokens.map((t) => {
                            return args.tokenFrom.isEqual(t) ? amountFrom : Zero
                        });

                        return zapBridge.populateTransaction.zapAndDeposit(
                            addressTo,
                            chainIdTo,
                            Tokens.NUSD.address(this.chainId),
                            liquidityAmounts,
                            minToSwapDest,
                            transactionDeadline,
                        )
                    }
                    break;
                default:
                    if (BridgeUtils.isETHLikeToken(args.tokenTo) || args.tokenTo.isEqual(Tokens.WETH)) {
                        return zapBridge.populateTransaction.depositETHAndSwap(
                            ...BridgeUtils.depositETHParams(castArgs),
                            0, // nusd tokenindex,
                            tokenArgs.tokenIndexTo,
                            minToSwapDestFromOrigin, // minDy
                            bridgeTransactionDeadline,
                            {value: amountFrom}
                        )
                    }

                    const liquidityAmounts = tokenArgs.fromChainTokens.map((t) => {
                        return args.tokenFrom.isEqual(t) ? amountFrom : Zero
                    });

                    return zapBridge.populateTransaction.zapAndDepositAndSwap(
                        addressTo,
                        chainIdTo,
                        Tokens.NUSD.address(this.chainId),
                        liquidityAmounts,
                        minToSwapOriginMediumSlippage, // minToSwapOrigin,
                        transactionDeadline,
                        0,
                        tokenArgs.tokenIndexTo,
                        minToSwapDestFromOriginMediumSlippage, //, minToSwapDestFromOrigin, // minDy
                        bridgeTransactionDeadline,
                    )
            }
        }

        private buildL2BridgeTxn(
            args: BridgeTransactionParams,
            tokenArgs: BridgeTokenArgs
        ): Promise<PopulatedTransaction> {
            const
                {chainIdTo, amountFrom, amountTo} = args,
                zapBridge = SynapseEntities.l2BridgeZap({
                    chainId: this.chainId,
                    signerOrProvider: this.provider
                });

            if (tokenArgs.tokenFrom.isEqual(Tokens.AVWETH)) {
                tokenArgs.tokenFrom = Tokens.WETH_E;
            }

            let
                easyDeposits:   string[] = [],
                easyRedeems:    string[] = [Tokens.SYN.hash, Tokens.HIGH.hash, Tokens.DOG.hash, Tokens.FRAX.hash],
                easyDepositETH: string[] = []

            if (args.tokenFrom.isEqual(Tokens.NUSD)) {
                easyRedeems.push(Tokens.NUSD.hash);
            }

            BridgeUtils.DepositIfChainTokens.forEach((args) => {
                let {chainId, tokens, depositEth, altChainId} = args;

                let
                    hasAltChain = typeof altChainId !== 'undefined',
                    tokenHashes = tokens.map((t) => t.hash);

                if (this.chainId === chainId) {
                    depositEth
                        ? easyDepositETH.push(...tokenHashes)
                        : easyDeposits.push(...tokenHashes);
                } else {
                    if (hasAltChain) {
                        if (this.chainId === altChainId) easyRedeems.push(...tokenHashes);
                    } else {
                        easyRedeems.push(...tokenHashes);
                    }
                }
            })

            let {castArgs, isEasy, txn} = this.checkEasyArgs(args, zapBridge, easyDeposits, easyRedeems, easyDepositETH);
            if (isEasy && txn) {
                return txn
            }

            const {
                transactionDeadline,
                bridgeTransactionDeadline,
                minToSwapOriginHighSlippage,
                minToSwapDestFromOriginHighSlippage,
                minToSwapDest,
            } = BridgeUtils.getSlippages(amountFrom, amountTo);

            const easyRedeemAndSwap = (baseToken: BaseToken): Promise<PopulatedTransaction> =>
                zapBridge.populateTransaction.redeemAndSwap(
                    ...BridgeUtils.makeEasyParams(castArgs, this.chainId, baseToken),
                    0,
                    tokenArgs.tokenIndexTo,
                    minToSwapDest,
                    transactionDeadline,
                )

            const easySwapAndRedeemAndSwap = (baseToken: BaseToken, withValueOverride: boolean): Promise<PopulatedTransaction> =>
                zapBridge.populateTransaction.swapAndRedeemAndSwap(
                    ...BridgeUtils.makeEasySubParams(castArgs, this.chainId, baseToken),
                    tokenArgs.tokenIndexFrom,
                    0,
                    amountFrom,
                    minToSwapOriginHighSlippage,
                    transactionDeadline,
                    0,
                    tokenArgs.tokenIndexTo,
                    minToSwapDestFromOriginHighSlippage, // swapMinAmount
                    bridgeTransactionDeadline, // toSwapDeadline, // swapDeadline
                    BridgeUtils.makeOverrides(amountFrom, withValueOverride),
                )

            switch (args.tokenTo.hash) {
                case Tokens.NUSD.hash:
                    return zapBridge.populateTransaction.swapAndRedeem(
                        ...BridgeUtils.makeEasySubParams(castArgs, this.chainId, Tokens.NUSD),
                        tokenArgs.tokenIndexFrom,
                        0,
                        amountFrom,
                        minToSwapOriginHighSlippage,
                        transactionDeadline
                    )
                case Tokens.GMX.hash:
                    let params = BridgeUtils.makeEasyParams(castArgs, this.chainId, Tokens.GMX);
                    switch (this.chainId) {
                        case ChainId.ARBITRUM:
                            return zapBridge.populateTransaction.deposit(...params)
                        default:
                            let [addrTo, chainTo,,amount] = params;
                            return this.bridgeInstance.populateTransaction.redeem(
                                addrTo,
                                chainTo,
                                Tokens.GMX.wrapperAddress(this.chainId),
                                amount
                            )
                    }
                default:
                    if (chainIdTo === ChainId.ETH) {
                        if ((BridgeUtils.isL2ETHChain(this.chainId)) && (args.tokenFrom.swapType === SwapType.ETH)) {
                            if (args.tokenFrom.isEqual(Tokens.NETH)) {
                                return zapBridge.populateTransaction.redeem(
                                    ...BridgeUtils.makeEasyParams(castArgs, this.chainId, Tokens.NETH)
                                )
                            } else if (BridgeUtils.isETHLikeToken(args.tokenFrom)) {
                                return zapBridge.populateTransaction.swapAndRedeem(
                                    ...BridgeUtils.makeEasySubParams(castArgs, this.chainId, Tokens.NETH),
                                    tokenArgs.tokenIndexFrom,
                                    0,
                                    amountFrom,
                                    minToSwapOriginHighSlippage, // minToSwapOrigin, // minToSwapOriginHighSlippage,
                                    transactionDeadline,
                                )
                            } else {
                                return zapBridge.populateTransaction.swapETHAndRedeem(
                                    ...BridgeUtils.makeEasySubParams(castArgs, this.chainId, Tokens.NETH),
                                    tokenArgs.tokenIndexFrom,
                                    0,
                                    amountFrom,
                                    minToSwapOriginHighSlippage, // minToSwapOrigin, // minToSwapOriginHighSlippage,
                                    transactionDeadline,
                                    {value: amountFrom}
                                );
                            }
                        } else if (args.tokenFrom.isEqual(Tokens.NUSD)) {
                          return zapBridge.populateTransaction.redeemAndRemove(
                              ...BridgeUtils.makeEasySubParams(castArgs, this.chainId, Tokens.NUSD),
                              amountFrom,
                              tokenArgs.tokenIndexTo,
                              minToSwapDest,
                              transactionDeadline,
                          )
                        } else {
                            return zapBridge.populateTransaction.swapAndRedeemAndRemove(
                                ...BridgeUtils.makeEasySubParams(castArgs, this.chainId, Tokens.NUSD),
                                tokenArgs.tokenIndexFrom,
                                0,
                                amountFrom,
                                minToSwapOriginHighSlippage,
                                transactionDeadline,
                                tokenArgs.tokenIndexTo, //swapTokenIndex
                                minToSwapDestFromOriginHighSlippage, // swapMinAmount
                                bridgeTransactionDeadline, // toSwapDeadline, // swapDeadline
                            )
                        }
                    } else {
                        if (args.tokenFrom.isEqual(Tokens.NUSD)) {
                            return easyRedeemAndSwap(Tokens.NUSD)
                        } else if (args.tokenFrom.isEqual(Tokens.NETH)) {
                            return easyRedeemAndSwap(Tokens.NETH)
                        } else if (args.tokenFrom.swapType === SwapType.ETH) {
                            if (BridgeUtils.isETHLikeToken(args.tokenFrom)) {
                                return easySwapAndRedeemAndSwap(Tokens.NETH, false)
                            } else {
                                return zapBridge.populateTransaction.swapETHAndRedeemAndSwap(
                                    ...BridgeUtils.makeEasySubParams(castArgs, this.chainId, Tokens.NETH),
                                    tokenArgs.tokenIndexFrom,
                                    0,
                                    amountFrom,
                                    minToSwapOriginHighSlippage,
                                    transactionDeadline,
                                    0,
                                    tokenArgs.tokenIndexTo,
                                    minToSwapDestFromOriginHighSlippage,
                                    bridgeTransactionDeadline,
                                    {value: amountFrom}
                                )
                            }
                        } else {
                            return easySwapAndRedeemAndSwap(Tokens.NUSD, false)
                        }
                    }
            }
        }

        private makeBridgeTokenArgs(args: BridgeParams): BridgeTokenArgs {
            let {tokenFrom, tokenTo, chainIdTo} = args;

            const swapparoo = (t: Token, check: Token, swappy: Token): Token => t.isEqual(check) ? swappy : t

            switch (tokenFrom.swapType) {
                case SwapType.ETH:
                    tokenFrom = swapparoo(tokenFrom, Tokens.ETH, Tokens.WETH);
                    tokenTo   = swapparoo(tokenTo,   Tokens.ETH, Tokens.WETH);

                    break;
                case SwapType.AVAX:
                    tokenFrom = swapparoo(tokenFrom, Tokens.AVAX, Tokens.WAVAX);
                    tokenTo   = swapparoo(tokenTo,   Tokens.AVAX, Tokens.WAVAX);

                    break;
                case SwapType.MOVR:
                    tokenFrom = swapparoo(tokenFrom, Tokens.MOVR, Tokens.WMOVR);
                    tokenTo   = swapparoo(tokenTo,   Tokens.MOVR, Tokens.WMOVR);

                    break;
            }

            const chainTokens = (chainId: number, swapType: string): Token[] => {
                return SwapPools.bridgeSwappableTypePoolsByChain[chainId]?.[swapType]?.poolTokens
            };

            const findSymbol = (tokA: Token, tokB: Token): boolean => {
                let compareTok: Token = tokB;

                if (tokB.isEqual(Tokens.WETH_E)) {
                    compareTok = Tokens.AVWETH;
                } else if (tokB.isEqual(Tokens.ETH)) {
                    compareTok = Tokens.WETH;
                } else if (tokB.isWrappedToken) {
                    compareTok = tokB.underlyingToken;
                }

                return tokA.isEqual(compareTok);
            }

            const tokenIndex = (toks: Token[], tok: Token): number =>
                toks.findIndex((t: Token) => findSymbol(t, tok));

            const
                fromChainTokens = chainTokens(this.chainId, tokenFrom.swapType),
                toChainTokens   = chainTokens(chainIdTo, tokenTo.swapType),

                tokenIndexFrom = tokenIndex(fromChainTokens, tokenFrom),
                tokenIndexTo   = tokenIndex(toChainTokens, tokenTo);

            return {
                fromChainTokens,
                toChainTokens,
                tokenFrom,
                tokenTo,
                tokenIndexFrom,
                tokenIndexTo
            }
        }
    }

    const REQUIRED_CONFS = {
        [ChainId.ETH]: 7,
        [ChainId.OPTIMISM]: 1,
        [ChainId.BSC]: 14,
        [ChainId.POLYGON]: 128,
        [ChainId.FANTOM]: 5,
        [ChainId.BOBA]: 1,
        [ChainId.MOONRIVER]: 21,
        [ChainId.ARBITRUM]: 40,
        [ChainId.AVALANCHE]: 1,
        [ChainId.HARMONY]: 1,
    };

    export function getRequiredConfirmationsForBridge(network: Networks.Network | number): number {
        let chainId: number = network instanceof Networks.Network ? network.chainId : network;

        return REQUIRED_CONFS[chainId] ?? -1
    }

    interface EasyArgsCheck {
        isEasy: boolean,
        castArgs: BridgeUtils.BridgeTxParams,
        txn?: Promise<PopulatedTransaction>,
    }
}