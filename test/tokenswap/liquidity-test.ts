import {expect} from "chai";

import {
	type Token,
	ChainId,
	Tokens,
	TokenSwap,
	SwapPools
} from "@sdk";


import {getTestAmount} from "@tests/helpers";

import {Zero}      from "@ethersproject/constants";
import {BigNumber} from "@ethersproject/bignumber";
import {formatEther, formatUnits} from "@ethersproject/units";


describe("Liquidity tests", function(this: Mocha.Suite) {
	function makeAmountsArray(t: Token, amount: BigNumber, swapPool: SwapPools.SwapPoolToken): BigNumber[] {
		return swapPool.poolTokens.map((poolTok) => poolTok.isEqual(t) ? amount : Zero)
	}

	describe("calculateAddLiquidity tests", function(this: Mocha.Suite) {
		interface TestCase {
			chainId:         ChainId;
			lpToken:         SwapPools.SwapPoolToken;
			liquidityToken:  Token;
			inputAmount:     BigNumber;
			wantZero:		 boolean;
			wantError:		 boolean;
		}

		function makeTestCase(
			chainId: 		ChainId,
			lpToken: 		SwapPools.SwapPoolToken,
			liquidityToken: Token,
			wantZero:       boolean,
			wantError:      boolean = false,
			inputAmount?:   string
		): TestCase {
			const amtIn: BigNumber = getTestAmount(liquidityToken, chainId, inputAmount);

			return {chainId, lpToken, liquidityToken, inputAmount: amtIn, wantZero, wantError}
		}

		const testCases: TestCase[] = [
			makeTestCase(ChainId.BSC,       SwapPools.BSC_POOL_SWAP_TOKEN,       Tokens.BUSD, false, false, "55"),
			makeTestCase(ChainId.AVALANCHE, SwapPools.AVALANCHE_POOL_SWAP_TOKEN, Tokens.USDC, false, false, "55"),
			makeTestCase(ChainId.CRONOS,    SwapPools.CRONOS_POOL_SWAP_TOKEN,    Tokens.DAI,  false, false, "78"),
			makeTestCase(ChainId.CRONOS,    SwapPools.CRONOS_POOL_SWAP_TOKEN,    Tokens.DAI,  true,  false, "0")
		];

		testCases.forEach(tc => {
			const
				inputAmt:    string = formatUnits(tc.inputAmount, tc.liquidityToken.decimals(tc.chainId)),
				titleParams: string = `Chain ID: ${tc.chainId}, amount: ${inputAmt}`,
				titleSuffix: string = tc.wantError ? "should error out" : `should${tc.wantZero ? "" : " not"} return zero`,
				wantTitle:   string = `calculateAddLiquidity (${titleParams}) ${titleSuffix}`;

			it(wantTitle, async function(this: Mocha.Context) {
				this.slow(3.5 * 1000);
				if (tc.chainId === ChainId.CRONOS) {
					this.timeout(12 * 1000);
				} else {
					this.timeout(8 * 1000);
				}

				const gotProm: Promise<BigNumber> = TokenSwap.calculateAddLiquidity({
					chainId:  tc.chainId,
					lpToken:  tc.lpToken,
					amounts:  makeAmountsArray(tc.liquidityToken, tc.inputAmount, tc.lpToken)
				});

				let got: BigNumber;

				try {
					got = await gotProm;
				} catch (e) {
					if (tc.wantError) {
						return (await expect(gotProm).to.eventually.be.rejected)
					}

					return (await expect(gotProm).to.eventually.not.be.rejected)
				}

				if (tc.wantZero) {
					return expect(got).to.equal(Zero);
				}

				return expect(got).to.be.gt(Zero);
			});
		});
	});

	describe("calculateRemoveLiquidity tests", function(this: Mocha.Suite) {
		interface TestCase {
			chainId:         ChainId;
			lpToken:         SwapPools.SwapPoolToken;
			withdrawAmount:  BigNumber;
			wantZero:		 boolean;
			wantError:		 boolean;
		}

		function makeTestCase(
			chainId: 		 ChainId,
			lpToken: 		 SwapPools.SwapPoolToken,
			wantZero:        boolean,
			wantError:       boolean = false,
			withdrawAmount?: string | BigNumber
		): TestCase {
			let amt: BigNumber;
			if (withdrawAmount && withdrawAmount instanceof BigNumber) {
				amt = withdrawAmount as BigNumber;
			} else {
				amt = getTestAmount(lpToken.baseToken, chainId, withdrawAmount);
			}

			return {chainId, lpToken, withdrawAmount: amt, wantError, wantZero}
		}

		const testCases: TestCase[] = [
			makeTestCase(ChainId.BSC,       SwapPools.BSC_POOL_SWAP_TOKEN,       false, false, "55"),
			makeTestCase(ChainId.AVALANCHE, SwapPools.AVALANCHE_POOL_SWAP_TOKEN, false, false, "550"),
			makeTestCase(ChainId.CRONOS,    SwapPools.CRONOS_POOL_SWAP_TOKEN,    false, false, "15"),
			makeTestCase(ChainId.CRONOS,    SwapPools.CRONOS_POOL_SWAP_TOKEN,    true,  false, "0"),
			makeTestCase(ChainId.CRONOS,    SwapPools.CRONOS_POOL_SWAP_TOKEN,    false, false, BigNumber.from("50000000000000000")),
			makeTestCase(ChainId.CRONOS,    SwapPools.CRONOS_POOL_SWAP_TOKEN,    true,  true,  BigNumber.from("50000000000000000000000000"))
		];

		testCases.forEach(tc => {
			const
				titleParams: string = `Chain ID: ${tc.chainId}, amount: ${formatEther(tc.withdrawAmount)}`,
				titleSuffix: string = tc.wantError ? "should error out" : `should${tc.wantZero ? "" : " not"} return zero`,
				wantTitle:   string = `calculateRemoveLiquidity (${titleParams}) ${titleSuffix}`;

			it(wantTitle, async function(this: Mocha.Context) {
				this.slow(3.5 * 1000);
				if (tc.chainId === ChainId.CRONOS) {
					this.timeout(12 * 1000);
				} else {
					this.timeout(8 * 1000);
				}

				const gotProm: Promise<BigNumber[]> = TokenSwap.calculateRemoveLiquidity({
					chainId:  tc.chainId,
					lpToken:  tc.lpToken,
					amount:   tc.withdrawAmount
				});

				let got: BigNumber[];

				try {
					got = await gotProm;
				} catch (e) {
					if (tc.wantError) {
						return (await expect(gotProm).to.eventually.be.rejected)
					}

					return (await expect(gotProm).to.eventually.not.be.rejected)
				}

				if (tc.wantZero) {
					return Promise.all(got.map(val => expect(val).to.eq(Zero)))
				}

				return Promise.all(got.map(val => expect(val).to.be.gt(Zero)))
			});
		});
	});

	describe("calculateRemoveLiquidityOneToken tests", function(this: Mocha.Suite) {
		interface TestCase {
			chainId:         ChainId;
			lpToken:         SwapPools.SwapPoolToken;
			poolToken:		 Token;
			withdrawAmount:  BigNumber;
			wantZero:		 boolean;
			wantError:		 boolean;
		}

		function makeTestCase(
			chainId: 		 ChainId,
			lpToken: 		 SwapPools.SwapPoolToken,
			poolToken:		 Token,
			wantZero:        boolean,
			wantError:       boolean = false,
			withdrawAmount?: string | BigNumber
		): TestCase {
			let amt: BigNumber;
			if (withdrawAmount && withdrawAmount instanceof BigNumber) {
				amt = withdrawAmount as BigNumber;
			} else {
				amt = getTestAmount(lpToken.baseToken, chainId, withdrawAmount);
			}

			return {chainId, lpToken, poolToken, withdrawAmount: amt, wantError, wantZero}
		}

		const testCases: TestCase[] = [
			makeTestCase(ChainId.BSC,       SwapPools.BSC_POOL_SWAP_TOKEN,       Tokens.BUSD,       false, false, "55"),
			makeTestCase(ChainId.AVALANCHE, SwapPools.AVALANCHE_POOL_SWAP_TOKEN, Tokens.DAI,        false, false, "550"),
			makeTestCase(ChainId.CRONOS,    SwapPools.CRONOS_POOL_SWAP_TOKEN,    Tokens.NUSD,       false, false, "15"),
			makeTestCase(ChainId.CRONOS,    SwapPools.CRONOS_POOL_SWAP_TOKEN,    Tokens.NUSD,       true,  false, "0"),
			makeTestCase(ChainId.CRONOS,    SwapPools.CRONOS_POOL_SWAP_TOKEN,    Tokens.NUSD,       false, false, BigNumber.from("50000000000000000")),
			makeTestCase(ChainId.CRONOS,    SwapPools.CRONOS_POOL_SWAP_TOKEN,    Tokens.NUSD,       true,  true,  BigNumber.from("50000000000000000000000000")),
			makeTestCase(ChainId.METIS,     SwapPools.METIS_ETH_SWAP_TOKEN,      Tokens.METIS_ETH,  false, false, "550"),
		];

		testCases.forEach(tc => {
			const
				titleParams: string = `Chain ID: ${tc.chainId}, amount: ${formatEther(tc.withdrawAmount)}`,
				titleSuffix: string = tc.wantError ? "should error out" : `should${tc.wantZero ? "" : " not"} return zero`,
				wantTitle:   string = `calculateRemoveLiquidityOneToken (${titleParams}) ${titleSuffix}`;

			it(wantTitle, async function(this: Mocha.Context) {
				this.slow(3.5 * 1000);
				if (tc.chainId === ChainId.CRONOS) {
					this.timeout(12 * 1000);
				} else {
					this.timeout(8 * 1000);
				}

				const gotProm: Promise<BigNumber> = TokenSwap.calculateRemoveLiquidityOneToken({
					chainId:  tc.chainId,
					lpToken:  tc.lpToken,
					token:    tc.poolToken,
					amount:   tc.withdrawAmount
				});

				let got: BigNumber;

				try {
					got = await gotProm;
				} catch (e) {
					if (tc.wantError) {
						return (await expect(gotProm).to.eventually.be.rejected)
					}

					return (await expect(gotProm).to.eventually.not.be.rejected)
				}

				if (tc.wantZero) {
					return expect(got).to.eq(Zero)
				}

				return expect(got).to.be.gt(Zero)
			});
		});
	});
});