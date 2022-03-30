import {expect} from "chai";
import {step} from "mocha-steps";

import {
    allNetworksSwapTokensMap,
    ChainId,
    Networks,
    NetworkSwappableTokensMap,
    networkSwapTokensMap,
    supportedChainIds,
    Tokens,
    type Token
} from "@sdk";

import {
    type RPCEndpointsConfig,
    configureRPCEndpoints,
    rpcProviderForChain
} from "@sdk/internal/rpcproviders";

import {
    expectIncludes,
    expectLength,
    wrapExpect
} from "@tests/helpers";

import {Web3Provider} from "@ethersproject/providers";
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import {fixWeiValue} from "@common/utils";

const makeWantString = (tc: {want: boolean}, suffix: string="include"): string => `should${tc.want ? "" : " not"} ${suffix}`;


describe("Basic tests", function(this: Mocha.Suite) {
    const numChains: number = 15;

    describe("Check networks", function(this: Mocha.Suite) {
        const
            supportedChains   = supportedChainIds(),
            supportedNetworks = Networks.supportedNetworks(),
            testSuffix: string = `should return ${numChains} entries`;

        it(
            `supportedChainIds ${testSuffix}`,
            wrapExpect(expectLength(supportedChains, numChains))
        );

        it(
            `supportedNetworks ${testSuffix}`,
            wrapExpect(expectLength(supportedNetworks, numChains))
        );
    });

    describe("Test configureRPCEndpoints", function(this: Mocha.Suite) {
        const rpcConfig: RPCEndpointsConfig = {
            [ChainId.BSC]:  {endpoint:"https://bsc-dataseed2.defibit.io"},
            [ChainId.BOBA]: {endpoint:"https://mainnet.boba.network/", batchInterval: 100},
        }

        let
            previousBscEndpoint:  string,
            previousBobaEndpoint: string,
            previousEthEndpoint:  string;

        step("Populate current RPC endpoints", function(this: Mocha.Context) {
            previousBscEndpoint  = (rpcProviderForChain(ChainId.BSC)  as Web3Provider).connection.url;
            previousBobaEndpoint = (rpcProviderForChain(ChainId.BOBA) as Web3Provider).connection.url;
            previousEthEndpoint  = (rpcProviderForChain(ChainId.ETH)  as Web3Provider).connection.url;
        });


        it("configureRPCEndponts should only reconfigure BSC and Boba", function(this: Mocha.Context) {
            configureRPCEndpoints(rpcConfig);

            const
                checkBscEndpoint:   string = (rpcProviderForChain(ChainId.BSC)  as Web3Provider).connection.url,
                checkBobaEndpoint:  string = (rpcProviderForChain(ChainId.BOBA) as Web3Provider).connection.url,
                checkEthEndpoint:   string = (rpcProviderForChain(ChainId.ETH)  as Web3Provider).connection.url;

            expect(checkBscEndpoint).to.not.equal(previousBscEndpoint);
            expect(checkBobaEndpoint).to.not.equal(previousBobaEndpoint);
            expect(checkEthEndpoint).to.equal(previousEthEndpoint);
        });
    });

    describe("Check swappableTokens", function(this: Mocha.Suite) {
        interface TestCase {
            token:   Token;
            want:    boolean;
        }

        interface ChainTestCase extends TestCase {
            chainId: number;
        }

        const
            chainA = ChainId.ETH,
            chainB = ChainId.BSC,
            resA = networkSwapTokensMap(chainA, chainB),
            resB = networkSwapTokensMap(chainA),
            resC = allNetworksSwapTokensMap();

        const symbolsForChain = (m: NetworkSwappableTokensMap, c: number): string[] => m[c].map((t: Token) => t.symbol)

        it(
            "resA should have one map entry",
            wrapExpect(expectLength(Object.keys(resA), 1))
        );

        it(
            "resB should have more than one map entry",
            wrapExpect(expect(Object.keys(resB)).length.to.be.gte(1))
        );

        it(
            `resC should have ${numChains} map entries`,
            wrapExpect(expectLength(Object.keys(resC), numChains))
        );

        describe("Check result of two inputs", function(this: Mocha.Suite) {
            const symbols = symbolsForChain(resA, chainB);

            [
                {token: Tokens.USDC, want: true},
                {token: Tokens.USDT, want: true},
            ].forEach((tc: TestCase) => {
                const testTitle: string = `symbolsForChain(resA, ${chainB}) ${makeWantString(tc)} token ${tc.token.name}`;

                it(
                    testTitle,
                    wrapExpect(expectIncludes(symbols, tc.token.symbol, tc.want))
                );
            });
        });

        describe("Check result of one input", function(this: Mocha.Suite) {
            [
                {token: Tokens.NETH, want: true, chainId: ChainId.ARBITRUM},
                {token: Tokens.NETH, want: true, chainId: ChainId.BOBA},
            ].forEach((tc: ChainTestCase) => {
                const testTitle: string = `network ${Networks.networkName(tc.chainId)} ${makeWantString(tc)} token ${tc.token.name}`;

                it(
                    testTitle,
                    wrapExpect(expectIncludes(symbolsForChain(resB, tc.chainId), tc.token.symbol, tc.want))
                );
            });
        });

        describe("Test supported tokens", function(this: Mocha.Suite) {
            [
                {chainId: ChainId.BSC,          token: Tokens.NUSD,         want: true},
                {chainId: ChainId.BSC,          token: Tokens.BUSD,         want: true},
                {chainId: ChainId.BSC,          token: Tokens.DAI,          want: false},
                {chainId: ChainId.ETH,          token: Tokens.NUSD,         want: true},
                {chainId: ChainId.ETH,          token: Tokens.BUSD,         want: false},
                {chainId: ChainId.ETH,          token: Tokens.DAI,          want: true},
                {chainId: ChainId.ETH,          token: Tokens.ETH,          want: true},
                {chainId: ChainId.ETH,          token: Tokens.WETH,         want: true},
                {chainId: ChainId.AVALANCHE,    token: Tokens.AVWETH,       want: true},
                {chainId: ChainId.AVALANCHE,    token: Tokens.WAVAX,        want: true},
                {chainId: ChainId.MOONRIVER,    token: Tokens.WMOVR,        want: true},
                {chainId: ChainId.CRONOS,       token: Tokens.GOHM,         want: true},
                {chainId: ChainId.METIS,        token: Tokens.SYN,          want: true},
            ].forEach((tc: ChainTestCase) => {
                const
                    net: Networks.Network = Networks.fromChainId(tc.chainId),
                    testTitle: string  = `${net.name} ${makeWantString(tc, "support")} token ${tc.token.name}`,
                    supported: boolean = net.supportsToken(tc.token);

                it(
                    testTitle,
                    function(this: Mocha.Context) {expect(supported).to.equal(tc.want)}
                );
            });
        });
    });

    describe("Test Networks.networkSupportsToken()", function(this: Mocha.Suite) {
        it("BSC should support gOHM", function(this: Mocha.Context) {
            expect(Networks.networkSupportsToken(ChainId.BSC, Tokens.GOHM)).to.be.true;
            expect(Networks.networkSupportsToken(Networks.BSC, Tokens.GOHM)).to.be.true;
        });

        it("ETH should not support BUSD", function(this: Mocha.Context) {
            expect(Networks.networkSupportsToken(ChainId.ETH, Tokens.BUSD)).to.be.false;
            expect(Networks.networkSupportsToken(Networks.ETH, Tokens.BUSD)).to.be.false;
        });
    });

    describe("fixWeiValue tests", function(this: Mocha.Suite) {
        const
            strBn = (n: BigNumberish): string => BigNumber.from(n).toString(),
            bnStr = (s: string): BigNumber => BigNumber.from(s);

        interface TestCase {
            amount:   BigNumberish;
            decimals: number;
            want:     BigNumber;
        }

        const testCases: TestCase[] = [
            {amount: "77000",                decimals: 3,    want: bnStr("77000000000000000000")},
            {amount: "100000000",            decimals: 6,    want: bnStr("100000000000000000000")},
            {amount: "42000000000000",       decimals: 11,   want: bnStr("420000000000000000000")},
            {amount: "104000000000000",      decimals: 12,   want: bnStr("104000000000000000000")},
            {amount: "77000000000000000000", decimals: 18,   want: bnStr("77000000000000000000")}
        ];

        testCases.forEach(tc => {
            const testTitle: string = `fixWeiValue(${strBn(tc.amount)}, ${tc.decimals}) should return ${strBn(tc.want)}`;

            it(testTitle, function(this: Mocha.Context) {
                const got = fixWeiValue(BigNumber.from(tc.amount), tc.decimals);

                expect(got).to.equal(tc.want);
            });
        });
    });

    describe("gasTokenForChain tests", function(this: Mocha.Suite) {
        interface TestCase {
            chainId:     number;
            wantGas:     boolean;
            wantToken:   Token | null;
            wantWrapper: Token | null;
        }

        const testCases: TestCase[] = [
            {chainId: ChainId.AVALANCHE, wantGas: true,  wantToken: Tokens.AVAX, wantWrapper: Tokens.WAVAX},
            {chainId: ChainId.MOONBEAM,  wantGas: false, wantToken: null,        wantWrapper: null},
            {chainId: ChainId.BOBA,      wantGas: true,  wantToken: Tokens.ETH,  wantWrapper: Tokens.WETH},
        ];

        const makeWantStr = (want: boolean, kind: string): string => `should${want ? "" : " not"} have a ${kind} token`;

        testCases.forEach(tc => {
            const
                shouldGasStr:     string = makeWantStr(tc.wantGas, "gas"),
                shouldWrapperStr: string = makeWantStr(tc.wantGas, "wrapper");

            it(`${Networks.networkName(tc.chainId)} ${shouldGasStr}`, function(this: Mocha.Context) {
                const got: Token | null = Tokens.gasTokenForChain(tc.chainId);

                if (tc.wantGas) {
                    expect(got).to.not.be.null;
                    expect(got.isEqual(tc.wantToken)).to.be.true;
                } else {
                    expect(got).to.be.null;
                }
            });

            it(`${Networks.networkName(tc.chainId)} ${shouldWrapperStr}`, function(this: Mocha.Context) {
                const gasToken: Token | null = Tokens.gasTokenForChain(tc.chainId);
                const got:      Token | null = Tokens.gasTokenWrapper(gasToken);

                if (tc.wantGas) {
                    expect(got).to.not.be.null;
                    expect(got.isEqual(tc.wantWrapper)).to.be.true;
                } else {
                    expect(got).to.be.null;
                }
            });
        });
    });
});