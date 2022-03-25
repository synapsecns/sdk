import {Slippages} from "./slippages";

import {Tokens} from "@tokens";
import {ChainId}   from "@chainid";
import {SwapPools} from "@swappools";
import {tokenSwitch} from "@internal/index";
import type {Token} from "@token";

import type {GenericZapBridgeContract, L2BridgeZapContract} from "@contracts";
import {Zero}      from "@ethersproject/constants";
import {BigNumber, type BigNumberish} from "@ethersproject/bignumber";


export class CanBridgeError extends Error {
    readonly amount: BigNumberish;

    constructor(message: string, amount?: BigNumberish) {
        super(message)

        this.name = this.constructor.name // dafuq
        this.message = message;

        if (amount) {
            this.amount = amount;
        }
    }
}

export namespace BridgeUtils {
    export const L2_ETH_CHAINS: number[] = [
        ChainId.OPTIMISM,
        ChainId.FANTOM,
        ChainId.BOBA,
        ChainId.METIS,
        ChainId.MOONBEAM,
        ChainId.ARBITRUM,
        ChainId.AVALANCHE,
        ChainId.HARMONY,
    ];

    export const GAS_TOKEN_CHAINS: number[] = [
        ChainId.ETH,
        ChainId.OPTIMISM,
        ChainId.BOBA,
        ChainId.ARBITRUM,
    ];

    export const isL2ETHChain          = (chainId: number): boolean => L2_ETH_CHAINS.includes(chainId);
    export const chainSupportsGasToken = (chainId: number): boolean => GAS_TOKEN_CHAINS.includes(chainId);

    interface DepositIfChainArgs {
        chainId:     number;
        tokens:      Token[];
        depositEth:  boolean;
        altChainId?: number;
    }

    export const DepositIfChainTokens: DepositIfChainArgs[] = [
        {chainId: ChainId.FANTOM,    tokens: [Tokens.JUMP],  depositEth: false},
        {chainId: ChainId.POLYGON,   tokens: [Tokens.NFD],   depositEth: false},
        {chainId: ChainId.MOONRIVER, tokens: [Tokens.SOLAR], depositEth: false},
        {chainId: ChainId.AVALANCHE, tokens: [Tokens.AVAX, Tokens.WAVAX], altChainId: ChainId.MOONBEAM, depositEth: true},
        {chainId: ChainId.MOONRIVER, tokens: [Tokens.MOVR, Tokens.WMOVR], altChainId: ChainId.MOONBEAM, depositEth: true},
    ]

    interface BridgeTxArgs {
        slippageCustom:            string;
        slippageSelected:          string;
        infiniteApproval:          boolean;
        transactionDeadline:       number;
        bridgeTransactionDeadline: number;
    }

    export function getBridgeTxArgs(): BridgeTxArgs {
        return {
            slippageCustom:            null,
            slippageSelected:          Slippages.OneTenth,
            infiniteApproval:          true,
            transactionDeadline:       getTimeMinutesFromNow(10),
            bridgeTransactionDeadline: getTimeMinutesFromNow(60*24)
        }
    }

    interface BridgeSlippages {
        slippageSelected:                      string;
        transactionDeadline:                   number;
        bridgeTransactionDeadline:             number;
        minToSwapOrigin:                       BigNumber;
        minToSwapDest:                         BigNumber;
        minToSwapDestFromOrigin:               BigNumber;
        minToSwapOriginMediumSlippage:         BigNumber;
        minToSwapDestMediumSlippage:           BigNumber;
        minToSwapDestFromOriginMediumSlippage: BigNumber;
        minToSwapOriginHighSlippage:           BigNumber;
        minToSwapDestHighSlippage:             BigNumber;
        minToSwapDestFromOriginHighSlippage:   BigNumber;
    }

    export function getSlippages(amountFrom: BigNumber, amountTo: BigNumber): BridgeSlippages {
        const {
            slippageSelected,
            transactionDeadline,
            bridgeTransactionDeadline
        } = getBridgeTxArgs();

        const
            selectedGasArgs = slippageSelected,
            twoTenthGasArgs = Slippages.TwoTenth,
            quarterGasArgs  = Slippages.Quarter;

        const
            minToSwapOrigin         = Slippages.subtractSlippage(amountFrom, selectedGasArgs),
            minToSwapDest           = Slippages.subtractSlippage(amountTo, selectedGasArgs),
            minToSwapDestFromOrigin = Slippages.subtractSlippage(minToSwapDest, selectedGasArgs);

        const
            minToSwapOriginMediumSlippage         = Slippages.subtractSlippage(amountFrom, twoTenthGasArgs),
            minToSwapDestMediumSlippage           = Slippages.subtractSlippage(amountTo, twoTenthGasArgs),
            minToSwapDestFromOriginMediumSlippage = Slippages.subtractSlippage(minToSwapDestMediumSlippage, twoTenthGasArgs);

        const
            minToSwapOriginHighSlippage         = Slippages.subtractSlippage(amountFrom, quarterGasArgs),
            minToSwapDestHighSlippage           = Slippages.subtractSlippage(amountTo, quarterGasArgs),
            minToSwapDestFromOriginHighSlippage = Slippages.subtractSlippage(minToSwapDestHighSlippage, quarterGasArgs);

        return {
            slippageSelected,
            transactionDeadline,
            bridgeTransactionDeadline,
            minToSwapOrigin,
            minToSwapDest,
            minToSwapDestFromOrigin,
            minToSwapOriginMediumSlippage,
            minToSwapDestMediumSlippage,
            minToSwapDestFromOriginMediumSlippage,
            minToSwapOriginHighSlippage,
            minToSwapDestHighSlippage,
            minToSwapDestFromOriginHighSlippage,
        }
    }

    export const subBigNumSafe = (a: BigNumber, b: BigNumber): BigNumber => a.gt(b) ? a.sub(b) : Zero

    export const getTimeMinutesFromNow = (minutesFromNow: number): number =>
        Math.round((new Date().getTime() / 1000) + 60 * minutesFromNow)

    export interface BridgeTxParams {
        addressTo: string,
        chainIdTo: number,
        amountFrom: BigNumber,
    }

    export type EasyParams       = [string, number, string, BigNumber]
    export type EasySubParams    = [string, number, string]
    export type DepositETHParams = [string, number, BigNumber]

    export function makeEasyParams(
        args: BridgeTxParams,
        chainId: number,
        t: Token
    ): EasyParams {
        return [args.addressTo, args.chainIdTo, t.address(chainId), args.amountFrom]
    }

    export function makeEasySubParams(
        args:    BridgeTxParams,
        chainId: number,
        t:       Token
    ): EasySubParams {
        let x = makeEasyParams(args, chainId, t);
        return [x[0], x[1], x[2]]
    }

    export function depositETHParams(args: BridgeTxParams): DepositETHParams {
        return [args.addressTo, args.chainIdTo, args.amountFrom]
    }

    export async function calculateSwapL2Zap(
        zapBridge:         GenericZapBridgeContract,
        intermediateToken: string,
        tokenIndexFrom:    number,
        tokenIndexTo:      number,
        amount:           BigNumber
    ): Promise<BigNumber> {
        return (zapBridge as L2BridgeZapContract).calculateSwap(
            intermediateToken,
            tokenIndexFrom,
            tokenIndexTo,
            amount
        )
    }

    export const isETHLikeToken = (t: Token): boolean =>
        [Tokens.WETH_E.id, Tokens.ONE_ETH.id, Tokens.FTM_ETH.id, Tokens.METIS_ETH.id].includes(t.id)

    export const overrides = (value: BigNumber): any => ({value})

    /**
     * Switch t1 with t3 is t1 is t2
     * @param {Token} t1 token being checked
     * @param {Token} t2 token to check t1 against
     * @param {Token} t3 token to return instead of t1 if t1 equals t2
     */
    const checkReplaceToken = (t1: Token, t2: Token, t3: Token): Token => t1.isEqual(t2) ? t3 : t1;
    export const checkReplaceTokens = (
        check:   Token,
        replace: Token
    ): ((t1: Token, t2: Token) => [Token, Token]) =>
        (t1: Token, t2: Token) => [
            checkReplaceToken(t1, check, replace),
            checkReplaceToken(t2, check, replace)
        ];

    function findSymbol(t1: Token, t2: Token): boolean {
        let compare: Token = t2;
        switch (tokenSwitch(t2)) {
            case Tokens.WETH_E:
                compare = Tokens.AVWETH;
                break;
            case Tokens.WETH:
                compare = Tokens.WETH;
                break;
            default:
                compare = t2.isWrapperToken ? t2.underlyingToken : compare;
                break;
        }

        return t1.isEqual(compare);
    }

    export function makeTokenArgs(chainId: number, t: Token): [Token[], number] {
        let
            toks: Token[] = SwapPools.bridgeSwappableMap[chainId].swappableSwapGroups[t.swapType].poolTokens,
            idx  = toks.findIndex((tok: Token) => findSymbol(tok, t));

        return [toks, idx]
    }
}