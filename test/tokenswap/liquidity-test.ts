import {expect} from "chai";

import {
	type Token,
	ChainId,
	Tokens,
	SwapPools
} from "@sdk";

import {
	calculateAddLiquidity,
	buildAddLiquidityTransaction,
	addLiquidity,
	calculateRemoveLiquidity,
	buildRemoveLiquidityTransaction,
	removeLiquidity,
	calculateRemoveLiquidityOneToken,
	buildRemoveLiquidityOneTokenTransaction,
	removeLiquidityOneToken,
} from "@sdk/tokenswap";


import {getTestAmount, makeFakeWallet} from "@tests/helpers";

import {Zero}      from "@ethersproject/constants";
import {BigNumber} from "@ethersproject/bignumber";
import {formatEther, formatUnits} from "@ethersproject/units";
import {step} from "mocha-steps";


describe("Liquidity tests", function(this: Mocha.Suite) {
	function makeAmountsArray(t: Token, amount: BigNumber, swapPool: SwapPools.SwapPoolToken): BigNumber[] {
		return swapPool.poolTokens.map((poolTok) => poolTok.isEqual(t) ? amount : Zero)
	}

	function setTimeout(ctx: Mocha.Context, chainId: number) {
		ctx.slow(3.5 * 1000);
		if (chainId === ChainId.CRONOS) {
			ctx.timeout(12 * 1000);
		} else {
			ctx.timeout(8 * 1000);
		}
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

			let minToMint: BigNumber;

			const amountsArray = makeAmountsArray(tc.liquidityToken, tc.inputAmount, tc.lpToken);

			step(wantTitle, async function(this: Mocha.Context) {
				setTimeout(this, tc.chainId);

				const gotProm: Promise<BigNumber> = calculateAddLiquidity({
					chainId:  tc.chainId,
					lpToken:  tc.lpToken,
					amounts:  amountsArray,
				});

				let got: BigNumber;

				try {
					got = await gotProm;
					minToMint = got;
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

			if (!tc.wantError && !tc.wantZero) {
				step("buildAddLiquidityTransaction should succeed", async function(this: Mocha.Context) {
					this.timeout(5 * 1000);

					let prom = buildAddLiquidityTransaction({
						chainId:   tc.chainId,
						lpToken:   tc.lpToken,
						amounts:   amountsArray,
						minToMint: minToMint,
						deadline:  BigNumber.from(Math.round((new Date().getTime() / 1000) + 60 * 10)),
					});

					return (await expect(prom).to.eventually.be.fulfilled)
				});

				step("addLiquidity should fail", async function(this: Mocha.Context) {
					setTimeout(this, tc.chainId);

					const fakeWallet = makeFakeWallet(tc.chainId);

					let prom = addLiquidity({
						chainId:   tc.chainId,
						lpToken:   tc.lpToken,
						amounts:   amountsArray,
						minToMint: minToMint,
						deadline:  BigNumber.from(Math.round((new Date().getTime() / 1000) + 60 * 10)),
						signer:    fakeWallet,
					});

					return (await expect(prom).to.eventually.be.rejected)
				});
			}
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

			let minAmounts: BigNumber[];

			step(wantTitle, async function(this: Mocha.Context) {
				setTimeout(this, tc.chainId);

				const gotProm: Promise<BigNumber[]> = calculateRemoveLiquidity({
					chainId:  tc.chainId,
					lpToken:  tc.lpToken,
					amount:   tc.withdrawAmount
				});

				let got: BigNumber[];

				try {
					got = await gotProm;
					minAmounts = got;
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

			if (!tc.wantError && !tc.wantZero) {
				this.timeout(5 * 1000);

				step("buildRemoveLiquidityTransaction should succeed", async function(this: Mocha.Context) {
					let prom = buildRemoveLiquidityTransaction({
						chainId:    tc.chainId,
						lpToken:    tc.lpToken,
						amount:     tc.withdrawAmount,
						minAmounts: minAmounts,
						deadline:   BigNumber.from(Math.round((new Date().getTime() / 1000) + 60 * 10)),
					});

					return (await expect(prom).to.eventually.be.fulfilled)
				});

				step("removeLiquidity should fail", async function(this: Mocha.Context) {
					setTimeout(this, tc.chainId);

					const fakeWallet = makeFakeWallet(tc.chainId);

					let prom = removeLiquidity({
						chainId:    tc.chainId,
						lpToken:    tc.lpToken,
						amount:     tc.withdrawAmount,
						minAmounts: minAmounts,
						deadline:   BigNumber.from(Math.round((new Date().getTime() / 1000) + 60 * 10)),
						signer:     fakeWallet,
					});

					return (await expect(prom).to.eventually.be.rejected)
				});
			}
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

			let minAmount: BigNumber;

			step(wantTitle, async function(this: Mocha.Context) {
				setTimeout(this, tc.chainId);

				const gotProm: Promise<BigNumber> = calculateRemoveLiquidityOneToken({
					chainId:  tc.chainId,
					lpToken:  tc.lpToken,
					token:    tc.poolToken,
					amount:   tc.withdrawAmount
				});

				let got: BigNumber;

				try {
					got = await gotProm;
					minAmount = got;
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

			if (!tc.wantError && !tc.wantZero) {
				step("buildRemoveLiquidityOneTokenTransaction should succeed", async function(this: Mocha.Context) {
					this.timeout(5 * 1000);

					let prom = buildRemoveLiquidityOneTokenTransaction({
						chainId:  tc.chainId,
						lpToken:  tc.lpToken,
						token:    tc.poolToken,
						amount:   tc.withdrawAmount,
						deadline: BigNumber.from(Math.round((new Date().getTime() / 1000) + 60 * 10)),
						minAmount,
					});

					return (await expect(prom).to.eventually.be.fulfilled)
				});

				step("removeLiquidityOneToken should fail", async function(this: Mocha.Context) {
					setTimeout(this, tc.chainId);

					const fakeWallet = makeFakeWallet(tc.chainId);

					let prom = removeLiquidityOneToken({
						chainId:  tc.chainId,
						lpToken:  tc.lpToken,
						token:    tc.poolToken,
						amount:   tc.withdrawAmount,
						deadline: BigNumber.from(Math.round((new Date().getTime() / 1000) + 60 * 10)),
						signer:   fakeWallet,
						minAmount,
					});

					return (await expect(prom).to.eventually.be.rejected)
				});
			}
		});
	});
});