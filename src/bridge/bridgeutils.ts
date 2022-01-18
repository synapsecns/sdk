import {ChainId} from "../common";
import {Slippages} from "./slippages";
import {BigNumber} from "@ethersproject/bignumber";
import {Zero} from "@ethersproject/constants";
import {Token} from "../token";
import {GenericZapBridgeContract, L2BridgeZapContract} from "../contracts/index";
import {Tokens} from "../tokens";

import {SynapseContracts} from "../common";

export namespace BridgeUtils {
    const ETH_CHAINS = [
        ChainId.OPTIMISM,
        ChainId.BOBA,
        ChainId.MOONBEAM,
        ChainId.ARBITRUM,
        ChainId.AVALANCHE,
        ChainId.HARMONY,
    ];

    export const isL2ETHChain = (chainId: number): boolean => ETH_CHAINS.includes(chainId);

    interface DepositIfChainArgs {
        chainId:     number,
        tokens:      Token[],
        depositEth:  boolean,
        altChainId?: number,
    }

    export const DepositIfChainTokens: DepositIfChainArgs[] = [
        {chainId: ChainId.FANTOM,    tokens: [Tokens.JUMP],  depositEth: false},
        {chainId: ChainId.POLYGON,   tokens: [Tokens.NFD],   depositEth: false},
        {chainId: ChainId.ARBITRUM,  tokens: [Tokens.GMX],   depositEth: false},
        {chainId: ChainId.MOONRIVER, tokens: [Tokens.SOLAR], depositEth: false},
        {chainId: ChainId.AVALANCHE, tokens: [Tokens.AVAX, Tokens.WAVAX], altChainId: ChainId.MOONBEAM, depositEth: true},
        {chainId: ChainId.MOONRIVER, tokens: [Tokens.MOVR, Tokens.WMOVR], altChainId: ChainId.MOONBEAM, depositEth: true},
    ]

    interface BridgeTxArgs {
        slippageCustom:            string,
        slippageSelected:          string,
        infiniteApproval:          boolean,
        transactionDeadline:       number,
        bridgeTransactionDeadline: number,
    }

    export const getBridgeTxArgs = (): BridgeTxArgs => ({
        slippageCustom:   null,
        slippageSelected: Slippages.OneTenth,
        infiniteApproval: true,
        transactionDeadline: getTimeMinutesFromNow(10),
        bridgeTransactionDeadline: getTimeMinutesFromNow(60*24)
    })

    interface BridgeSlippages {
        slippageSelected: string,
        transactionDeadline: number,
        bridgeTransactionDeadline: number,
        minToSwapOrigin: BigNumber,
        minToSwapDest: BigNumber,
        minToSwapDestFromOrigin: BigNumber,
        minToSwapOriginMediumSlippage: BigNumber,
        minToSwapDestMediumSlippage: BigNumber,
        minToSwapDestFromOriginMediumSlippage: BigNumber,
        minToSwapOriginHighSlippage: BigNumber,
        minToSwapDestHighSlippage: BigNumber,
        minToSwapDestFromOriginHighSlippage: BigNumber,
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

    export const makeEasyParams = (
        args: BridgeTxParams,
        chainId: number,
        t: Token
    ): [string, number, string, BigNumber] => [args.addressTo, args.chainIdTo, t.address(chainId), args.amountFrom]

    export const makeEasySubParams = (
        args: BridgeTxParams,
        chainId: number,
        t: Token
    ): [string, number, string] => {
        let x = makeEasyParams(args, chainId, t);
        return [x[0], x[1], x[2]]
    }

    export const depositETHParams = (args: BridgeTxParams): [string, number, BigNumber] => [args.addressTo, args.chainIdTo, args.amountFrom];

    export async function calculateSwapL2Zap(
        zapBridge: GenericZapBridgeContract,
        intermediateToken: string,
        tokenIndexFrom: number,
        tokenIndexTo: number,
        amount: BigNumber
    ): Promise<BigNumber> {
        if ([
            Tokens.WAVAX.address(ChainId.AVALANCHE),
            Tokens.WAVAX.address(ChainId.MOONBEAM),
            Tokens.WMOVR.address(ChainId.MOONBEAM),
            Tokens.WMOVR.address(ChainId.MOONRIVER)
        ].includes(intermediateToken)) {
            console.log(intermediateToken, tokenIndexFrom, tokenIndexTo, amount.toString())
        }

        return (zapBridge as L2BridgeZapContract).calculateSwap(
            intermediateToken,
            tokenIndexFrom,
            tokenIndexTo,
            amount
        )
    }
}