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