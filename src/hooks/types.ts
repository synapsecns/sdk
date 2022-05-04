import type {Token} from "@token";

import type {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import type {ContractTransaction} from "@ethersproject/contracts";

export type ActionHook<T> = [() => void, T]

export type ContractTransactionHook = ActionHook<ContractTransaction>

export type ApproveActionHook = [() => void, ContractTransaction, boolean]

export type AllowanceHook = [BigNumber]

export type NeedsApprovalHook = [boolean, BigNumber]

export type ApproveTokenState = {
	token:   Token;
	spender: string;
	amount?: BigNumberish;
}

export interface UseApproveHook {
	needsApprove:   boolean;
	allowance:      BigNumber;
	execApprove:    () => void;
	approveTx:      ContractTransaction;
	approveStatus:  boolean;
}