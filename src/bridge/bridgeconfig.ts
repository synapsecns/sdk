import type {Token} from "@token";
import {TokenSwap} from "@tokenswap";

import {pow10} from "@common/utils";

import type {BridgeConfigV3Contract} from "@contracts";
import {BridgeConfigV3ContractInstance} from "@entities";

import {
	BigNumber,
	type BigNumberish
} from "@ethersproject/bignumber";


export interface BridgeConfigSwapFeeParams {
	chainIdFrom: number;
	tokenFrom:   Token;
	chainIdTo:   number;
	amountFrom:  BigNumberish
}

export type CalculateSwapFeeResult = {
	amountFrom: BigNumber;
	bridgeFee:  Promise<BigNumber>;
}

export class BridgeConfig {
	private readonly instance: BridgeConfigV3Contract;

	constructor() {
		this.instance = BridgeConfigV3ContractInstance();
	}

	calculateSwapFee(args: BridgeConfigSwapFeeParams): CalculateSwapFeeResult {
		const {chainIdFrom, chainIdTo, tokenFrom, amountFrom: baseAmountFrom} = args;

		const {bridgeConfigIntermediateToken} = TokenSwap.intermediateTokens(chainIdTo, tokenFrom);

		const intermediateTokenAddress = bridgeConfigIntermediateToken.address(chainIdTo).toLowerCase();

		const
			multiplier: BigNumber = pow10(18 - tokenFrom.decimals(chainIdFrom)),
			amountFrom: BigNumber = BigNumber.from(baseAmountFrom).mul(multiplier);

		const bridgeFee = this.instance["calculateSwapFee(string,uint256,uint256)"](
			intermediateTokenAddress,
			chainIdTo,
			amountFrom
		)

		return {bridgeFee, amountFrom}
	}
}