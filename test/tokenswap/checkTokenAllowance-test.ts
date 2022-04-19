import {expect} from "chai";
import {ChainId, SwapPools, Token, TokenSwap} from "@sdk";
import {BigNumber} from "@ethersproject/bignumber";


describe("TokenSwap -- checkTokenAllowance tests", function(this: Mocha.Suite) {
	interface TestCase {
		owner:   string;
		spender: string;
		token:   Token;
		chainId: number;
	}

	function makeTestTitle(tc: TestCase): string {
		const
			testSuffix: string = "should not fail",
			testParams: string = `{owner: ${tc.owner}, spender: ${tc.spender}, token: ${tc.token.name}, chainId: ${tc.chainId}}`;

		return `checkTokenAllowance(${testParams}) ${testSuffix}`
	}

	const testCases: TestCase[] = [
		{
			owner:   "0xe972647539816442e0987817DF777a9fd9878650",
			spender: "0x7145a092158c215ff10cce4ddcb84b3a090bdd4e",
			token:   SwapPools.AVALANCHE_POOL_SWAP_TOKEN.baseToken,
			chainId: ChainId.AVALANCHE
		},
	];

	testCases.forEach(tc => {
		const testTitle: string = makeTestTitle(tc);

		it(testTitle, async function(this: Mocha.Context) {
			const gotProm: Promise<BigNumber> = TokenSwap.checkTokenAllowance(tc);

			return (await expect(gotProm).to.eventually.be.fulfilled)
		});
	});
});