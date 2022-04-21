import type {Token} from "@token";
import {SwapPools} from "@swappools";
import {Bridge} from "@bridge/bridge";

import type {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import type {ContractTransaction} from "@ethersproject/contracts";

export type ApproveTokenState = {
	token:   Token;
	spender: string;
	amount?: BigNumberish;
}

export type AsyncContractFunction<T> = (args: T) => void

export type TransactionHook<T> = [AsyncContractFunction<T>, ContractTransaction]

export type ContractCallHook<T, U> = [AsyncContractFunction<T>, U]

export type TokenApproveHook<T> = [AsyncContractFunction<T>, ContractTransaction, boolean]

export type TokenAllowanceHook<T> = ContractCallHook<T, BigNumber>

export interface CheckAllowanceArgs {
	token:   Token;
	spender: string;
}

export type CheckAllowanceHook = TokenAllowanceHook<CheckAllowanceArgs>

export interface ApproveTokenSpendArgs {
	token:   Token;
	spender: string;
	amount?: BigNumberish;
}

export type ApproveTokenSpendHook = TransactionHook<ApproveTokenSpendArgs>

export interface ApproveStatusArgs {
	token:      Token;
	spender:    string;
	amount?:    BigNumberish;
	approveTx:  ContractTransaction;
}

export type ApproveStatusHook = [AsyncContractFunction<ApproveStatusArgs>, boolean, BigNumber]

export interface CalculateBridgeSwapOutputArgs {
	tokenFrom:  Token;
	tokenTo:    Token;
	amountFrom: BigNumber;
	chainIdTo:  number;
}

export type CalculateBridgeSwapOutputHook = ContractCallHook<CalculateBridgeSwapOutputArgs, Bridge.BridgeOutputEstimate>

export interface ExecuteBridgeSwapArgs {
	tokenFrom:  Token;
	tokenTo:    Token;
	amountFrom: BigNumber;
	amountTo:   BigNumber;
	chainIdTo:  number;
	addressTo?: string;
}

export type ExecuteBridgeSwapHook = TransactionHook<ExecuteBridgeSwapArgs>

export interface ApproveBridgeSwapArgs {
	token:   Token;
	amount?: BigNumber;
}

export type ApproveBridgeSwapHook = TokenApproveHook<ApproveBridgeSwapArgs>

export type BridgeAllowanceHook = TokenAllowanceHook<Token>

export type LPTokenHook = [SwapPools.SwapPoolToken]

export interface CalculateAddLiquidityArgs {
	lpToken: SwapPools.SwapPoolToken;
	amounts: BigNumberish[] | SwapPools.PoolTokensAmountsMap;
}

export type CalculateAddLiquidityHook = ContractCallHook<CalculateAddLiquidityArgs, BigNumber>

export interface CalculateRemoveLiquidityArgs {
	lpToken: SwapPools.SwapPoolToken;
	amount:  BigNumberish;
}

export type CalculateRemoveLiquidityHook = ContractCallHook<CalculateRemoveLiquidityArgs, BigNumber[]>

export interface CalculateRemoveLiquidityOneTokenArgs {
	lpToken: SwapPools.SwapPoolToken;
	token:   Token;
	amount:  BigNumberish;
}

export type CalculateRemoveLiquidityOneTokenHook = ContractCallHook<CalculateRemoveLiquidityOneTokenArgs, BigNumber>

export interface AddLiquidityArgs {
	lpToken:   SwapPools.SwapPoolToken;
	deadline:  BigNumberish;
	amounts:   BigNumberish[] | SwapPools.PoolTokensAmountsMap;
	minToMint: BigNumberish;
}

export type AddLiquidityHook = TransactionHook<AddLiquidityArgs>

export interface RemoveLiquidityArgs {
	lpToken:    SwapPools.SwapPoolToken;
	deadline:   BigNumberish;
	amount:     BigNumberish;
	minAmounts: BigNumberish[] | SwapPools.PoolTokensAmountsMap;
}

export type RemoveLiquidityHook = TransactionHook<RemoveLiquidityArgs>

export interface RemoveLiquidityOneTokenArgs {
	lpToken:    SwapPools.SwapPoolToken;
	deadline:   BigNumberish;
	amount:     BigNumberish;
	minAmount:  BigNumberish;
	token:		Token;
}

export type RemoveLiquidityOneTokenHook = TransactionHook<RemoveLiquidityOneTokenArgs>

export interface CalculateSwapRateArgs {
	tokenFrom: Token;
	tokenTo:   Token;
	amountIn:  BigNumberish;
}

export type CalculateSwapRateHook = ContractCallHook<CalculateSwapRateArgs, BigNumber>

export interface SwapTokensArgs {
	tokenFrom:    Token;
	tokenTo:   	  Token;
	amountIn:  	  BigNumberish;
	minAmountOut: BigNumberish;
	deadline?:    number;
}

export type SwapTokensHook = TransactionHook<SwapTokensArgs>

export interface ApproveLPTokenArgs {
	lpToken: SwapPools.SwapPoolToken;
	amount?: BigNumberish;
}

export type ApproveLPTokenHook = TokenApproveHook<ApproveLPTokenArgs>

export interface ApproveTokenForLPArgs {
	lpToken: SwapPools.SwapPoolToken;
	token:   Token;
	amount?: BigNumberish;
}

export type ApproveTokenForLPHook = TokenApproveHook<ApproveTokenForLPArgs>

export type LPTokenAllowanceHook = TokenAllowanceHook<SwapPools.SwapPoolToken>

export interface TokenForLPAllowanceArgs {
	lpToken: SwapPools.SwapPoolToken;
	token:   Token;
}

export type TokenForLPAllowanceHook = TokenAllowanceHook<TokenForLPAllowanceArgs>