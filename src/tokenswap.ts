import {
    isNil,
    isNull,
    isEmpty,
    isUndefined
} from "lodash-es";

import {
    ChainId, ChainIdTypeMap,
    supportedChainIds
} from "@chainid";
import {Networks}      from "@networks";
import type {Token}    from "@token";
import {Tokens}        from "@tokens";
import {SwapPools}     from "@swappools";
import {rejectPromise} from "@common/utils";
import {
    GasOptions,
    populateGasOptions,
    makeTransactionGasOverrides
} from "@common/gasoptions";

import {BridgeConfigV3ContractInstance} from "@entities";

import {
    SwapContract,
    SwapFactory,
    type BridgeConfigV3Contract
} from "@contracts";

import {SwapType, mintBurnSwapTypes} from "@internal/swaptype";
import {rpcProviderForChain} from "@internal/rpcproviders";

import {
    BigNumber,
    type BigNumberish
} from "@ethersproject/bignumber";

import type {Signer} from "@ethersproject/abstract-signer";
import {
    Overrides,
    type ContractTransaction,
    type PopulatedTransaction,
} from "@ethersproject/contracts";
import {BridgeUtils} from "@bridge/bridgeutils";


export namespace UnsupportedSwapErrors {
    export enum UnsupportedSwapErrorKind {
        UnsupportedToken,
        UnsupportedTokenNetFrom,
        UnsupportedTokenNetTo,
        NonmatchingSwapTypes,
        UnsupportedMultiJEWELMigration,
    }

    export interface UnsupportedSwapErrorArgs {
        reason:    string;
        errorKind: UnsupportedSwapErrorKind;
    }

    export class UnsupportedSwapError extends Error {
        readonly reason:    string;
        readonly errorKind: UnsupportedSwapErrorKind;

        constructor({reason, errorKind}: UnsupportedSwapErrorArgs) {
            /* c8 ignore next */
            super(reason);

            this.name = this.constructor.name;
            Error.captureStackTrace(this, this.constructor);

            this.reason    = reason;
            this.errorKind = errorKind;
        }
    }

    export const tokenNotSupported = (t: {symbol: string}, netName: string): UnsupportedSwapError => new UnsupportedSwapError({
        reason:    `Token ${t.symbol} not supported on network ${netName}`,
        errorKind:  UnsupportedSwapErrorKind.UnsupportedToken,
    });

    export const tokenNotSupportedNetFrom = (t: {symbol: string}, netName: string): UnsupportedSwapError => new UnsupportedSwapError({
        reason:    `Token ${t.symbol} not supported on 'from' network ${netName}`,
        errorKind:  UnsupportedSwapErrorKind.UnsupportedTokenNetFrom,
    });

    export const tokenNotSupportedNetTo = (t: {symbol: string}, netName: string): UnsupportedSwapError => new UnsupportedSwapError({
        reason:    `Token ${t.symbol} not supported on 'to' network ${netName}`,
        errorKind:  UnsupportedSwapErrorKind.UnsupportedTokenNetTo,
    });

    export const nonMatchingSwapTypes = (): UnsupportedSwapError => new UnsupportedSwapError({
        reason:    "Token swap types don't match",
        errorKind:  UnsupportedSwapErrorKind.NonmatchingSwapTypes,
    });

    export const unsupportedMultiJEWELMigration = (): UnsupportedSwapError => new UnsupportedSwapError({
        reason:    "Migrating multiJEWEL from Avalanche to Harmony is not supported",
        errorKind: UnsupportedSwapErrorKind.UnsupportedMultiJEWELMigration,
    });
}

export namespace TokenSwap {
    const BRIDGE_CONFIG_INSTANCE: BridgeConfigV3Contract = BridgeConfigV3ContractInstance();

    export interface SwapParams {
        chainId:       number;
        tokenFrom:     Token;
        tokenTo:       Token;
        amountIn:      BigNumberish;
        swapData?:     SwapSetup;
    }

    export interface SwapTokensParams extends SwapParams {
        minAmountOut: BigNumberish;
        deadline?:    number;
    }

    export interface BridgeSwapSupportedParams {
        tokenFrom:   Token;
        tokenTo:     Token;
        chainIdFrom: number;
        chainIdTo:   number;
    }

    export interface AddRemoveLiquidityParams {
        chainId:        number;
        lpToken:        SwapPools.SwapPoolToken;
        deadline?:      BigNumber;
        signer?:        Signer;
    }

    export interface AddLiquidityParams extends AddRemoveLiquidityParams {
        amounts:    BigNumber[];
        minToMint?: BigNumber;
    }

    export interface RemoveLiquidityParams extends AddRemoveLiquidityParams {
        amount:      BigNumber;
        minAmounts?: BigNumber[];
    }

    export interface RemoveLiquidityOneParams extends AddRemoveLiquidityParams {
        token:      Token;
        amount:     BigNumber;
        minAmount?: BigNumber;
    }

    export type EstimatedSwapRate = {
        amountOut: BigNumber
    }

    export type IntermediateSwapTokens = {
        intermediateToken?:            Token;
        bridgeConfigIntermediateToken: Token;
    }

    export type SwapSupportedResult = {
        swapSupported:       boolean;
        reasonNotSupported?: UnsupportedSwapErrors.UnsupportedSwapError;
    }

    export type DetailedTokenSwapMap = {
        [chainId: number]: {
            token: Token;
            [chainId: number]: Token[];
        }[];
    }

    interface TokenSwapMap {
        token: Token;
        [chainId: number]: Token[];
    }

    const CHAIN_SWAPS_GAS_LIMITS: ChainIdTypeMap<GasOptions> = {
        [ChainId.AVALANCHE]: {gasLimit: BigNumber.from("165000")}
    }

    const
        ADD_LIQUIDITY_GAS_LIMT:         BigNumber = BigNumber.from("210000"),
        REMOVE_LIQUIDITY_GAS_LIMT:      BigNumber = BigNumber.from("265000"),
        REMOVE_LIQUIDITY_ONE_GAS_LIMIT: BigNumber = BigNumber.from("210000");


    export function swapSupported(args: SwapParams): SwapSupportedResult {
        const {tokenFrom, tokenTo, chainId} = args;
        return checkCanSwap(tokenFrom, tokenTo, chainId)
    }

    export function bridgeSwapSupported(args: BridgeSwapSupportedParams): SwapSupportedResult {
        const {tokenFrom, tokenTo, chainIdFrom, chainIdTo} = args;
        return checkCanSwap(tokenFrom, tokenTo, chainIdFrom, chainIdTo);
    }

    /**
     * calculateAddLiquidity returns the estimated number of LP tokens which a user would receive
     * were they to deposit a given number of liquidity tokens into a pool.
     *
     * @param {AddLiquidityParams} args {@link AddLiquidityParams} object containing arguments.
     * @param {number} args.chainId Chain ID of the Liquidity Pool.
     * @param {SwapPools.SwapPoolToken} args.lpToken LP Token/Pool with which to interact.
     * @param {BigNumber[]} args.amounts Pool-index-relative array of token amounts to add as liquidity to the pool.
     *
     * @return {BigNumber} Amount of LP tokens a user would receive if the deposited liquidity tokens into the pool.
     */
    export async function calculateAddLiquidity(args: AddLiquidityParams): Promise<BigNumber> {
        const swapInstance = await swapContractFromLPSwapAddress(
            args.lpToken.swapAddress,
            args.chainId
        );

        return swapInstance.calculateTokenAmount(
            args.amounts,
            true
        )
    }

    /**
     * calculateRemoveLiquidity returns the estimated number of pooled tokens which a user would receive
     * were they to return some amount of their LP tokens to the Pool.
     *
     * @param {RemoveLiquidityParams} args {@link RemoveLiquidityParams} object containing arguments.
     * @param {number} args.chainId Chain ID of the Liquidity Pool.
     * @param {SwapPools.SwapPoolToken} args.lpToken LP Token/Pool with which to interact.
     * @param {BigNumber} args.amount Amount of LP tokens to exchange for pooled liquidity tokens.
     *
     * @return {BigNumber[]} Pool-index-relative array of token amounts which a user would receive if they remove the passed amount of LP tokens.
     */
    export async function calculateRemoveLiquidity(args: RemoveLiquidityParams): Promise<BigNumber[]> {
        const swapInstance = await swapContractFromLPSwapAddress(
            args.lpToken.swapAddress,
            args.chainId
        );

        return swapInstance.calculateRemoveLiquidity(args.amount)
    }

    /**
     * calculateRemoveLiquidityOneToken returns the estimated number of a single pooled token
     * which would be removed from a Liquidity Pool and transferred to a user
     * were they to return some amount of their LP tokens to the Pool.
     *
     * @param {RemoveLiquidityOneParams} args {@link RemoveLiquidityOneParams} object containing arguments.
     * @param {number} args.chainId Chain ID of the Liquidity Pool.
     * @param {SwapPools.SwapPoolToken} args.lpToken LP Token/Pool with which to interact.
     * @param {Token} args.token Token which will be removed as liquidity from the Liquidity Pool and transferred to the user in exchange for their LP tokens.
     * @param {BigNumber} args.amount Amount of LP tokens to exchange for desired pooled liquidity token.
     *
     * @return {BigNumber} Amount of a single pooled liquidity token which would be removed from the Liquidity Pool and transferred to the user.
     */
    export async function calculateRemoveLiquidityOneToken(args: RemoveLiquidityOneParams): Promise<BigNumber> {
        const swapInstance = await swapContractFromLPSwapAddress(
            args.lpToken.swapAddress,
            args.chainId
        );

        const tokenAddress = args.token.address(args.chainId);
        if (!tokenAddress) { /* c8 ignore start */
            const err = new Error(`no address for token ${args.token.name} found for chain id ${args.chainId}`);
            return rejectPromise(err)
        } /* c8 ignore stop */

        let tokenIndex: number;
        try {
            tokenIndex = await swapInstance.getTokenIndex(tokenAddress);
        } catch (e) {
            return rejectPromise(e)
        }

        return swapInstance.calculateRemoveLiquidityOneToken(args.amount, tokenIndex)
    }

    /**
     * addLiquidity adds a given amount of a user's tokens (such as USDC for Stableswap pools)
     * as liquidity to a Liquidity Pool, providing the user with LP tokens which can be staked.
     *
     * @param {AddLiquidityParams} args {@link AddLiquidityParams} object containing arguments.
     * @param {number} args.chainId Chain ID of the Liquidity Pool.
     * @param {SwapPools.SwapPoolToken} args.lpToken LP Token with which to interact.
     * @param {BigNumber} args.deadline Latest deadline which transaction will be accepted at.
     * @param {Signer} args.signer EthersJS-compatible transaction signer.
     * @param {BigNumber[]} args.amounts Pool-index-relative array of token amounts to add as liquidity to the pool.
     * @param {BigNumber} args.minToMint Amount of LP tokens to mint. Can be calculated with {@link calculateAddLiquidity}.
     *
     * @return {Promise<ContractTransaction>} Executed transaction object.
     */
    export async function addLiquidity(args: AddLiquidityParams): Promise<ContractTransaction> {
        if (isEmpty(args.signer)) { /* c8 ignore start */
            return rejectPromiseMissingField("signer", "AddLiquidityParams")
        } else if (isEmpty(args.deadline)) {
            return rejectPromiseMissingField("deadline", "AddLiquidityParams")
        } else if (isEmpty(args.minToMint)) {
            return rejectPromiseMissingField("minToMint", "AddLiquidityParams")
        } /* c8 ignore stop */

        const swapInstance = await swapContractFromLPSwapAddress(
            args.lpToken.swapAddress,
            args.chainId,
            args.signer
        );

        return swapInstance.addLiquidity(
            args.amounts,
            args.minToMint,
            args.deadline,
            {gasLimit: ADD_LIQUIDITY_GAS_LIMT}
        )
    }

    /**
     * buildAddLiquidityTransaction populates a transaction which adds a given amount of a
     * user's tokens (such as USDC for Stableswap pools) as liquidity to a Liquidity Pool,
     * providing the user with LP tokens which can be staked.
     *
     * @param {AddLiquidityParams} args {@link AddLiquidityParams} object containing arguments.
     * @param {number} args.chainId Chain ID of the Liquidity Pool.
     * @param {SwapPools.SwapPoolToken} args.lpToken LP Token with which to interact.
     * @param {BigNumber} args.deadline Latest deadline which transaction will be accepted at.
     * @param {BigNumber[]} args.amounts Pool-index-relative array of token amounts to add as liquidity to the pool.
     * @param {BigNumber} args.minToMint Amount of LP tokens to mint. Can be calculated with {@link calculateAddLiquidity}.
     *
     * @return {Promise<PopulatedTransaction>} Populated transaction object.
     */
    export async function buildAddLiquidityTransaction(args: AddLiquidityParams): Promise<PopulatedTransaction> {
        if (isEmpty(args.deadline)) { /* c8 ignore start */
            return rejectPromiseMissingField("deadline", "AddLiquidityParams")
        } else if (isEmpty(args.minToMint)) {
            return rejectPromiseMissingField("minToMint", "AddLiquidityParams")
        } /* c8 ignore stop */

        const swapInstance = await swapContractFromLPSwapAddress(args.lpToken.swapAddress, args.chainId);

        return swapInstance.populateTransaction.addLiquidity(
            args.amounts,
            args.minToMint,
            args.deadline
        )
    }

    /**
     * removeLiquidity exchanges a given amount of a user's LP tokens for a given Liquidity Pool for
     * various amounts of pooled liquidity tokens, thereby removing liquidity from the Pool.
     *
     * @param {RemoveLiquidityParams} args {@link RemoveLiquidityParams} object containing arguments.
     * @param {number} args.chainId Chain ID of the Liquidity Pool.
     * @param {SwapPools.SwapPoolToken} args.lpToken LP Token with which to interact.
     * @param {BigNumber} args.deadline Latest deadline which transaction will be accepted at.
     * @param {Signer} args.signer EthersJS-compatible transaction signer.
     * @param {BigNumber} args.amount Amount of LP tokens to exchange for pooled liquidity tokens.
     * @param {BigNumber[]} args.minAmounts Pool-index-relative array of pooled liquidity token amounts to return in exchange for LP tokens. Can be calculated with {@link calculateRemoveLiquidity}.
     *
     * @return {Promise<ContractTransaction>} Executed transaction object.
     */
    export async function removeLiquidity(args: RemoveLiquidityParams): Promise<ContractTransaction> {
        if (isEmpty(args.signer)) { /* c8 ignore start */
            return rejectPromiseMissingField("signer", "RemoveLiquidityParams")
        } else if (isEmpty(args.deadline)) {
            return rejectPromiseMissingField("deadline", "RemoveLiquidityParams")
        } else if (isEmpty(args.minAmounts)) {
            return rejectPromiseMissingField("minAmounts", "RemoveLiquidityParams")
        } /* c8 ignore stop */

        const swapInstance = await swapContractFromLPSwapAddress(
            args.lpToken.swapAddress,
            args.chainId,
            args.signer
        );

        return swapInstance.removeLiquidity(
            args.amount,
            args.minAmounts,
            args.deadline,
            {gasLimit: REMOVE_LIQUIDITY_GAS_LIMT}
        )
    }

    /**
     * buildRemoveLiquidityTransaction populates a transaction which exchanges a given amount of a user's LP tokens for a given Liquidity Pool for
     * various amounts of pooled liquidity tokens, thereby removing liquidity from the Pool.
     *
     * @param {RemoveLiquidityParams} args {@link RemoveLiquidityParams} object containing arguments.
     * @param {number} args.chainId Chain ID of the Liquidity Pool.
     * @param {SwapPools.SwapPoolToken} args.lpToken LP Token with which to interact.
     * @param {BigNumber} args.deadline Latest deadline which transaction will be accepted at.
     * @param {BigNumber} args.amount Amount of LP tokens to exchange for pooled liquidity tokens.
     * @param {BigNumber[]} args.minAmounts Pool-index-relative array of pooled liquidity token amounts to return in exchange for LP tokens. Can be calculated with {@link calculateRemoveLiquidity}.
     *
     * @return {Promise<PopulatedTransaction>} Populated transaction object.
     */
    export async function buildRemoveLiquidityTransaction(args: RemoveLiquidityParams): Promise<PopulatedTransaction> {
        if (isEmpty(args.deadline)) { /* c8 ignore start */
            return rejectPromiseMissingField("deadline", "RemoveLiquidityParams")
        } else if (isEmpty(args.minAmounts)) {
            return rejectPromiseMissingField("minAmounts", "RemoveLiquidityParams")
        } /* c8 ignore stop */

        const swapInstance = await swapContractFromLPSwapAddress(args.lpToken.swapAddress, args.chainId);

        return swapInstance.populateTransaction.removeLiquidity(
            args.amount,
            args.minAmounts,
            args.deadline
        )
    }

    /**
     * removeLiquidityOneToken exchanges a given amount of a user's LP tokens for a given Liquidity Pool for
     * an amount of a single liquidity token in the given Liquidity Pool, removing that amount from available liquidity
     * and transferring it to the user.
     *
     * @param {RemoveLiquidityOneParams} args {@link RemoveLiquidityOneParams} object containing arguments.
     * @param {number} args.chainId Chain ID of the Liquidity Pool.
     * @param {SwapPools.SwapPoolToken} args.lpToken LP Token/Pool with which to interact.
     * @param {BigNumber} args.deadline Latest deadline which transaction will be accepted at.
     * @param {Signer} args.signer EthersJS-compatible transaction signer.
     * @param {Token} args.token Token which will be returned to the user in exchange for their LP tokens.
     * @param {BigNumber} args.amount Amount of LP tokens to exchange for desired pooled liquidity token.
     * @param {BigNumber} args.minAmount Minimum amount of pooled liquidity token to be removed from the Liquidity Pool and transferred to the user.
     *
     * @return {Promise<ContractTransaction>} Executed transaction object.
     */
    export async function removeLiquidityOneToken(args: RemoveLiquidityOneParams): Promise<ContractTransaction> {
        if (isEmpty(args.signer)) { /* c8 ignore start */
            return rejectPromiseMissingField("signer", "RemoveLiquidityOneParams")
        } else if (isEmpty(args.deadline)) {
            return rejectPromiseMissingField("deadline", "RemoveLiquidityOneParams")
        } else if (isEmpty(args.minAmount)) {
            return rejectPromiseMissingField("minAmount", "RemoveLiquidityOneParams")
        } /* c8 ignore stop */

        const swapInstance = await swapContractFromLPSwapAddress(
            args.lpToken.swapAddress,
            args.chainId,
            args.signer
        );

        const tokenAddress = args.token.address(args.chainId);
        if (!tokenAddress) { /* c8 ignore start */
            const err = new Error(`no address for token ${args.token.name} found for chain id ${args.chainId}`);
            return rejectPromise(err)
        } /* c8 ignore stop */

        let tokenIndex: number;
        try {
            tokenIndex = await swapInstance.getTokenIndex(tokenAddress);
        } catch (e) {
            return rejectPromise(e)
        }

        return swapInstance.removeLiquidityOneToken(
            args.amount,
            tokenIndex,
            args.minAmount,
            args.deadline,
            {gasLimit: REMOVE_LIQUIDITY_ONE_GAS_LIMIT}
        )
    }

    /**
     * buildRemoveLiquidityOneTokenTransaction populates a transaction exchanges a given amount of a user's LP tokens for a given Liquidity Pool for
     * an amount of a single liquidity token in the given Liquidity Pool, removing that amount from available liquidity
     * and transferring it to the user.
     *
     * @param {RemoveLiquidityOneParams} args {@link RemoveLiquidityOneParams} object containing arguments.
     * @param {number} args.chainId Chain ID of the Liquidity Pool.
     * @param {SwapPools.SwapPoolToken} args.lpToken LP Token/Pool with which to interact.
     * @param {BigNumber} args.deadline Latest deadline which transaction will be accepted at.
     * @param {Token} args.token Token which will be returned to the user in exchange for their LP tokens.
     * @param {BigNumber} args.amount Amount of LP tokens to exchange for desired pooled liquidity token.
     * @param {BigNumber} args.minAmount Minimum amount of pooled liquidity token to be removed from the Liquidity Pool and transferred to the user.
     *
     * @return {Promise<PopulatedTransaction>} Populated transaction object.
     */
    export async function buildRemoveLiquidityOneTokenTransaction(args: RemoveLiquidityOneParams): Promise<PopulatedTransaction> {
        if (isEmpty(args.deadline)) { /* c8 ignore start */
            return rejectPromiseMissingField("deadline", "RemoveLiquidityOneParams")
        } else if (isEmpty(args.minAmount)) {
            return rejectPromiseMissingField("minAmount", "RemoveLiquidityOneParams")
        } /* c8 ignore stop */

        const swapInstance = await swapContractFromLPSwapAddress(args.lpToken.swapAddress, args.chainId);

        const tokenAddress = args.token.address(args.chainId);
        if (!tokenAddress) { /* c8 ignore start */
            const err = new Error(`no address for token ${args.token.name} found for chain id ${args.chainId}`);
            return rejectPromise(err)
        } /* c8 ignore stop */

        let tokenIndex: number;
        try {
            tokenIndex = await swapInstance.getTokenIndex(tokenAddress);
        } catch (e) {
            return rejectPromise(e)
        }

        return swapInstance.populateTransaction.removeLiquidityOneToken(
            args.amount,
            tokenIndex,
            args.minAmount,
            args.deadline
        )
    }


    function rejectPromiseMissingField(fieldName: string, paramsType: string): Promise<never> {
        const err = new Error(`${fieldName} must be passed in ${paramsType}`);
        return rejectPromise(err)
    }

    export async function calculateSwapRate(args: SwapParams): Promise<EstimatedSwapRate> {
        const {swapSupported: canSwap, reasonNotSupported} = swapSupported(args);
        if (!canSwap) {
            return rejectPromise(reasonNotSupported)
        }

        return resolveSwapData(args)
            .then(({swapInstance, tokenIndexFrom, tokenIndexTo}) =>
                swapInstance
                    .calculateSwap(tokenIndexFrom, tokenIndexTo, args.amountIn)
                    .then((res): EstimatedSwapRate => ({amountOut: res}))
            )
            .catch(rejectPromise)
    }

    interface SwapTokensFnParams extends SwapTokensParams {
        signer: Signer
    }

    export async function swapTokens(
        args:        SwapTokensFnParams,
        gasOptions?: GasOptions
    ): Promise<ContractTransaction> {
        const {swapSupported: canSwap, reasonNotSupported} = swapSupported(args);
        if (!canSwap) {
            return rejectPromise(reasonNotSupported)
        }

        return resolveSwapData(args)
            .then(swapSetup => {
                let {deadline} = args;
                /* c8 ignore next */
                deadline = deadline ?? Math.round((new Date().getTime() / 1000) + 60 * 10);

                return swapContract(args.tokenFrom, args.chainId, args.signer)
                    .then(swapInstance => {
                        return swapInstance.swap(
                            swapSetup.tokenIndexFrom,
                            swapSetup.tokenIndexTo,
                            args.amountIn,
                            args.minAmountOut,
                            deadline,
                            buildSwapTokensOverrides(args, gasOptions)
                        )
                    })
            })
            .catch(rejectPromise)
    }

    export async function buildSwapTokensTransaction(
        args:        SwapTokensParams,
        gasOptions?: GasOptions
    ): Promise<PopulatedTransaction> {
        const {swapSupported: canSwap, reasonNotSupported} = swapSupported(args);
        if (!canSwap) {
            return rejectPromise(reasonNotSupported)
        }

        return resolveSwapData(args)
            .then(swapData => populateSwapTransaction(args, swapData, gasOptions))
            .catch(rejectPromise)
    }

    async function resolveSwapData(args: SwapTokensParams|SwapParams): Promise<SwapSetup> {
        const {swapData} = args;
        return Promise.resolve(swapData ? swapData : await swapSetup(args.tokenFrom, args.tokenTo, args.chainId))
    }

    function populateSwapTransaction(
        args:        SwapTokensParams,
        swapSetup:   SwapSetup,
        gasOptions?: GasOptions
    ): Promise<PopulatedTransaction> {
        let {deadline} = args;
        const {swapInstance} = swapSetup;
        /* c8 ignore next */
        deadline = deadline ?? Math.round((new Date().getTime() / 1000) + 60 * 10);

        let txnProm = swapInstance.populateTransaction.swap(
            swapSetup.tokenIndexFrom,
            swapSetup.tokenIndexTo,
            args.amountIn,
            args.minAmountOut,
            deadline
        );

        const gasLimit = CHAIN_SWAPS_GAS_LIMITS[args.chainId]?.gasLimit;
        /* c8 ignore next */
        let gasOpts: GasOptions = gasOptions ? gasOptions : {};
        if (gasLimit) {
            gasOpts.gasLimit = gasLimit;
        }

        return txnProm.then(txn => populateGasOptions(txn, gasOpts, args.chainId))
    }

    /* c8 ignore start */
    function buildSwapTokensOverrides(
        args:         SwapTokensParams,
        gasOptions?:  GasOptions
    ): Overrides | null {
        const {chainId} = args;

        const overrides: Overrides = {
            ...makeTransactionGasOverrides(gasOptions, chainId, true),
            ...makeTransactionGasOverrides(CHAIN_SWAPS_GAS_LIMITS[chainId], chainId)
        };

        if (Object.keys(overrides).length === 0) {
            return null
        }

        return overrides
    }
    /* c8 ignore stop */

    export function intermediateTokens(chainId: number, token: Token, otherChainId?: number): IntermediateSwapTokens {
        if (mintBurnSwapTypes.includes(token.swapType)) {
            switch (token.swapType) {
                case SwapType.JEWEL:
                    let bridgeConfigIntermediate: Token = chainId === ChainId.HARMONY
                        ? Tokens.SYN_JEWEL
                        : Tokens.JEWEL;

                    return {intermediateToken: Tokens.JEWEL, bridgeConfigIntermediateToken: bridgeConfigIntermediate}
                // case SwapType.AVAX:
                //     break;
                default:
                    return {intermediateToken: token, bridgeConfigIntermediateToken: token}
            }
        }

        if (chainId === ChainId.KLAYTN) {
            // For bridging WETH from L2s, it must be swapped to nETH and redeemed
            // 'bridgeConfigIntermediateToken' is just WETH, whose address is used to calculate swap price
            if (BridgeUtils.isL2ETHChain(otherChainId) && token.swapType === SwapType.ETH) {
                return {intermediateToken: Tokens.NETH, bridgeConfigIntermediateToken: Tokens.NETH}
            }

            // Other assets are simply deposited() on ETH or redeemed on Klaytn
            return {intermediateToken: token, bridgeConfigIntermediateToken: token}
        }

        let
            intermediateToken:             Token,
            bridgeConfigIntermediateToken: Token;

        switch (token.swapType) {
            case SwapType.SYN:
                intermediateToken = Tokens.SYN;
                break;
            case SwapType.FRAX:
                bridgeConfigIntermediateToken = chainId === ChainId.ETH ? Tokens.FRAX : Tokens.SYN_FRAX;
                break;
            case SwapType.ETH:
                intermediateToken             = Tokens.NETH;
                bridgeConfigIntermediateToken = chainId === ChainId.ETH ? Tokens.WETH : Tokens.NETH;
                break;
            case SwapType.AVAX:
                const
                    fromAvax    = chainId === ChainId.AVALANCHE,
                    fromHarmony = chainId === ChainId.HARMONY;

                if (!isNil(otherChainId)) {
                    if (fromAvax && otherChainId === ChainId.HARMONY) {
                        intermediateToken             = Tokens.WAVAX;
                        bridgeConfigIntermediateToken = Tokens.SYN_AVAX;
                        break;
                    } else if (fromHarmony && otherChainId === ChainId.AVALANCHE) {
                        intermediateToken             = Tokens.WAVAX;
                        bridgeConfigIntermediateToken = Tokens.WAVAX;
                        break;
                    } else {
                        intermediateToken             = Tokens.WAVAX;
                        bridgeConfigIntermediateToken = chainId === ChainId.HARMONY ? Tokens.SYN_AVAX : Tokens.WAVAX;
                        break;
                    }
                }

                /* c8 ignore next 3 */
                intermediateToken             = Tokens.WAVAX;
                bridgeConfigIntermediateToken = chainId === ChainId.HARMONY ? Tokens.SYN_AVAX : Tokens.WAVAX;
                break;
            case SwapType.MOVR:
                intermediateToken = Tokens.WMOVR;
                break;
            case SwapType.DFKTEARS:
                intermediateToken = Tokens.DFKTEARS;
                break;
            default:
                intermediateToken = Tokens.NUSD;
                break;
        }

        bridgeConfigIntermediateToken = bridgeConfigIntermediateToken ?? intermediateToken;

        return {intermediateToken, bridgeConfigIntermediateToken}
    }

    export function detailedTokenSwapMap(): DetailedTokenSwapMap {
        let res: DetailedTokenSwapMap = {};

        const allChainIds = supportedChainIds();

        for (const c1 of allChainIds) {
            let n1: Networks.Network = Networks.fromChainId(c1);
            let networkTokens: Token[] = n1.tokens;

            const chainGasToken = Tokens.gasTokenForChain(c1);

            res[c1] = networkTokens.map((t: Token) => {
                let swapType = t.swapType;

                if (!isNull(chainGasToken)) {
                    const gasWrapper = Tokens.gasTokenWrapper(chainGasToken);
                    if (gasWrapper.isEqual(t)) {
                        return
                    }
                }

                let tokSwapMap: TokenSwapMap = {
                    token: t,
                }

                for (const c2 of allChainIds) {
                    if (c1 === c2) continue

                    if (c1 === ChainId.AVALANCHE && t.isEqual(Tokens.MULTIJEWEL) && c2 !== ChainId.DFK) {
                        continue
                    }

                    const chain2GasToken = Tokens.gasTokenForChain(c2);
                    let outToks: Token[] = SwapPools.tokensForChainBySwapGroup(c2, swapType);
                    if (outToks.length === 0) continue

                    outToks = outToks.filter((t2: Token) => {
                        if (!isNull(chain2GasToken)) {
                            return !Tokens.gasTokenWrapper(chain2GasToken).isEqual(t2)
                        }

                        return true
                    })

                    tokSwapMap[c2] = outToks;
                }

                return tokSwapMap
            }).filter(t => !isUndefined(t))
        }

        return res
    }

    interface SwapSetup {
        swapInstance:   SwapContract,
        tokenIndexFrom: number,
        tokenIndexTo:   number,
    }

    export async function swapContract(token: Token, chainId: number, signer?: Signer): Promise<SwapContract> {
        const provider = signer ? signer : rpcProviderForChain(chainId);

        const lpToken = _intermediateToken(token, chainId);

        // temp fix until BridgeConfig is updated
        if (lpToken.isEqual(Tokens.NUSD) && chainId === ChainId.CRONOS) {
            return swapContractFromLPSwapAddress(
                SwapPools.stableswapPoolForNetwork(chainId).swapAddress,
                chainId,
                signer
            )
        }

        return BRIDGE_CONFIG_INSTANCE.getPoolConfig(lpToken.address(chainId), chainId)
            .then(({poolAddress}) => SwapFactory.connect(poolAddress, provider))
            .catch(rejectPromise)
    }

    async function swapContractFromLPSwapAddress(lpSwapAddress: string, chainId: number, signer?: Signer): Promise<SwapContract> {
        const provider = signer ? signer : rpcProviderForChain(chainId);

        return SwapFactory.connect(lpSwapAddress, provider)
    }

    export async function swapSetup(tokenFrom: Token, tokenTo: Token, chainId: number): Promise<SwapSetup> {
        const swapInstance = await swapContract(tokenFrom, chainId);

        return Promise.all([
                swapInstance.getTokenIndex(tokenFrom.address(chainId)),
                swapInstance.getTokenIndex(tokenTo.address(chainId)),
        ]).then(([tokenIndexFrom, tokenIndexTo]) => ({
            swapInstance,
            tokenIndexFrom,
            tokenIndexTo,
        })).catch(rejectPromise)
    }

    function _intermediateToken(token: Token, chainId: number): Token {
        const {intermediateToken, bridgeConfigIntermediateToken} = intermediateTokens(chainId, token);
        /* c8 ignore next */
        return intermediateToken ?? bridgeConfigIntermediateToken
    }

    function checkCanSwap(tokenFrom: Token, tokenTo: Token, chainFrom: number, chainTo?: number): SwapSupportedResult {
        const
            tokensCanSwap   = checkTokensCanSwap(tokenFrom, tokenTo),
            tokensSupported = checkTokensSupported(tokenFrom, tokenTo, chainFrom, chainTo);

        if (!tokensSupported.swapSupported) {
            return tokensSupported
        } else if (!tokensCanSwap.swapSupported) {
            return tokensCanSwap
        }

        return {swapSupported: true}
    }

    function checkTokensCanSwap(tokenFrom: Token, tokenTo: Token): SwapSupportedResult {
        let
            swapSupported: boolean = true,
            reasonNotSupported: UnsupportedSwapErrors.UnsupportedSwapError;

        if (tokenFrom.swapType !== tokenTo.swapType) {
            swapSupported = false;
            reasonNotSupported = UnsupportedSwapErrors.nonMatchingSwapTypes();
        }

        return {swapSupported, reasonNotSupported}
    }

    function checkTokensSupported(
        tokenFrom:   Token,
        tokenTo:     Token,
        chainIdFrom: number,
        chainIdTo?:  number
    ): SwapSupportedResult {
        const hasDestChain: boolean = !isUndefined(chainIdTo);

        const
            unsupportedFromErr = hasDestChain ? UnsupportedSwapErrors.tokenNotSupportedNetFrom : UnsupportedSwapErrors.tokenNotSupported,
            unsupportedToErr   = hasDestChain ? UnsupportedSwapErrors.tokenNotSupportedNetTo   : UnsupportedSwapErrors.tokenNotSupported;

        const
            netFrom = Networks.fromChainId(chainIdFrom),
            netTo   = hasDestChain ? Networks.fromChainId(chainIdTo) : netFrom;

        if (hasDestChain) {
            if (tokenFrom.isEqual(Tokens.MULTIJEWEL) && chainIdTo !== ChainId.DFK) {
                return {swapSupported: false, reasonNotSupported: UnsupportedSwapErrors.unsupportedMultiJEWELMigration()}
            }
        }

        let
            swapSupported: boolean = true,
            reasonNotSupported: UnsupportedSwapErrors.UnsupportedSwapError;

        if (!netFrom.supportsToken(tokenFrom)) {
            swapSupported = false;
            reasonNotSupported = unsupportedFromErr(tokenFrom, netFrom.name);
        } else if (!netTo.supportsToken(tokenTo)) {
            swapSupported = false;
            reasonNotSupported = unsupportedToErr(tokenTo, netTo.name);
        }

        return {swapSupported, reasonNotSupported}
    }
}