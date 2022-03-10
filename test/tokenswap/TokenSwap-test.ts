import {
    ChainId,
    Networks,
    Tokens,
    TokenSwap,
    supportedChainIds,
    type Token
} from "@sdk";

import {
    wrapExpect,
    expectProperty,
    expectLength,
    expectUndefined,
    expectBoolean,
} from "@tests/helpers";


describe("TokenSwap -- Synchronous Tests", function(this: Mocha.Suite) {
    describe("intermediateTokens tests", function(this: Mocha.Suite) {
        interface TestCase {
            chainId: number;
            token:   Token;
            wantA:   Token;
            wantB:   Token;
        }

        [
            {chainId: ChainId.ETH,       token: Tokens.FRAX,     wantA: undefined,   wantB: Tokens.FRAX},
            {chainId: ChainId.ETH,       token: Tokens.SYN_FRAX, wantA: undefined,   wantB: Tokens.FRAX},
            {chainId: ChainId.HARMONY,   token: Tokens.FRAX,     wantA: undefined,   wantB: Tokens.SYN_FRAX},
            {chainId: ChainId.ETH,       token: Tokens.NETH,     wantA: Tokens.NETH, wantB: Tokens.WETH},
            {chainId: ChainId.ARBITRUM,  token: Tokens.NETH,     wantA: Tokens.NETH, wantB: Tokens.NETH},
            {chainId: ChainId.BSC,       token: Tokens.BUSD,     wantA: Tokens.NUSD, wantB: Tokens.NUSD},
            {chainId: ChainId.AVALANCHE, token: Tokens.GOHM,     wantA: Tokens.GOHM, wantB: Tokens.GOHM},

        ].forEach((tc: TestCase) => {
            const
                testPrefix: string = `intermediateTokens() with token ${tc.token.symbol} and Chain ID ${tc.chainId} should return`,
                testWant:   string = `intermediateToken === ${tc.wantA?.symbol ?? 'undefined'}, bridgeConfigIntermediateToken === ${tc.wantB.symbol}`,
                testTitle:  string = `${testPrefix} ${testWant}`;

            it(testTitle, function(this: Mocha.Context) {
                const got = TokenSwap.intermediateTokens(tc.chainId, tc.token);

                typeof tc.wantA === "undefined"
                    ? expectUndefined(tc.wantA, true)
                    : expectBoolean(tc.wantA.isEqual(got.intermediateToken), true);

                expectBoolean(tc.wantB.isEqual(got.bridgeConfigIntermediateToken), true);
            })
        })
    })

    describe("detailedTokenSwapMap test", function(this: Mocha.Suite) {
        const
            allChains   = supportedChainIds(),
            detailedMap = TokenSwap.detailedTokenSwapMap();

        it(`should have ${allChains.length} entries`, function() {
            expectLength(Object.keys(detailedMap), allChains.length);
        })

        interface TokenOnChain {
            chainId: ChainId,
            token:   Token,
        }

        interface TestCase {
            chainId:       ChainId,
            chainTokens:   TokenOnChain[],
        }

        const findTokenMap = (
            tok:     Token,
            toksMap: {[p: number]: Token[], token: Token}[]
        ): {[p: number]: Token[], token: Token} | undefined =>
            toksMap.find((sm) => sm.token.isEqual(tok));

        [
            {
                chainId:       ChainId.BSC,
                chainTokens:   [
                    {chainId: ChainId.ETH,       token: Tokens.USDT},
                    {chainId: ChainId.ETH,       token: Tokens.BUSD},
                    {chainId: ChainId.AVALANCHE, token: Tokens.NUSD},
                    {chainId: ChainId.HARMONY,   token: Tokens.GOHM},
                ],
            },
            {
                chainId:       ChainId.ETH,
                chainTokens:   [
                    {chainId: ChainId.BSC,       token: Tokens.USDC},
                    {chainId: ChainId.AVALANCHE, token: Tokens.GOHM},
                    {chainId: ChainId.AVALANCHE, token: Tokens.NUSD},
                    {chainId: ChainId.HARMONY,   token: Tokens.GOHM},
                ],
            },
            {
                chainId:       ChainId.FANTOM,
                chainTokens:   [
                    {chainId: ChainId.AVALANCHE, token: Tokens.FTM_ETH},
                    {chainId: ChainId.AVALANCHE, token: Tokens.NUSD},
                    {chainId: ChainId.HARMONY,   token: Tokens.GOHM},
                ],
            }
        ].forEach((tc: TestCase) => {
            const describeTitle: string = `${Networks.networkName(tc.chainId)} needs certain results`;

            describe(describeTitle, function(this: Mocha.Suite) {
                const toksMap = detailedMap[tc.chainId];

                it(
                    `detailedMap[${tc.chainId}] should not be undefined`,
                    wrapExpect(expectUndefined(toksMap, false))
                )

                tc.chainTokens.forEach(tok => {
                    const
                        testTitle: string = `should be able to send token ${tok.token.name} to ${Networks.networkName(tok.chainId)}`,
                        tokMap            = findTokenMap(tok.token, toksMap);

                    it(
                        testTitle,
                        wrapExpect(expectProperty(tokMap, tok.chainId.toString()))
                    )
                })
            })
        })
    })
})