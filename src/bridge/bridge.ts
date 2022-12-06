import {ChainId, type ChainIdTypeMap} from "@chainid";
import {Networks} from "@networks";

import {
    type Token,
    instanceOfToken
} from "@token";

import {Tokens}    from "@tokens";
import {TokenSwap} from "@tokenswap";

import {
    rejectPromise,
    executePopulatedTransaction,
    fixWeiValue
} from "@common/utils";

import {
    type GasOptions,
    populateGasOptions
} from "@common/gasoptions";

import {SynapseContracts} from "@synapsecontracts";

import type {
    SynapseBridgeContract,
    L1BridgeZapContract,
    L2BridgeZapContract,
    GenericZapBridgeContract
} from "@contracts";

import type {ID} from "@internal/types";
import {SwapType} from "@internal/swaptype";
import {rpcProviderForChain} from "@internal/rpcproviders";
import {tokenSwitch} from "@internal/utils";

import * as SynapseEntities from "@entities";

import {BridgeConfig}               from "./bridgeconfig";
import {GasUtils}                   from "./gasutils";
import {BridgeUtils}                from "./bridgeutils";
import {
    MAX_APPROVAL_AMOUNT,
    approve,
    balanceOf,
    allowanceOf,
    buildApproveTransaction
} from "./erc20";

import type {ApproveArgs} from "./erc20";

import {id as makeKappa} from "@ethersproject/hash";
import {Zero}            from "@ethersproject/constants";
import {formatUnits}     from "@ethersproject/units";
import {BigNumber}       from "@ethersproject/bignumber";

import type {BigNumberish} from "@ethersproject/bignumber";
import type {Signer}       from "@ethersproject/abstract-signer";
import type {Provider}     from "@ethersproject/providers";

import type {
    ContractTransaction,
    PopulatedTransaction,
} from "@ethersproject/contracts";

/**
 * Bridge provides a wrapper around common Synapse Bridge interactions, such as output estimation, checking supported swaps/bridges,
 * and most importantly, executing Bridge transactions.
 */
export namespace Bridge {
    import DFK_ETH = Tokens.DFK_ETH
    export type CanBridgeResult = {
        canBridge:     boolean;
        reasonUnable?: string;
        amount?:       BigNumber;
    }

    type NeedsTokenApproveResult = {
        needsApproval:     boolean;
        currentAllowance?: BigNumber;
    }

    export type BridgeOutputEstimate = {
        amountToReceive: BigNumber;
        bridgeFee:       BigNumber;
    }

    /**
     * @param {Token} tokenFrom {@link Token} user will send to the bridge on the source chain
     * @param {Token} tokenTo {@link Token} user will receive from the bridge on the destination chain
     * @param {number} chainIdTo Chain ID of the destination chain
     * @param {BigNumber} amountFrom not necessarily used by this interface, and overriden in BridgeParamsWithAmounts.
     */
    export interface BridgeParams {
        tokenFrom:   Token;
        tokenTo:     Token;
        chainIdTo:   number;
        amountFrom?: BigNumber;
    }

    /**
     * @param {BigNumber} amountFrom Amount of tokenFrom (denoted in wei) that the user will send to the bridge on the source chain.
     * @param {BigNumber} amountTo Amount of tokenTo (denoted in wei) that the user will receive from the bridge on the destination chain.
     * @param {string} addressTo Optional, user can provide an address other than the one retrieved from signer to receive tokens
     * on the destination chain.
     */
    export interface BridgeTransactionParams extends BridgeParams {
        amountFrom: BigNumber;
        amountTo:   BigNumber;
        addressTo?: string;
    }

    type EasyArgsCheck = {
        isEasy:   boolean;
        castArgs: BridgeUtils.BridgeTxParams;
        txn?:     Promise<PopulatedTransaction>;
    }

    type BridgeTokenArgs = {
        fromChainTokens: Token[];
        toChainTokens:   Token[];
        tokenFrom:       Token;
        tokenTo:         Token;
        tokenIndexFrom:  number;
        tokenIndexTo:    number;
    }

    interface CheckCanBridgeParams {
        address?: string;
        signer?:  Signer;
        token:    Token;
        amount:   BigNumberish;
    }

    interface CanBridgeParams extends CheckCanBridgeParams {
        address: string;
    }

    /**
     * SynapseBridge is a wrapper around any Synapse Bridge contract which exists on chains supported by the Synapse Protocol.
     */
    export class SynapseBridge {
        readonly chainId: number;
        protected network: Networks.Network;
        protected provider: Provider;

        private readonly bridgeAddress:    string;
        private readonly zapBridgeAddress: string;

        private readonly bridgeInstance: SynapseBridgeContract;
        private readonly zapBridge:      GenericZapBridgeContract;
        private readonly l1BridgeZapEth: L1BridgeZapContract = BridgeUtils.newL1BridgeZap(ChainId.ETH);
        private readonly bridgeConfig:   BridgeConfig = new BridgeConfig();

        private readonly isL2ETHChain: boolean;

        constructor(args: {
            network: Networks.Network | number,
            provider?: Provider
        }) {
            let {network, provider} = args;

            this.network = network instanceof Networks.Network ? network : Networks.fromChainId(network);
            this.chainId = this.network.chainId;
            this.provider = provider ?? rpcProviderForChain(this.chainId);

            this.isL2ETHChain = BridgeUtils.isL2ETHChain(this.chainId);

            const contractAddrs = SynapseContracts.contractsForChainId(this.chainId);

            this.bridgeAddress    = contractAddrs.bridgeAddress;
            this.zapBridgeAddress = contractAddrs.bridgeZapAddress;

            this.bridgeInstance = SynapseEntities.SynapseBridgeContractInstance(BridgeUtils.entityParams(this.chainId));

            if (this.zapBridgeAddress && this.zapBridgeAddress !== "") {
                this.zapBridge = BridgeUtils.newBridgeZap(this.chainId);
            }
        }

        private get l1BridgeZap(): L1BridgeZapContract {
            return this.zapBridge as L1BridgeZapContract
        }

        private get l2BridgeZap(): L2BridgeZapContract {
            return this.zapBridge as L2BridgeZapContract
        }

        bridgeVersion(): Promise<BigNumber> {
            return this.bridgeInstance.bridgeVersion()
        }

        WETH_ADDRESS(): Promise<string> {
            return this.bridgeInstance.WETH_ADDRESS()
        }

        kappaExists(kappa: string): Promise<boolean> {
            return this.bridgeInstance.kappaExists(kappa)
        }

        get requiredConfirmations(): number {
            return getRequiredConfirmationsForBridge(this.chainId)
        }

        /**
         * Returns whether a swap/bridge from this Bridge's chain to another chain between two tokens
         * is supported.
         * @param {Token} args.tokenFrom {@link Token} user will send to the bridge
         * @param {Token} args.tokenTo {@link Token} user will receive from the bridge on the destination chain
         * @param {number} args.chainIdTo Chain ID of the destination chain
         * @return boolean value denoting whether the input params constitute a valid swap/bridge, along with a
         * string value denoting the reason for an unsupported swap, if applicable.
         */
        swapSupported(args: {
            tokenFrom: Token,
            tokenTo:   Token
            chainIdTo: number,
        }): [boolean, string] {
            const {swapSupported, reasonNotSupported} = bridgeSwapSupported({...args, chainIdFrom: this.chainId});

            return [swapSupported, reasonNotSupported?.reason || ""]
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
            return this.checkSwapSupported(args)
                .then(() => this.calculateBridgeRate(args))
                .catch(rejectPromise)
        }

        /**
         * Returns a populated transaction for initiating a token bridge between this Bridge (the source chain) and the bridge contract on the destination chain.
         * Note that this function **does not** send a signed transaction.
         * @param {BridgeTransactionParams} args Parameters for the bridge transaction
         * @param {GasOptions} gasOptions Optional gas price/fee options for the populated transaction.
         * @return {Promise<PopulatedTransaction>} Populated transaction instance which can be sent via ones choice
         * of web3/ethers/etc.
         */
        async buildBridgeTokenTransaction(args: BridgeTransactionParams, gasOptions?: GasOptions): Promise<PopulatedTransaction> {
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

            let newTxn: Promise<PopulatedTransaction> = (this.chainId === ChainId.ETH)
                ? this.buildETHMainnetBridgeTxn(args, tokenArgs)
                : this.buildL2BridgeTxn(args, tokenArgs);

            return newTxn
                .then(txn =>
                    GasUtils.populateGasParams(this.chainId, txn, "bridge")
                        .then(txn => populateGasOptions(txn, gasOptions, this.chainId, true))
                )
        }

        /**
         * Starts the Bridge process between this Bridge (the source chain) and the bridge contract on the destination chain.
         * Note that this function **does** send a signed transaction.
         * @param {BridgeTransactionParams} args Parameters for the bridge transaction.
         * @param {Signer} signer Some instance which implements the Ethersjs {@link Signer} interface.
         * @param {boolean} callStatic (Optional, default: false) if true, uses provider.callStatic instead of actually sending the signed transaction.
         * @return {Promise<ContractTransaction>}
         */
        async executeBridgeTokenTransaction(
            args:       BridgeTransactionParams,
            signer:     Signer,
            callStatic: boolean=false
        ): Promise<ContractTransaction> {
            try {
                await this.checkSwapSupported(args);
            } catch (e) { /* c8 ignore start */
                return rejectPromise(e);
            } /* c8 ignore stop */

            const {tokenFrom, amountFrom, addressTo} = args;

            const signerAddress = await signer.getAddress()

            if (!addressTo) { /* c8 ignore start */
                args.addressTo = signerAddress;
            } /* c8 ignore stop */

            const checkArgs = {signer, token: tokenFrom, amount: amountFrom};

            return this.checkCanBridge(checkArgs)
                .then(canBridgeRes => {
                    const {canBridge, reasonUnable} = canBridgeRes;

                    if (!canBridge) {
                        return rejectPromise(reasonUnable)
                    }

                    return this.buildBridgeTokenTransaction(args)
                        .then(txn => executePopulatedTransaction(txn, signer))
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
         * @param {Token|string} args.token {@link Token} instance or valid on-chain address of the token the user will be sending
         * to the bridge on the source chain.
         * @param {BigNumberish} args.amount Optional, a specific amount of args.token to approve. By default, this function
         * builds an Approve call using an "infinite" approval amount.
         * @param {GasOptions} gasOptions Optional gas price/fee options for the populated transaction.
         * @return {Promise<PopulatedTransaction>} Populated transaction instance which can be sent via ones choice
         * of web3/ethers/etc.
         */
        async buildApproveTransaction(
            args: {token: Token | string, amount?: BigNumberish},
            gasOptions?: GasOptions
        ): Promise<PopulatedTransaction> {
            const [approveArgs, tokenAddress] = this.buildERC20ApproveArgs(args);

            return buildApproveTransaction(approveArgs, {tokenAddress, chainId: this.chainId})
                .then(txn => populateGasOptions(txn, gasOptions, this.chainId))
        }

        /**
         * Builds and executes an ERC20 Approve call,
         * approving some amount of a given token to be spent by the Synapse Bridge on its chain.
         * The returned PopulatedTransaction must then be passed to the user via Web3 or some other
         * framework so they can ultimately send the transaction.
         * Should ALWAYS be called before performing any bridge transactions to ensure they don't fail.
         * @param {Object} args
         * @param {Token|string} args.token {@link Token} instance or valid on-chain address of the token the user will be sending
         * to the bridge on the source chain.
         * @param {BigNumberish} args.amount Optional, a specific amount of args.token to approve. By default, this function
         * @param {Signer} signer Valid ethers Signer instance for building a fully and properly populated
         * transaction.
         */
        async executeApproveTransaction(
            args:       {token: Token | string, amount?: BigNumberish},
            signer:     Signer,
        ): Promise<ContractTransaction> {
            const
                [approveArgs, tokenAddress] = this.buildERC20ApproveArgs(args),
                tokenParams = {tokenAddress, chainId: this.chainId};

            return approve(approveArgs, tokenParams, signer)
        }

        async getAllowanceForAddress(args: {
            address: string,
            token:   Token,
        }): Promise<BigNumber> {
            let { address, token } = args;
            let tokenAddress = token.address(this.chainId);

            return allowanceOf(address, this.zapBridgeAddress, {tokenAddress, chainId: this.chainId})
        }

        private async resolveApproveFunc(
            approveRes:    NeedsTokenApproveResult,
            hasBalanceRes: Promise<CanBridgeResult>,
            token:         Token
        ): Promise<CanBridgeResult> {
            const {needsApproval, currentAllowance} = approveRes;

            let allowanceEth: string;
            if (currentAllowance) {
                allowanceEth = formatUnits(currentAllowance, token.decimals(this.chainId)).toString();
            }

            const errStr: string = `Spend allowance of Bridge too low for token ${token.symbol}; current allowance for Bridge is ${allowanceEth}`;

            if (!needsApproval) {
                return hasBalanceRes
            }

            return {canBridge: false, reasonUnable: errStr, amount: currentAllowance}
        }

        private async checkNeedsApprove({
                                            address,
                                            token,
                                            amount=MAX_APPROVAL_AMOUNT.sub(1)
                                        }: CheckCanBridgeParams): Promise<NeedsTokenApproveResult> {
            const [{spender}, tokenAddress] = this.buildERC20ApproveArgs({token, amount});

            return allowanceOf(address, spender, {tokenAddress, chainId: this.chainId})
                .then(currentAllowance => ({needsApproval: currentAllowance.lt(amount), currentAllowance}))
        }

        private async resolveBalanceFunc(
            prom:   Promise<BigNumber>,
            amount: BigNumberish,
            token:  Token
        ): Promise<CanBridgeResult> {
            return Promise.resolve(prom)
                .then(balance => {
                    const
                        hasBalance         = balance.gte(amount),
                        balanceEth: string = formatUnits(balance, token.decimals(this.chainId)).toString();

                    return (
                        hasBalance
                            ? {canBridge: true}
                            : {canBridge: false, reasonUnable: `Balance of token ${token.symbol} is too low; current balance is ${balanceEth}`, amount: balance}
                    ) as CanBridgeResult
                })
                .catch(rejectPromise)
        }

        private async checkGasTokenBalance(args: CanBridgeParams): Promise<CanBridgeResult> {
            const {address, token, amount} = args;

            const balanceProm: Promise<BigNumber> = this.provider.getBalance(address);

            return this.resolveBalanceFunc(
                balanceProm,
                amount,
                token
            )
        }

        async checkCanBridge(args: CheckCanBridgeParams): Promise<CanBridgeResult> {
            const {token, signer, address} = args;

            let signerAddress: string;


            if (address && address !== "") { /* c8 ignore start */
                signerAddress = address;
            } else {
                signerAddress = await signer.getAddress();
            } /* c8 ignore stop */

            const checkArgs: CanBridgeParams = {...args, address: signerAddress};

            const isGasTokenTransfer: boolean =
                (this.network.chainCurrency === token.symbol) && BridgeUtils.chainSupportsGasToken(this.chainId);

            let hasBalanceRes: Promise<CanBridgeResult> = isGasTokenTransfer
                ? this.checkGasTokenBalance(checkArgs)
                : this.checkERC20Balance(checkArgs);

            return isGasTokenTransfer
                ? hasBalanceRes
                : this.checkNeedsApprove(checkArgs)
                    .then(approveRes => this.resolveApproveFunc(approveRes, hasBalanceRes, token))
                    .catch(rejectPromise)
        }

        private async checkERC20Balance(args: CanBridgeParams): Promise<CanBridgeResult> {
            const
                {address, amount, token} = args,
                tokenAddress: string = token.address(this.chainId);

            return this.resolveBalanceFunc(
                balanceOf(address, {tokenAddress, chainId: this.chainId}),
                amount,
                token
            )
        }

        buildERC20ApproveArgs(args: {
            token:   Token | string,
            amount?: BigNumberish
        }): [ApproveArgs, string] {
            const {token, amount} = args;
            let spender: string = this.zapBridgeAddress;

            if (instanceOfToken(token) && token.isEqual(Tokens.MULTIJEWEL)) {
                spender = SynapseEntities.AvaxJewelMigrationAddress;
            }

            /* c8 ignore start */
            let tokenAddr: string = instanceOfToken(token)
                ? token.address(this.chainId)
                : token as string;
            /* c8 ignore stop */

            return [{
                spender,
                amount
            }, tokenAddr]
        }

        private async checkSwapSupported(args: BridgeParams): Promise<boolean> {
            return new Promise<boolean>((resolve, reject) => {
                let [swapSupported, errReason] = this.swapSupported(args);
                if (!swapSupported) {
                    reject(errReason);
                    return
                }

                resolve(true);
            })
        }

        private async calculateBridgeRate(args: BridgeParams): Promise<BridgeOutputEstimate> {
            let {chainIdTo, amountFrom} = args;

            const l2BridgeZapTo = BridgeUtils.newL2BridgeZap(chainIdTo);

            const {
                tokenFrom, tokenTo,
                tokenIndexFrom, tokenIndexTo,
                fromChainTokens
            } = this.makeBridgeTokenArgs(args);

            let {intermediateToken} = TokenSwap.intermediateTokens(chainIdTo, tokenFrom, this.chainId);

            const {
                bridgeFee:  bridgeFeeRequest,
                amountFrom: amountFromFixedDecimals
            } = this.bridgeConfig.calculateSwapFee({
                chainIdFrom: this.chainId,
                tokenFrom,
                chainIdTo,
                amountFrom
            });

            const checkEthBridge = (c1: number, c2: number, t: Token): boolean =>
                c1 === ChainId.ETH && (BridgeUtils.isL2ETHChain(c2) || c2 === ChainId.DFK) && t.swapType === SwapType.ETH

            const
                isSpecialFrom: boolean = BridgeUtils.isSpecialToken(this.chainId, tokenFrom),
                isSpecialTo:   boolean = BridgeUtils.isSpecialToken(chainIdTo,    tokenTo);

            const
                ethToEth:   boolean = checkEthBridge(this.chainId, chainIdTo,    tokenTo),
                ethFromEth: boolean = checkEthBridge(chainIdTo,    this.chainId, tokenFrom);

            let amountToReceive_from_prom: Promise<BigNumber>;

            if (amountFrom.isZero()) {
                amountToReceive_from_prom = Promise.resolve(Zero);
            } else if (ethToEth || Tokens.isMintBurnToken(tokenFrom) || tokenFrom.isWrapperToken || isSpecialFrom || this.chainId === ChainId.KLAYTN) {
                amountToReceive_from_prom = Promise.resolve(amountFromFixedDecimals);
            } else if (this.chainId === ChainId.ETH) {
                let liquidityAmounts = fromChainTokens.map((t) =>
                    tokenFrom.isEqual(t) ? amountFrom : Zero
                );

                amountToReceive_from_prom = this.l1BridgeZapEth.calculateTokenAmount(
                    liquidityAmounts,
                    true
                );
            } else {
                amountToReceive_from_prom = this.l2BridgeZap.calculateSwap(
                    intermediateToken.address(this.chainId),
                    tokenIndexFrom,
                    0,
                    amountFrom
                );
            }

            let amountToReceive_from = await amountToReceive_from_prom;
            let bridgeFee: BigNumber;

            try { /* c8 ignore start */
                bridgeFee = await bridgeFeeRequest;
                if (bridgeFee === null) {
                    console.error("calculateSwapFee returned null");
                    return rejectPromise("calculateSwapFee returned null")
                }
            } catch (e) {
                console.error(`Error in bridge fee request: ${e}`);
                return rejectPromise(e)
            } /* c8 ignore stop */

            amountToReceive_from = BridgeUtils.subBigNumSafe(amountToReceive_from, bridgeFee);

            let amountToReceive_to_prom: Promise<BigNumber>;

            if (amountToReceive_from.isZero()) {
                amountToReceive_to_prom = Promise.resolve(Zero);
            } else if (ethFromEth || Tokens.isMintBurnToken(tokenTo) || tokenTo.isWrapperToken || isSpecialTo) {
                amountToReceive_to_prom = Promise.resolve(amountToReceive_from);
            } else if (chainIdTo === ChainId.ETH) {
                amountToReceive_to_prom =
                    this.l1BridgeZapEth.calculateRemoveLiquidityOneToken(
                        amountToReceive_from,
                        tokenIndexTo
                    );
            } else if (chainIdTo === ChainId.KLAYTN && tokenTo.swapType !== SwapType.ETH) {
                amountToReceive_to_prom = Promise.resolve(amountToReceive_from);
            } else {
                if (chainIdTo === ChainId.CRONOS) {
                    const swapContract = await TokenSwap.swapContract(intermediateToken, chainIdTo);
                    amountToReceive_to_prom = swapContract.calculateSwap(0, tokenIndexTo, amountToReceive_from)
                } else {
                    amountToReceive_to_prom = l2BridgeZapTo.calculateSwap(
                        intermediateToken.address(chainIdTo),
                        0,
                        tokenIndexTo,
                        amountToReceive_from
                    );
                }
            }

            let amountToReceive: BigNumber;
            try { /* c8 ignore start */
                amountToReceive = await Promise.resolve(amountToReceive_to_prom)
                let decimalAdjustment = BigNumber.from(10).pow(18 - tokenTo.decimals(chainIdTo))
                amountToReceive = amountToReceive.div(decimalAdjustment)
            } catch (err) {
                return rejectPromise(err)
            } /* c8 ignore stop */

            return {amountToReceive, bridgeFee}
        }

        private checkEasyArgs(
            args:      BridgeTransactionParams,
            zapBridge: GenericZapBridgeContract,
            easyDeposits:    ID[],
            easyRedeems:     ID[],
            easyDepositETH?: ID[],
        ): EasyArgsCheck {
            let
                castArgs = args as BridgeUtils.BridgeTxParams,
                isEasy: boolean = false,
                txn:    Promise<PopulatedTransaction>;

            const params = BridgeUtils.makeEasyParams(castArgs, this.chainId, args.tokenTo);

            switch (true) {
                case easyRedeems.includes(args.tokenTo.id):
                    isEasy = true;
                    txn    = zapBridge.populateTransaction.redeem(...params);
                    break;
                case easyDeposits.includes(args.tokenTo.id):
                    isEasy = true;
                    txn    = zapBridge.populateTransaction.deposit(...params);
                    break;
                case easyDepositETH.includes(args.tokenTo.id):
                    isEasy = true;
                    txn    =  zapBridge
                        .populateTransaction
                        .depositETH(
                            ...BridgeUtils.depositETHParams(castArgs),
                            BridgeUtils.overrides(args.amountFrom)
                        );
                    break;
            }

            return {castArgs, isEasy, txn}
        }

        private buildETHMainnetBridgeTxn(
            args:      BridgeTransactionParams,
            tokenArgs: BridgeTokenArgs
        ): Promise<PopulatedTransaction> {
            const {addressTo, chainIdTo, amountFrom, amountTo} = args;

            let
                easyRedeems:    ID[] = [
                    Tokens.SYN.id,  Tokens.UST.id,  Tokens.USDB.id,
                    Tokens.VSTA.id,
                ],

                // Deposits are for tokens that can just be deposited on source chains, mostly likely Ethereum
                easyDeposits:   ID[] = [
                    Tokens.HIGH.id, Tokens.DOG.id,  Tokens.FRAX.id,
                    Tokens.GOHM.id, Tokens.NEWO.id, Tokens.SDT.id,
                    Tokens.H20.id,  Tokens.SFI.id
                ],
                easyDepositETH: ID[] = [Tokens.NETH.id, Tokens.DFK_ETH.id];

            // use L1BridgeZap deposit() and `depositETH`
            if (chainIdTo === ChainId.KLAYTN) {
                easyDeposits.push(...[
                    Tokens.USDC.id,
                    Tokens.USDT.id,
                    Tokens.DAI.id,
                    Tokens.WBTC.id
                ])
            }

            let {castArgs, isEasy, txn} = this.checkEasyArgs(args, this.l1BridgeZapEth, easyDeposits, easyRedeems, easyDepositETH);
            if (isEasy && txn) {
                return txn
            }

            const liquidityAmounts = tokenArgs.fromChainTokens.map(t =>
                args.tokenFrom.isEqual(t)
                    ? amountFrom
                    : Zero
            );

            const {
                transactionDeadline,
                bridgeTransactionDeadline,
                minToSwapDestFromOrigin,
                minToSwapDest,
                minToSwapOriginMediumSlippage,
                minToSwapDestFromOriginMediumSlippage,
            } = BridgeUtils.getSlippages(amountFrom, amountTo);

            if (args.tokenTo.isEqual(Tokens.NUSD) || args.tokenTo.isEqual(Tokens.DFK_USDC)) {
                if (args.tokenFrom.isEqual(Tokens.NUSD) || args.tokenFrom.isEqual(Tokens.DFK_USDC)) {
                    const bridgeDepositArgs = BridgeUtils.makeEasyParams(
                        args as BridgeUtils.BridgeTxParams,
                        this.chainId,
                        Tokens.NUSD
                    );

                    return this.l1BridgeZapEth
                        .populateTransaction
                        .deposit(...bridgeDepositArgs)
                } else {
                    return this.l1BridgeZapEth.populateTransaction.zapAndDeposit(
                        addressTo,
                        chainIdTo,
                        Tokens.NUSD.address(this.chainId),
                        liquidityAmounts,
                        minToSwapDest,
                        transactionDeadline,
                    )
                }
            }

            if (BridgeUtils.isETHLikeToken(args.tokenTo) || args.tokenTo.isEqual(Tokens.WETH)) {
                return this.l1BridgeZapEth.populateTransaction.depositETHAndSwap(
                    ...BridgeUtils.depositETHParams(castArgs),
                    0, // nusd tokenindex,
                    tokenArgs.tokenIndexTo,
                    minToSwapDestFromOrigin, // minDy
                    bridgeTransactionDeadline,
                    BridgeUtils.overrides(amountFrom)
                )
            } else if (args.tokenFrom.isEqual(Tokens.NUSD)) {
                return this.l1BridgeZapEth.populateTransaction.depositAndSwap(
                    addressTo,
                    chainIdTo,
                    Tokens.NUSD.address(this.chainId),
                    amountFrom,
                    0,
                    tokenArgs.tokenIndexTo,
                    minToSwapDestFromOriginMediumSlippage,
                    bridgeTransactionDeadline
                )
            }

            return this.l1BridgeZapEth.populateTransaction.zapAndDepositAndSwap(
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

        private buildL2BridgeTxn(
            args: BridgeTransactionParams,
            tokenArgs: BridgeTokenArgs
        ): Promise<PopulatedTransaction> {
            let
                {chainIdTo, amountFrom, amountTo} = args,
                // NOTE: This is a problem - we don't support other L1s. Klaytn still uses L2BridgeZap However
                zapBridge = SynapseEntities.L2BridgeZapContractInstance({
                    chainId:          this.chainId,
                    signerOrProvider: this.provider
                });

            tokenArgs.tokenFrom = tokenArgs.tokenFrom.isEqual(Tokens.AVWETH)
                ? Tokens.WETH_E
                : tokenArgs.tokenFrom;

            if (tokenArgs.tokenFrom.isEqual(Tokens.MULTIJEWEL)) {
                const jewelMigrator = SynapseEntities.AvaxJewelMigrationContractInstance();

                return jewelMigrator
                    .populateTransaction
                    .migrateAndBridge(
                        args.amountFrom,
                        args.addressTo,
                        args.chainIdTo
                    )
            }

            let
                easyDeposits:   ID[] = [],
                easyDepositETH: ID[] = [],

                // Redeems are for tokens that can just be burnt on non-source chains
                easyRedeems:    ID[] = [
                    Tokens.SYN.id,      Tokens.HIGH.id,    Tokens.DOG.id,
                    Tokens.FRAX.id,     Tokens.UST.id,     Tokens.GOHM.id,
                    Tokens.NEWO.id,     Tokens.SDT.id,     Tokens.LUNA.id,
                    Tokens.USDB.id,     Tokens.H20.id,     Tokens.SFI.id
                ];

            // use `L2BridgeZap.redeem()`
            if (this.chainId === ChainId.KLAYTN) {
                easyRedeems.push(...[
                    Tokens.USDC.id,
                    Tokens.USDT.id,
                    Tokens.DAI.id,
                    Tokens.WBTC.id
                ])
                if (chainIdTo === ChainId.ETH) {
                    easyRedeems.push(Tokens.WETH.id)
                }

                easyDepositETH.push(Tokens.WKLAY.id)
            }

            if (this.chainId === ChainId.POLYGON) {
                easyDepositETH.push(Tokens.WMATIC.id)
            }

            if (this.chainId === ChainId.FANTOM) {
                easyDepositETH.push(Tokens.WFTM.id)
            }

            BridgeUtils.DepositIfChainTokens.forEach((depositIfChainArgs) => {
                if (this.chainId === ChainId.DFK && args.tokenTo.isEqual(Tokens.SYN_AVAX)) {
                    return
                }

                let {chainId, tokens, depositEth, redeemChainIds} = depositIfChainArgs;

                let
                    hasAltChains = redeemChainIds.length > 0,
                    tokenHashes  = tokens.map((t) => t.id);

                if (this.chainId === chainId) {
                    if (depositEth) {
                        easyDepositETH.push(...tokenHashes);
                    } else {
                        easyDeposits.push(...tokenHashes);
                    }
                } else {
                    if (hasAltChains && redeemChainIds.includes(this.chainId)) {
                        easyRedeems.push(...tokenHashes);
                    }
                }
            });

            const
                dfkBridgeZap = BridgeUtils.newL1BridgeZap(ChainId.DFK),
                checkEasyZap = this.chainId === ChainId.DFK ? dfkBridgeZap : this.zapBridge;

            let {castArgs, isEasy, txn} = this.checkEasyArgs(args, checkEasyZap, easyDeposits, easyRedeems, easyDepositETH);
            if (isEasy && txn) {
                return txn
            }

            const {
                transactionDeadline,
                bridgeTransactionDeadline,
                minToSwapDestFromOrigin,
                minToSwapOriginHighSlippage,
                minToSwapDestFromOriginMediumSlippage,
                minToSwapDestFromOriginHighSlippage,
                minToSwapDest,
            } = BridgeUtils.getSlippages(amountFrom, amountTo);

            const easyRedeemAndSwap = (baseToken: Token): Promise<PopulatedTransaction> =>
                zapBridge
                    .populateTransaction
                    .redeemAndSwap(
                        ...BridgeUtils.makeEasyParams(castArgs, this.chainId, baseToken),
                        0,
                        tokenArgs.tokenIndexTo,
                        minToSwapDest,
                        transactionDeadline,
                    )

            const easySwapAndRedeem = (baseToken: Token, swapETH: boolean = false): Promise<PopulatedTransaction> => {
                let populateFn = swapETH
                    ? zapBridge.populateTransaction.swapETHAndRedeem
                    : zapBridge.populateTransaction.swapAndRedeem

                return populateFn(
                    ...BridgeUtils.makeEasySubParams(castArgs, this.chainId, baseToken),
                    tokenArgs.tokenIndexFrom,
                    0,
                    amountFrom,
                    minToSwapOriginHighSlippage, // minToSwapOrigin, // minToSwapOriginHighSlippage,
                    transactionDeadline,
                    swapETH ? BridgeUtils.overrides(amountFrom) : {}
                )
            }

            const easySwapAndRedeemAndSwap = (baseToken: Token, swapETH: boolean = false): Promise<PopulatedTransaction> => {
                let populateFn = swapETH
                    ? zapBridge.populateTransaction.swapETHAndRedeemAndSwap
                    : zapBridge.populateTransaction.swapAndRedeemAndSwap

                return populateFn(
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
                    swapETH ? BridgeUtils.overrides(amountFrom) : {}
                )
            }

            switch (tokenSwitch(args.tokenTo)) {
                case Tokens.NUSD:
                case Tokens.DFK_USDC:
                    if (args.tokenFrom.isEqual(Tokens.NUSD) || args.tokenFrom.isEqual(Tokens.DFK_USDC)) {
                        return zapBridge
                            .populateTransaction
                            .redeem(...BridgeUtils.makeEasyParams(castArgs, this.chainId, Tokens.NUSD))
                    }

                    return zapBridge
                        .populateTransaction
                        .swapAndRedeem(
                            ...BridgeUtils.makeEasySubParams(castArgs, this.chainId, Tokens.NUSD),
                            tokenArgs.tokenIndexFrom,
                            0,
                            amountFrom,
                            minToSwapOriginHighSlippage,
                            transactionDeadline
                        )
                case Tokens.GMX:
                    let params = BridgeUtils.makeEasyParams(castArgs, this.chainId, Tokens.GMX);
                    let [addrTo, chainTo,,amount] = params;

                    // GMX origin chain is Arbitrum, hence deposit there
                    return this.chainId === ChainId.ARBITRUM
                        ? zapBridge.populateTransaction.deposit(...params)
                        : this.bridgeInstance
                            .populateTransaction
                            .redeem(
                                addrTo,
                                chainTo,
                                Tokens.GMX.wrapperAddress(this.chainId),
                                amount
                            )
                case Tokens.JEWEL:
                    if (this.chainId === ChainId.HARMONY) {
                        return zapBridge
                            .populateTransaction
                            .swapAndRedeem(
                                ...BridgeUtils.makeEasySubParams(castArgs, this.chainId, Tokens.SYN_JEWEL),
                                0,
                                1,
                                amountFrom,
                                minToSwapOriginHighSlippage, // minToSwapOrigin, // minToSwapOriginHighSlippage,
                                transactionDeadline
                            )
                    } else if (this.chainId === ChainId.DFK) {
                        if (args.chainIdTo === ChainId.HARMONY) {
                            return dfkBridgeZap.populateTransaction.depositETHAndSwap(
                                args.addressTo,
                                args.chainIdTo,
                                args.amountFrom,
                                1,
                                0,
                                minToSwapDestFromOriginMediumSlippage,
                                bridgeTransactionDeadline,
                                BridgeUtils.overrides(args.amountFrom)
                            )
                        }

                        return dfkBridgeZap.populateTransaction.depositETH(
                            args.addressTo,
                            args.chainIdTo,
                            args.amountFrom,
                            BridgeUtils.overrides(args.amountFrom)
                        )
                    }

                    if (chainIdTo === ChainId.DFK) {
                        return zapBridge.populateTransaction.redeem(
                            args.addressTo,
                            ChainId.DFK,
                            Tokens.JEWEL.address(this.chainId),
                            args.amountFrom
                        )
                    }

                    return zapBridge.populateTransaction.redeemAndSwap(
                        args.addressTo,
                        args.chainIdTo,
                        Tokens.JEWEL.address(this.chainId),
                        args.amountFrom,
                        1,
                        0,
                        minToSwapDest,
                        transactionDeadline
                    )
                case Tokens.SYN_JEWEL:
                    if (this.chainId === ChainId.DFK) {
                        return dfkBridgeZap
                            .populateTransaction
                            .depositETH(
                                args.addressTo,
                                args.chainIdTo,
                                args.amountFrom,
                                BridgeUtils.overrides(args.amountFrom)
                            )
                    }

                    return zapBridge
                        .populateTransaction
                        .swapAndRedeem(
                            ...BridgeUtils.makeEasySubParams(castArgs, this.chainId, Tokens.JEWEL),
                            0,
                            1,
                            amountFrom,
                            minToSwapOriginHighSlippage, // minToSwapOrigin, // minToSwapOriginHighSlippage,
                            transactionDeadline
                        )
                case Tokens.SYN_AVAX:
                    if (this.chainId === ChainId.DFK) {
                        return dfkBridgeZap
                            .populateTransaction
                            .redeem(...BridgeUtils.makeEasyParams(castArgs, this.chainId, Tokens.WAVAX))
                    }

                    /* c8 ignore next */
                    break;
                case Tokens.MULTI_AVAX:
                    switch (this.chainId) {
                        case ChainId.DFK:
                            return dfkBridgeZap
                                .populateTransaction
                                .redeemAndSwap(
                                    castArgs.addressTo,
                                    castArgs.chainIdTo,
                                    Tokens.WAVAX.address(this.chainId),
                                    castArgs.amountFrom,
                                    0,
                                    tokenArgs.tokenIndexTo,
                                    minToSwapDest,
                                    transactionDeadline
                                )
                        case ChainId.MOONBEAM:
                            return this.l2BridgeZap
                                .populateTransaction
                                .redeemAndSwap(
                                    castArgs.addressTo,
                                    castArgs.chainIdTo,
                                    Tokens.WAVAX.address(this.chainId),
                                    castArgs.amountFrom,
                                    0,
                                    tokenArgs.tokenIndexTo,
                                    minToSwapDest,
                                    transactionDeadline
                                )
                        default:
                            return this.l2BridgeZap
                                .populateTransaction
                                .depositETHAndSwap(
                                    castArgs.addressTo, // to address
                                    castArgs.chainIdTo, // to chainId
                                    castArgs.amountFrom,
                                    0, // tokenIndexFrom for nusd
                                    tokenArgs.tokenIndexTo, // tokenIndexTo + 1,
                                    minToSwapDestFromOrigin, // minDy
                                    bridgeTransactionDeadline,
                                    BridgeUtils.overrides(castArgs.amountFrom)
                                )
                    }
                default:
                    if (chainIdTo === ChainId.ETH) {
                        if ((this.isL2ETHChain || this.chainId === ChainId.DFK) && args.tokenFrom.swapType === SwapType.ETH) {
                            if (args.tokenFrom.isEqual(Tokens.NETH) || args.tokenFrom.isEqual(Tokens.DFK_ETH)) {
                                let ethToken = (this.chainId === ChainId.DFK) ? Tokens.DFK_ETH : Tokens.NETH
                                return zapBridge
                                    .populateTransaction
                                    .redeem(...BridgeUtils.makeEasyParams(castArgs, this.chainId, ethToken))
                            } else {
                                let useSwapETH = !BridgeUtils.isETHLikeToken(args.tokenFrom);
                                return easySwapAndRedeem(Tokens.NETH, useSwapETH)
                            }
                        } else if (args.tokenFrom.isEqual(Tokens.NUSD) || args.tokenFrom.isEqual(Tokens.DFK_USDC)) {
                            return zapBridge
                                .populateTransaction
                                .redeemAndRemove(
                                    ...BridgeUtils.makeEasySubParams(castArgs, this.chainId, Tokens.NUSD),
                                    amountFrom,
                                    tokenArgs.tokenIndexTo,
                                    minToSwapDest,
                                    transactionDeadline
                                )
                        }

                        return zapBridge
                            .populateTransaction
                            .swapAndRedeemAndRemove(
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

                    if (this.chainId === ChainId.HARMONY) {
                        if (args.tokenFrom.isEqual(Tokens.SYN_AVAX)) {
                            const redeemArgs = BridgeUtils.makeEasyParams(castArgs, this.chainId, Tokens.SYN_AVAX);

                            return zapBridge
                                .populateTransaction
                                .redeem(...redeemArgs)
                        } else if (args.tokenFrom.isEqual(Tokens.MULTI_AVAX)) {
                            return zapBridge
                                .populateTransaction
                                .swapAndRedeem(
                                    castArgs.addressTo,
                                    castArgs.chainIdTo,
                                    Tokens.SYN_AVAX.address(this.chainId),
                                    tokenArgs.tokenIndexFrom,
                                    0,
                                    castArgs.amountFrom,
                                    minToSwapOriginHighSlippage,
                                    transactionDeadline
                                )
                        }
                    }

                    if ((this.chainId === ChainId.DFK || chainIdTo === ChainId.DFK) && args.tokenFrom.swapType === SwapType.ETH) {
                        if (this.isL2ETHChain) {
                            if (args.tokenFrom.isEqual(Tokens.NETH)) {
                                // Swapping nETH from L2 -> nETH on DFK
                                return zapBridge.populateTransaction.redeem(
                                    ...BridgeUtils.makeEasyParams(castArgs, this.chainId, Tokens.NETH)
                                );
                            } else {
                                // Swapping WETH from L2 -> nETH on DFK
                                let ethToken = Tokens.WETH
                                let swapEth = true

                                // WETH_E and FTM_ETH are ERC20s, not the gas token
                                if (this.chainId === ChainId.AVALANCHE || this.chainId === ChainId.FANTOM) {
                                    ethToken = Tokens.NETH
                                    swapEth = false
                                }

                                return easySwapAndRedeem(ethToken, swapEth)
                            }
                        } else {
                            // Note: NETH is passed as tokenTo args as DFK_USDC is NETH underneath
                            if (args.tokenTo.isEqual(Tokens.NETH)) {
                                // DFK_ETH from DFK -> NETH on L2s
                                return zapBridge.populateTransaction.redeem(
                                    ...BridgeUtils.makeEasyParams(castArgs, this.chainId, Tokens.DFK_ETH)
                                );
                            } else {
                                // DFK_ETH from DFK -> WETH on L2s
                                return easyRedeemAndSwap(Tokens.DFK_ETH)
                            }
                        }
                    }

                    // Bridging ETH from Klaytn to L2s
                    if (this.chainId === ChainId.KLAYTN &&
                        args.tokenFrom.swapType === SwapType.ETH) {
                        return easyRedeemAndSwap(args.tokenFrom)
                    }

                    // Bridging ETH From L2s
                    if (chainIdTo === ChainId.KLAYTN &&
                        this.isL2ETHChain &&
                        args.tokenFrom.swapType === SwapType.ETH
                    ) {
                        // To bridge ETH from chains where it IS the gas token, use swapETHAndRedeem
                        // This is because ETH is wrapped into WETH, swapped for nETH and then burnt
                        return easySwapAndRedeem(args.tokenFrom, true)
                    }

                    if (args.tokenFrom.isEqual(Tokens.NUSD) || args.tokenFrom.isEqual(Tokens.DFK_USDC) || args.tokenFrom.isEqual(Tokens.NETH)) {
                        return easyRedeemAndSwap(args.tokenFrom)
                    }

                    if (args.tokenFrom.swapType === SwapType.ETH) {
                        let useSwapETH = !BridgeUtils.isETHLikeToken(args.tokenFrom);
                        return easySwapAndRedeemAndSwap(Tokens.NETH, useSwapETH)
                    }

                    return easySwapAndRedeemAndSwap(Tokens.NUSD)
            }
        }

        private makeBridgeTokenArgs(args: BridgeParams): BridgeTokenArgs {
            let {tokenFrom, tokenTo, chainIdTo} = args;

            let bridgeTokens: (t1: Token, t2: Token) => [Token, Token];

            switch (tokenFrom.swapType) {
                case SwapType.ETH:
                    bridgeTokens = BridgeUtils.checkReplaceTokens(Tokens.ETH, Tokens.WETH);
                    break;
                case SwapType.AVAX:
                    bridgeTokens = BridgeUtils.checkReplaceTokens(Tokens.AVAX, Tokens.WAVAX);
                    break;
                case SwapType.MOVR:
                    bridgeTokens = BridgeUtils.checkReplaceTokens(Tokens.MOVR, Tokens.WMOVR);
                    break;
                case SwapType.KLAY:
                    bridgeTokens = BridgeUtils.checkReplaceTokens(Tokens.KLAY, Tokens.WKLAY);
                    break;
                case SwapType.MATIC:
                    bridgeTokens = BridgeUtils.checkReplaceTokens(Tokens.MATIC, Tokens.WMATIC);
                    break;
                case SwapType.FTM:
                    bridgeTokens = BridgeUtils.checkReplaceTokens(Tokens.FTM, Tokens.WFTM);
                    break;
                case SwapType.JEWEL:
                    bridgeTokens = BridgeUtils.checkReplaceTokens(Tokens.GAS_JEWEL, Tokens.JEWEL);
                    break;
                default:
                    bridgeTokens = (t1: Token, t2: Token) => [t1, t2];
            }

            [tokenFrom, tokenTo] = bridgeTokens(tokenFrom, tokenTo);

            const
                [fromChainTokens, tokenIndexFrom] = BridgeUtils.makeTokenArgs(this.chainId, tokenFrom),
                [toChainTokens,   tokenIndexTo]   = BridgeUtils.makeTokenArgs(chainIdTo,    tokenTo);

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

    const REQUIRED_CONFS: ChainIdTypeMap<number> = {
        [ChainId.ETH]:       7,
        [ChainId.OPTIMISM]:  1,
        [ChainId.CRONOS]:    6,
        [ChainId.BSC]:       14,
        [ChainId.POLYGON]:   128,
        [ChainId.FANTOM]:    5,
        [ChainId.BOBA]:      1,
        [ChainId.METIS]:     6,
        [ChainId.MOONBEAM]:  21,
        [ChainId.MOONRIVER]: 21,
        [ChainId.ARBITRUM]:  40,
        [ChainId.AVALANCHE]: 5,
        [ChainId.DFK]:       1,
        [ChainId.HARMONY]:   1,
        [ChainId.AURORA]:    5,
    };

    export function getRequiredConfirmationsForBridge(network: Networks.Network | number): number | null {
        let chainId: number = network instanceof Networks.Network ? network.chainId : network;

        if (chainId in REQUIRED_CONFS) {
            return REQUIRED_CONFS[chainId]
        }

        return null
    }

    export function bridgeSwapSupported(args: TokenSwap.BridgeSwapSupportedParams): TokenSwap.SwapSupportedResult {
        return TokenSwap.bridgeSwapSupported(args)
    }

    export interface BridgeTransactionCompleteParams {
        chainIdTo:                number;
        transactionHashChainFrom: string;
    }

    export function checkBridgeTransactionComplete(args: BridgeTransactionCompleteParams): Promise<boolean> {
        const
            {chainIdTo, transactionHashChainFrom} = args,
            kappa = makeKappa(transactionHashChainFrom),
            bridgeInstance = new SynapseBridge({network: chainIdTo});

        return bridgeInstance.kappaExists(kappa)
            .then(res => res)
            .catch(rejectPromise)
    }
}

import SynapseBridge = Bridge.SynapseBridge;
import getRequiredConfirmationsForBridge = Bridge.getRequiredConfirmationsForBridge;
import bridgeSwapSupported = Bridge.bridgeSwapSupported;
import checkBridgeTransactionComplete = Bridge.checkBridgeTransactionComplete;

export {
    SynapseBridge,
    getRequiredConfirmationsForBridge,
    bridgeSwapSupported,
    checkBridgeTransactionComplete
};

import CanBridgeResult = Bridge.CanBridgeResult;
import BridgeOutputEstimate = Bridge.BridgeOutputEstimate;
import BridgeParams = Bridge.BridgeParams;
import BridgeTransactionParams = Bridge.BridgeTransactionParams;

export type {
    CanBridgeResult,
    BridgeOutputEstimate,
    BridgeParams,
    BridgeTransactionParams
};