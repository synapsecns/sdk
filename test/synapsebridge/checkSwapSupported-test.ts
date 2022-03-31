import {BridgeSwapTestCase, makeBridgeSwapTestCase} from "./bridge_test_utils";
import {Bridge, ChainId, Networks, Tokens} from "@sdk";
import {expectEqual} from "@tests/helpers";

describe("SynapseBridge - checkSwapSupported tests", function(this: Mocha.Suite) {
    type TestCase = BridgeSwapTestCase<boolean>

    [
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.DAI,        ChainId.BSC,       Tokens.USDC,   true),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.ETH,        ChainId.BSC,       Tokens.USDC,   false),
        makeBridgeSwapTestCase(ChainId.ARBITRUM,  Tokens.WETH,       ChainId.ETH,       Tokens.ETH,    true),
        makeBridgeSwapTestCase(ChainId.ARBITRUM,  Tokens.WETH,       ChainId.AVALANCHE, Tokens.ETH,    true),
        makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.SYN,        ChainId.BSC,       Tokens.SYN,    true),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.ETH,        ChainId.BOBA,      Tokens.NETH,   true),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.ETH,        ChainId.BOBA,      Tokens.ETH,    true),
        makeBridgeSwapTestCase(ChainId.BOBA,      Tokens.ETH,        ChainId.ETH,       Tokens.ETH,    true),
        makeBridgeSwapTestCase(ChainId.BOBA,      Tokens.ETH,        ChainId.ETH,       Tokens.NETH,   true),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.ETH,        ChainId.BOBA,      Tokens.USDT,   false),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.NETH,       ChainId.BOBA,      Tokens.USDC,   false),
        makeBridgeSwapTestCase(ChainId.BOBA,      Tokens.ETH,        ChainId.ETH,       Tokens.USDT,   false),
        makeBridgeSwapTestCase(ChainId.BOBA,      Tokens.NETH,       ChainId.ETH,       Tokens.USDC,   false),
        makeBridgeSwapTestCase(ChainId.BOBA,      Tokens.USDC,       ChainId.ETH,       Tokens.USDT,   true),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.USDT,       ChainId.ETH,       Tokens.USDC,   true),
        makeBridgeSwapTestCase(ChainId.BOBA,      Tokens.SYN,        ChainId.ETH,       Tokens.SYN,    true),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.SYN,        ChainId.BOBA,      Tokens.SYN,    true),
        makeBridgeSwapTestCase(ChainId.BOBA,      Tokens.SYN,        ChainId.ETH,       Tokens.NUSD,   false),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.NUSD,       ChainId.BOBA,      Tokens.NUSD,   true),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.SYN,        ChainId.MOONRIVER, Tokens.SYN,    true),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.NUSD,       ChainId.MOONRIVER, Tokens.FRAX,   false),
        makeBridgeSwapTestCase(ChainId.MOONRIVER, Tokens.FRAX,       ChainId.ETH,       Tokens.FRAX,   true),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.FRAX,       ChainId.MOONRIVER, Tokens.FRAX,   true),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.ETH,        ChainId.OPTIMISM,  Tokens.NETH,   true),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.ETH,        ChainId.OPTIMISM,  Tokens.ETH,    true),
        makeBridgeSwapTestCase(ChainId.OPTIMISM,  Tokens.ETH,        ChainId.ETH,       Tokens.ETH,    true),
        makeBridgeSwapTestCase(ChainId.OPTIMISM,  Tokens.ETH,        ChainId.ETH,       Tokens.NETH,   true),
        makeBridgeSwapTestCase(ChainId.AURORA,    Tokens.USDT,       ChainId.BSC,       Tokens.USDC,   true),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.ETH,        ChainId.AURORA,    Tokens.USDC,   false),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.NETH,       ChainId.AURORA,    Tokens.USDC,   false),
        makeBridgeSwapTestCase(Networks.AVALANCHE,Tokens.WETH_E,     ChainId.AURORA,    Tokens.USDC,   false),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.WETH,       ChainId.AVALANCHE, Tokens.WETH_E, true),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.NUSD,       ChainId.AVALANCHE, Tokens.NUSD,   true),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.WETH,       ChainId.HARMONY,   Tokens.ONE_ETH,true),
        makeBridgeSwapTestCase(ChainId.HARMONY,   Tokens.ONE_ETH,    ChainId.ETH,       Tokens.WETH,   true),
        makeBridgeSwapTestCase(ChainId.HARMONY,   Tokens.ONE_ETH,    ChainId.AVALANCHE, Tokens.WETH_E, true),
        makeBridgeSwapTestCase(ChainId.HARMONY,   Tokens.ONE_ETH,    ChainId.OPTIMISM,  Tokens.WETH,   true),
        makeBridgeSwapTestCase(ChainId.OPTIMISM,  Tokens.WETH,       ChainId.HARMONY,   Tokens.ONE_ETH,true),
        makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.AVWETH,     ChainId.AURORA,    Tokens.USDC,   false),
        makeBridgeSwapTestCase(Networks.AVALANCHE,Tokens.AVWETH,     ChainId.ETH,       Tokens.WETH,   true),
        makeBridgeSwapTestCase(ChainId.HARMONY,   Tokens.AVWETH,     ChainId.ETH,       Tokens.WETH,   false),
        makeBridgeSwapTestCase(ChainId.BSC,       Tokens.HIGH,       ChainId.ETH,       Tokens.HIGH,   true),
        makeBridgeSwapTestCase(ChainId.BSC,       Tokens.JUMP,       ChainId.FANTOM,    Tokens.JUMP,   true),
        makeBridgeSwapTestCase(ChainId.BSC,       Tokens.DOG,        ChainId.POLYGON,   Tokens.DOG,    true),
        makeBridgeSwapTestCase(ChainId.POLYGON,   Tokens.NFD,        ChainId.AVALANCHE, Tokens.NFD,    true),
        makeBridgeSwapTestCase(ChainId.OPTIMISM,  Tokens.WETH_E,     ChainId.AVALANCHE, Tokens.WETH_E, false),
        makeBridgeSwapTestCase(ChainId.ARBITRUM,  Tokens.ETH,        ChainId.AVALANCHE, Tokens.WETH_E, true),
        makeBridgeSwapTestCase(ChainId.ARBITRUM,  Tokens.WETH,       ChainId.AVALANCHE, Tokens.WETH_E, true),
        makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.WETH_E,     ChainId.ARBITRUM,  Tokens.ETH,    true),
        makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.WETH_E,     ChainId.ARBITRUM,  Tokens.WETH,   true),
        makeBridgeSwapTestCase(ChainId.OPTIMISM,  Tokens.GOHM,       ChainId.AURORA,    Tokens.GOHM,   false),
        makeBridgeSwapTestCase(ChainId.ARBITRUM,  Tokens.GOHM,       ChainId.AVALANCHE, Tokens.GOHM,   true),
        makeBridgeSwapTestCase(ChainId.HARMONY,   Tokens.GOHM,       ChainId.AVALANCHE, Tokens.GOHM,   true),
        makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.GOHM,       ChainId.BSC,       Tokens.GOHM,   true),
        makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.GOHM,       ChainId.HARMONY,   Tokens.GOHM,   true),
        makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.UST,        ChainId.HARMONY,   Tokens.UST,    true),
        makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.GOHM,       ChainId.HARMONY,   Tokens.UST,    false),
        makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.NEWO,       ChainId.HARMONY,   Tokens.NEWO,   false),
        makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.NEWO,       ChainId.ARBITRUM,  Tokens.GMX,    false),
        makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.NEWO,       ChainId.ARBITRUM,  Tokens.NEWO,   true),
        makeBridgeSwapTestCase(ChainId.ARBITRUM,  Tokens.NEWO,       ChainId.BSC,       Tokens.NEWO,   false),
        makeBridgeSwapTestCase(ChainId.ARBITRUM,  Tokens.NEWO,       ChainId.AVALANCHE, Tokens.GMX,    false),
        makeBridgeSwapTestCase(ChainId.ARBITRUM,  Tokens.NEWO,       ChainId.AVALANCHE, Tokens.NEWO,   true),
        makeBridgeSwapTestCase(ChainId.AURORA,    Tokens.NEWO,       ChainId.HARMONY,   Tokens.NEWO,   false),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.NEWO,       ChainId.BSC,       Tokens.NEWO,   false),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.NEWO,       ChainId.ARBITRUM,  Tokens.NEWO,   true),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.NEWO,       ChainId.AVALANCHE, Tokens.NEWO,   true),
        makeBridgeSwapTestCase(ChainId.ARBITRUM,  Tokens.NEWO,       ChainId.ETH,       Tokens.NEWO,   true),
        makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.NEWO,       ChainId.ETH,       Tokens.NEWO,   true),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.NEWO,       ChainId.HARMONY,   Tokens.NEWO,   false),
        makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.SDT,        ChainId.FANTOM,    Tokens.SDT,    true),
        makeBridgeSwapTestCase(ChainId.ETH,       Tokens.SDT,        ChainId.HARMONY,   Tokens.SDT,    true),
        makeBridgeSwapTestCase(ChainId.BSC,       Tokens.SDT,        ChainId.HARMONY,   Tokens.SDT,    false),
        makeBridgeSwapTestCase(ChainId.ARBITRUM,  Tokens.LUNA,       ChainId.ETH,       Tokens.LUNA,   false),
        makeBridgeSwapTestCase(ChainId.OPTIMISM,  Tokens.LUNA,       ChainId.ARBITRUM,  Tokens.LUNA,   true),
        makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.MULTIJEWEL, ChainId.DFK,       Tokens.JEWEL,  true),
        makeBridgeSwapTestCase(ChainId.AVALANCHE, Tokens.MULTIJEWEL, ChainId.HARMONY,   Tokens.JEWEL,  false),
    ].forEach((tc: TestCase) => {
        const {args, expected} = tc;

        const {
            tokenFrom: { symbol: tokenFromSymbol },
            tokenTo:   { symbol: tokenToSymbol},
            chainIdFrom,
            chainIdTo
        } = args;

        const
            netNameFrom = Networks.fromChainId(chainIdFrom).name,
            netNameTo   = Networks.fromChainId(chainIdTo).name;

        const testTitle = `checkSwapSupported with params ${tokenFromSymbol} on ${netNameFrom} to ${tokenToSymbol} on ${netNameTo} should return ${expected}`;

        it(testTitle, function(this: Mocha.Context) {
            let { chainIdFrom, ...testArgs } = args;
            const bridgeInstance = new Bridge.SynapseBridge({ network: chainIdFrom });

            const [swapAllowed, errReason] = bridgeInstance.swapSupported({ ...testArgs, chainIdTo });
            expectEqual(swapAllowed, expected, errReason);
        });
    });
});