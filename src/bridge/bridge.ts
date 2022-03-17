import {ChainId}  from "@chainid";
import {Networks} from "@networks";

import {
    rejectPromise,
    executePopulatedTransaction
} from "@common/utils";

import {SynapseContracts} from "@common/synapse_contracts";

import * as SynapseEntities from "@entities";

import {
    type ID,
    SwapType,
    rpcProviderForChain,
    tokenSwitch
} from "@internal/index";

import type {
    GenericZapBridgeContract,
    L1BridgeZapContract,
    SynapseBridgeContract,
    BridgeConfigV3Contract
} from "@contracts";

import {Tokens}    from "@tokens";
import {TokenSwap} from "@tokenswap";

import {
    type Token,
    instanceOfToken
} from "@token";

import type {ChainIdTypeMap} from "@common/types";

import {GasUtils}                   from "./gasutils";
import {BridgeUtils}                from "./bridgeutils";
import {ERC20, MAX_APPROVAL_AMOUNT} from "./erc20";

import {Zero}                    from "@ethersproject/constants";
import {formatUnits}             from "@ethersproject/units";
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";

import type {Signer}   from "@ethersproject/abstract-signer";
import type {Provider} from "@ethersproject/providers";

import type {
    ContractTransaction,
    PopulatedTransaction,
} from "@ethersproject/contracts";

/**
 * Bridge provides a wrapper around common Synapse Bridge interactions, such as output estimation, checking supported swaps/bridges,
 * and most importantly, executing Bridge transactions.
 */
export namespace Bridge {
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
        amountToReceive: BigNumber,
        bridgeFee:       BigNumber,
    }

    /**
     * @param {Token} tokenFrom {@link Token} user will send to the bridge on the source chain
     * @param {Token} tokenTo {@link Token} user will receive from the bridge on the destination chain
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
        protected network: Networks.Network;
        protected chainId: number;
        protected provider: Provider;

        private readonly bridgeAddress: string;

        private readonly bridgeInstance:           SynapseBridgeContract;
        private readonly networkZapBridgeInstance: GenericZapBridgeContract;

        private readonly isL2Zap:      boolean;
        private readonly isL2ETHChain: boolean;

        private readonly zapBridgeAddress: string;

        private readonly bridgeConfigInstance: BridgeConfigV3Contract = SynapseEntities.BridgeConfigV3ContractInstance();

        private readonly zapBridgeInstance: L1BridgeZapContract = SynapseEntities.L1BridgeZapContractInstance({
            chainId: ChainId.ETH,
            signerOrProvider: rpcProviderForChain(ChainId.ETH),
        });

        readonly requiredConfirmations: number;

        constructor(args: {
            network: Networks.Network | number,
            provider?: Provider
        }) {
            let {network, provider} = args;

            this.network = network instanceof Networks.Network ? network : Networks.fromChainId(network);
            this.chainId = this.network.chainId;
            this.provider = provider ?? rpcProviderForChain(this.chainId);

            this.requiredConfirmations = getRequiredConfirmationsForBridge(this.network);

            this.isL2Zap = this.network.zapIsL2BridgeZap;
            this.isL2ETHChain = BridgeUtils.isL2ETHChain(this.chainId);

            const
                factoryParams = {chainId: this.chainId, signerOrProvider: this.provider},
                contractAddrs = SynapseContracts.contractsForChainId(this.chainId);

            this.bridgeAddress    = contractAddrs.bridgeAddress;
            this.zapBridgeAddress = contractAddrs.bridgeZapAddress;

            this.bridgeInstance = SynapseEntities.SynapseBridgeContractInstance(factoryParams);

            if (this.zapBridgeAddress && this.zapBridgeAddress !== "") {
                this.networkZapBridgeInstance = SynapseEntities.GenericZapBridgeContractInstance(factoryParams);
            }
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
                .then(txn =>
                    GasUtils.populateGasParams(this.chainId, txn, "bridge")
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
            } catch (e) {
                return rejectPromise(e);
            }

            const
                {tokenFrom, amountFrom, addressTo} = args,
                signerAddress = await signer.getAddress();

            args.addressTo = addressTo ?? signerAddress

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
         * @return {Promise<PopulatedTransaction>} Populated transaction instance which can be sent via ones choice
         * of web3/ethers/etc.
         */
        async buildApproveTransaction(args: {
            token:   Token | string,
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

            return ERC20.approve(approveArgs, tokenParams, signer)
        }

        async getAllowanceForAddress(args: {
            address: string,
            token:   Token,
        }): Promise<BigNumber> {
            let { address, token } = args;
            let tokenAddress = token.address(this.chainId);

            return ERC20.allowanceOf(address, this.zapBridgeAddress, {tokenAddress, chainId: this.chainId})
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

            return needsApproval
                ? {canBridge: false, reasonUnable: errStr, amount: currentAllowance}
                : hasBalanceRes
        }

        private async checkNeedsApprove({
            address,
            token,
            amount=MAX_APPROVAL_AMOUNT.sub(1)
        }: CheckCanBridgeParams): Promise<NeedsTokenApproveResult> {
            const [{spender}, tokenAddress] = this.buildERC20ApproveArgs({token, amount});

            return ERC20.allowanceOf(address, spender, {tokenAddress, chainId: this.chainId})
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

            const signerAddress: string = (address && address !== "")
                ? address
                : (await signer.getAddress());

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
                ERC20.balanceOf(address, {tokenAddress, chainId: this.chainId}),
                amount,
                token
            )
        }

        private buildERC20ApproveArgs(args: {
            token:   Token | string,
            amount?: BigNumberish
        }): [ERC20.ApproveArgs, string] {
            const {token, amount} = args;

            let tokenAddr: string = instanceOfToken(token)
                ? token.address(this.chainId)
                : token as string;

            return [{
                spender: this.zapBridgeAddress,
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

            const toChainZapParams = {chainId: chainIdTo, signerOrProvider: rpcProviderForChain(chainIdTo)};
            const toChainZap: GenericZapBridgeContract = SynapseEntities.GenericZapBridgeContractInstance(toChainZapParams);

            const {
                tokenFrom, tokenTo,
                tokenIndexFrom, tokenIndexTo,
                fromChainTokens
            } = this.makeBridgeTokenArgs(args);


            let {intermediateToken, bridgeConfigIntermediateToken} = TokenSwap.intermediateTokens(chainIdTo, tokenFrom);

            const
                intermediateTokenAddr = bridgeConfigIntermediateToken.address(chainIdTo).toLowerCase(),
                multiplier            = BigNumber.from(10).pow(18-tokenFrom.decimals(this.chainId)),
                feeRequestAmountFrom  = amountFrom.mul(multiplier);

            const bridgeFeeRequest: Promise<BigNumber> = this.bridgeConfigInstance["calculateSwapFee(string,uint256,uint256)"](
                intermediateTokenAddr,
                chainIdTo,
                feeRequestAmountFrom
            );

            const checkEthy = (c1: number, c2: number, t: Token): boolean =>
                c1 === ChainId.ETH && BridgeUtils.isL2ETHChain(c2) && t.swapType === SwapType.ETH

            const
                ethToEth:   boolean = checkEthy(this.chainId, chainIdTo,    tokenTo),
                ethFromEth: boolean = checkEthy(chainIdTo,    this.chainId, tokenFrom);

            let amountToReceive_from_prom: Promise<BigNumber>;
            switch (true) {
                case amountFrom.eq(Zero):
                    amountToReceive_from_prom = Promise.resolve(Zero);
                    break;
                case ethToEth:
                case Tokens.isMintBurnToken(tokenFrom):
                case tokenFrom.isWrappedToken:
                    amountToReceive_from_prom = Promise.resolve(amountFrom);
                    break;
                case this.chainId === ChainId.ETH:
                    let liquidityAmounts = fromChainTokens.map((t) => tokenFrom.isEqual(t) ? amountFrom : Zero);
                    amountToReceive_from_prom = this.zapBridgeInstance.calculateTokenAmount(liquidityAmounts, true);

                    break;
                default:
                    amountToReceive_from_prom = BridgeUtils.calculateSwapL2Zap(
                        this.networkZapBridgeInstance,
                        intermediateToken.address(this.chainId),
                        tokenIndexFrom,
                        0,
                        amountFrom
                    );
            }

            let amountToReceive_from = await amountToReceive_from_prom;

            let bridgeFee: BigNumber;
            try {
                bridgeFee = await bridgeFeeRequest;
                if (bridgeFee === null) {
                    console.error("calculateSwapFee returned null");
                    return rejectPromise("calculateSwapFee returned null")
                }
            } catch (e) {
                console.error(`Error in bridge fee request: ${e}`);
                return rejectPromise(e)
            }

            amountToReceive_from = BridgeUtils.subBigNumSafe(amountToReceive_from, bridgeFee);

            let amountToReceive_to_prom: Promise<BigNumber>;
            switch (true) {
                case amountToReceive_from.isZero():
                    amountToReceive_to_prom = Promise.resolve(Zero);
                    break;
                case ethFromEth:
                case Tokens.isMintBurnToken(tokenTo):
                case tokenTo.isWrappedToken:
                    amountToReceive_to_prom = Promise.resolve(amountToReceive_from);
                    break;
                case chainIdTo === ChainId.ETH:
                    amountToReceive_to_prom = (toChainZap as L1BridgeZapContract)
                        .calculateRemoveLiquidityOneToken(amountToReceive_from, tokenIndexTo);

                    break;
                default:
                    amountToReceive_to_prom = BridgeUtils.calculateSwapL2Zap(
                        toChainZap,
                        intermediateToken.address(chainIdTo),
                        0,
                        tokenIndexTo,
                        amountToReceive_from
                    );
            }

            let amountToReceive: BigNumber;
            try {
                amountToReceive = await Promise.resolve(amountToReceive_to_prom)
            } catch (err) {
                return rejectPromise(err)
            }

            return {amountToReceive, bridgeFee}
        }

        private checkEasyArgs(
            args: BridgeTransactionParams,
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
            const
                {addressTo, chainIdTo, amountFrom, amountTo} = args,
                zapBridge = SynapseEntities.L1BridgeZapContractInstance({
                    chainId: this.chainId,
                    signerOrProvider: this.provider
                });

            let
                easyRedeems:    ID[] = [Tokens.SYN.id,  Tokens.UST.id],
                easyDeposits:   ID[] = [
                    Tokens.HIGH.id, Tokens.DOG.id,  Tokens.FRAX.id,
                    Tokens.GOHM.id, Tokens.NEWO.id,
                ],
                easyDepositETH: ID[] = [Tokens.NETH.id];

            let {castArgs, isEasy, txn} = this.checkEasyArgs(args, zapBridge, easyDeposits, easyRedeems, easyDepositETH);
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

            if (args.tokenTo.isEqual(Tokens.NUSD)) {
                if (args.tokenFrom.isEqual(Tokens.NUSD)) {
                    const bridgeDepositArgs = BridgeUtils.makeEasyParams(
                        args as BridgeUtils.BridgeTxParams,
                        this.chainId,
                        args.tokenTo
                    );

                    return zapBridge
                        .populateTransaction
                        .deposit(...bridgeDepositArgs)
                } else {
                    return zapBridge.populateTransaction.zapAndDeposit(
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
                return zapBridge.populateTransaction.depositETHAndSwap(
                    ...BridgeUtils.depositETHParams(castArgs),
                    0, // nusd tokenindex,
                    tokenArgs.tokenIndexTo,
                    minToSwapDestFromOrigin, // minDy
                    bridgeTransactionDeadline,
                    BridgeUtils.overrides(amountFrom)
                )
            } else if (args.tokenFrom.isEqual(Tokens.NUSD)) {
                return zapBridge.populateTransaction.depositAndSwap(
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

        private buildL2BridgeTxn(
            args: BridgeTransactionParams,
            tokenArgs: BridgeTokenArgs
        ): Promise<PopulatedTransaction> {
            const
                {chainIdTo, amountFrom, amountTo} = args,
                zapBridge = SynapseEntities.L2BridgeZapContractInstance({
                    chainId: this.chainId,
                    signerOrProvider: this.provider
                });

            tokenArgs.tokenFrom = tokenArgs.tokenFrom.isEqual(Tokens.AVWETH)
                ? Tokens.WETH_E
                : tokenArgs.tokenFrom;

            let
                easyDeposits:   ID[] = [],
                easyDepositETH: ID[] = [],
                easyRedeems:    ID[] = [
                    Tokens.SYN.id,  Tokens.HIGH.id, Tokens.DOG.id,
                    Tokens.FRAX.id, Tokens.UST.id,  Tokens.GOHM.id,
                    Tokens.NEWO.id, Tokens.LUNA.id,
                ];

            BridgeUtils.DepositIfChainTokens.forEach((args) => {
                let {chainId, tokens, depositEth, altChainId} = args;

                let
                    hasAltChain = typeof altChainId !== 'undefined',
                    tokenHashes = tokens.map((t) => t.id);

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
                    if (args.tokenFrom.isEqual(Tokens.NUSD)) {
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
                default:
                    if (chainIdTo === ChainId.ETH) {
                        if (this.isL2ETHChain && args.tokenFrom.swapType === SwapType.ETH) {
                            if (args.tokenFrom.isEqual(Tokens.NETH)) {
                                return zapBridge
                                    .populateTransaction
                                    .redeem(...BridgeUtils.makeEasyParams(castArgs, this.chainId, Tokens.NETH))
                            } else {
                                let useSwapETH = !BridgeUtils.isETHLikeToken(args.tokenFrom);
                                return easySwapAndRedeem(Tokens.NETH, useSwapETH)
                            }
                        } else if (args.tokenFrom.isEqual(Tokens.NUSD)) {
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

                    if (args.tokenFrom.isEqual(Tokens.NUSD) || args.tokenFrom.isEqual(Tokens.NETH)) {
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
        [ChainId.BSC]:       14,
        [ChainId.POLYGON]:   128,
        [ChainId.FANTOM]:    5,
        [ChainId.BOBA]:      1,
        [ChainId.MOONBEAM]:  21,
        [ChainId.MOONRIVER]: 21,
        [ChainId.ARBITRUM]:  40,
        [ChainId.AVALANCHE]: 5,
        [ChainId.HARMONY]:   1,
    };

    export function getRequiredConfirmationsForBridge(network: Networks.Network | number): number {
        let chainId: number = network instanceof Networks.Network ? network.chainId : network;

        return REQUIRED_CONFS[chainId] ?? -1
    }



    export function bridgeSwapSupported(args: TokenSwap.BridgeSwapSupportedParams): TokenSwap.SwapSupportedResult {
        return TokenSwap.bridgeSwapSupported(args)
    }
}