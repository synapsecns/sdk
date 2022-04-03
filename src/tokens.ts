import {
    type Token,
    BaseToken,
    WrapperToken
} from "@token";

import {ChainId, type ChainIdTypeMap} from "@chainid";

import {SwapType} from "@internal/swaptype"
import {tokenSwitch} from "@internal/utils";


export namespace Tokens {
    // Stablecoins

    /**
     * The DAI stablecoin, available on Arbitrum, Avalanche, Binance Smart Chain, Ethereum, and Polygon.
     */
    export const DAI = new BaseToken({
        name:         "Dai",
        symbol:       "DAI",
        decimals:     18,
        addresses: {
            [ChainId.ETH]:       "0x6b175474e89094c44da98b954eedeac495271d0f",
            [ChainId.BSC]:       "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
            [ChainId.POLYGON]:   "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
            [ChainId.BOBA]:      "0xf74195Bb8a5cf652411867c5C2C5b8C2a402be35",
            [ChainId.ARBITRUM]:  "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
            [ChainId.AVALANCHE]: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
            [ChainId.AURORA]:    "0xe3520349F477A5F6EB06107066048508498A291b",
            [ChainId.HARMONY]:   "0xef977d2f931c1978db5f6747666fa1eacb0d0339",
        },
        swapType: SwapType.USD
    });

    export const BUSD = new BaseToken({
        name:        "Binance USD",
        symbol:      "BUSD",
        decimals:    18,
        addresses: {
            [ChainId.BSC]: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        },
        swapType: SwapType.USD
    });

    export const USDC = new BaseToken({
        name:   "USD Circle",
        symbol: "USDC",
        decimals: {
            [ChainId.ETH]:       6,
            [ChainId.BSC]:       18,
            [ChainId.POLYGON]:   6,
            [ChainId.FANTOM]:    6,
            [ChainId.BOBA]:      6,
            [ChainId.METIS]:     6,
            [ChainId.AVALANCHE]: 6,
            [ChainId.ARBITRUM]:  6,
            [ChainId.AURORA]:    6,
            [ChainId.HARMONY]:   6,
        },
        addresses: {
            [ChainId.ETH]:       "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            [ChainId.BSC]:       "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
            [ChainId.POLYGON]:   "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            [ChainId.FANTOM]:    "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
            [ChainId.BOBA]:      "0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc",
            [ChainId.METIS]:     "0xEA32A96608495e54156Ae48931A7c20f0dcc1a21",
            [ChainId.ARBITRUM]:  "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
            [ChainId.AVALANCHE]: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
            [ChainId.AURORA]:    "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802",
            [ChainId.HARMONY]:   "0x985458e523db3d53125813ed68c274899e9dfab4",
        },
        swapType: SwapType.USD
    });

    export const USDT = new BaseToken({
        name:     "USD Tether",
        symbol:   "USDT",
        decimals: {
            [ChainId.ETH]:       6,
            [ChainId.BSC]:       18,
            [ChainId.POLYGON]:   6,
            [ChainId.FANTOM]:    6,
            [ChainId.BOBA]:      6,
            [ChainId.ARBITRUM]:  6,
            [ChainId.AVALANCHE]: 6,
            [ChainId.AURORA]:    6,
            [ChainId.HARMONY]:   6,
        },
        addresses: {
            [ChainId.ETH]:       "0xdac17f958d2ee523a2206206994597c13d831ec7",
            [ChainId.BSC]:       "0x55d398326f99059ff775485246999027b3197955",
            [ChainId.POLYGON]:   "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
            [ChainId.FANTOM]:    "0x049d68029688eabf473097a2fc38ef61633a3c7a",
            [ChainId.BOBA]:      "0x5DE1677344D3Cb0D7D465c10b72A8f60699C062d",
            [ChainId.ARBITRUM]:  "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
            [ChainId.AVALANCHE]: "0xc7198437980c041c805a1edcba50c1ce5db95118",
            [ChainId.AURORA]:    "0x4988a896b1227218e4A686fdE5EabdcAbd91571f",
            [ChainId.HARMONY]:   "0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f",
        },
        swapType: SwapType.USD
    });

    export const UST = new BaseToken({
        symbol:       "UST",
        name:         "TerraUSD",
        decimals:     18,
        addresses: {
            [ChainId.ETH]:       "0x0261018Aa50E28133C1aE7a29ebdf9Bd21b878Cb",
            [ChainId.OPTIMISM]:  "0xFB21B70922B9f6e3C6274BcD6CB1aa8A0fe20B80",
            [ChainId.CRONOS]:    "0x7Bb5c7e3bF0B2a28fA26359667110bB974fF9359",
            [ChainId.BSC]:       "0xb7A6c5f0cc98d24Cf4B2011842e64316Ff6d042c",
            [ChainId.POLYGON]:   "0x565098CBa693b3325f9fe01D41b7A1cd792Abab1",
            [ChainId.FANTOM]:    "0xa0554607e477cdC9d0EE2A6b087F4b2DC2815C22",
            [ChainId.BOBA]:      "0x61A269a9506272D128d79ABfE8E8276570967f00",
            [ChainId.METIS]:     "0x0b5740c6b4a97f90eF2F0220651Cca420B868FfB",
            [ChainId.MOONBEAM]:  "0x5CF84397944B9554A278870B510e86667681ff8D",
            [ChainId.MOONRIVER]: "0xa9D0C0E124F53f4bE1439EBc35A9C73c0e8275fB",
            [ChainId.ARBITRUM]:  "0x13780E6d5696DD91454F6d3BbC2616687fEa43d0",
            [ChainId.AVALANCHE]: "0xE97097dE8d6A17Be3c39d53AE63347706dCf8f43",
            [ChainId.AURORA]:    "0xb1Da21B0531257a7E5aEfa0cd3CbF23AfC674cE1",
            [ChainId.HARMONY]:   "0xa0554607e477cdC9d0EE2A6b087F4b2DC2815C22",
        },
        swapType: SwapType.UST
    });

    // ETH, ETH wrappers, and nETH :D

    /**
     * ETH is the native currency ("gas token") for Ethereum, Optimism,
     * Boba, Arbitrum, and countless other chains
     * (though the four listed are the four currently supported by Synapse Protocol).
     * See {@link WETH} for a "wrapped" ERC20 variant of ETH.
     */
    export const ETH = new BaseToken({
        name:        "Ethereum",
        symbol:      "ETH",
        decimals:    18,
        addresses: {
            [ChainId.ETH]:      "",
            [ChainId.OPTIMISM]: "",
            [ChainId.BOBA]:     "",
            [ChainId.ARBITRUM]: ""
        },
        swapType:   SwapType.ETH,
        isETH:      true,
        isGasToken: true,
    });

    /**
     * nETH is a token involved in the bridge.
     */
    export const NETH = new BaseToken({
        name:        "Synapse nETH",
        symbol:      "nETH",
        decimals:    18,
        addresses: {
            [ChainId.OPTIMISM]:  "0x809DC529f07651bD43A172e8dB6f4a7a0d771036",
            [ChainId.FANTOM]:    "0x67C10C397dD0Ba417329543c1a40eb48AAa7cd00",
            [ChainId.BOBA]:      "0x96419929d7949D6A801A6909c145C8EEf6A40431",
            [ChainId.MOONBEAM]:  "0x3192Ae73315c3634Ffa217f71CF6CBc30FeE349A",
            [ChainId.METIS]:     "0x931B8f17764362A3325D30681009f0eDd6211231",
            [ChainId.ARBITRUM]:  "0x3ea9B0ab55F34Fb188824Ee288CeaEfC63cf908e",
            [ChainId.AVALANCHE]: "0x19E1ae0eE35c0404f835521146206595d37981ae",
            [ChainId.HARMONY]:   "0x0b5740c6b4a97f90eF2F0220651Cca420B868FfB",
        },
        swapType: SwapType.ETH
    });

    export const WETH = new BaseToken({
        name:         "Wrapped ETH",
        symbol:       "WETH",
        decimals:     18,
        addresses: {
            [ChainId.ETH]:      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            [ChainId.OPTIMISM]: "0x121ab82b49B2BC4c7901CA46B8277962b4350204",
            [ChainId.BOBA]:     "0xd203De32170130082896b4111eDF825a4774c18E",
            [ChainId.ARBITRUM]: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        },
        swapType: SwapType.ETH
    });

    export const WETHBEAM = new BaseToken({
        name:     "Moonbeam Wrapped ETH",
        symbol:   "WETH",
        decimals: 18,
        addresses: {
            [ChainId.MOONBEAM]: "0x3192Ae73315c3634Ffa217f71CF6CBc30FeE349A",
        },
        swapType: SwapType.ETH,
    });

    export const WETH_E = new BaseToken({
        name:     "Wrapped Ether",
        symbol:   "WETH.e",
        decimals: 18,
        addresses: {
            [ChainId.AVALANCHE]: "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab",
        },
        swapType: SwapType.ETH,
    });

    export const AVWETH = new BaseToken({
        name:     "AAVE Wrapped Ether",
        symbol:   "AVWETH",
        decimals: 18,
        addresses: {
            [ChainId.AVALANCHE]: "0x53f7c5869a859f0aec3d334ee8b4cf01e3492f21",
        },
        swapType: SwapType.ETH,
    });

    export const ONE_ETH = new BaseToken({
        name:     "Harmony ETH",
        symbol:   "1ETH",
        decimals: 18,
        addresses: {
            [ChainId.HARMONY]: "0x6983d1e6def3690c4d616b13597a09e6193ea013",
        },
        swapType: SwapType.ETH,
    });

    export const FTM_ETH = new BaseToken({
        name:     "Wrapped ETH",
        symbol:   "ETH ",
        decimals: 18,
        addresses: {
            [ChainId.FANTOM]: "0x74b23882a30290451A17c44f4F05243b6b58C76d"
        },
        swapType: SwapType.ETH,
    });

    export const METIS_ETH = new BaseToken({
        name:     "Wrapped ETH",
        symbol:   "ETH",
        decimals:  18,
        addresses: {
            [ChainId.METIS]: "0x420000000000000000000000000000000000000A",
        },
        swapType: SwapType.ETH,
    });

    // Synapse tokens

    export const SYN = new BaseToken({
        name:        "Synapse",
        symbol:      "SYN",
        decimals:    18,
        addresses: {
            [ChainId.ETH]:       "0x0f2d719407fdbeff09d87557abb7232601fd9f29",
            [ChainId.OPTIMISM]:  "0x5A5fFf6F753d7C11A56A52FE47a177a87e431655",
            [ChainId.CRONOS]:    "0xFD0F80899983b8D46152aa1717D76cba71a31616",
            [ChainId.BSC]:       "0xa4080f1778e69467e905b8d6f72f6e441f9e9484",
            [ChainId.POLYGON]:   "0xf8f9efc0db77d8881500bb06ff5d6abc3070e695",
            [ChainId.FANTOM]:    "0xE55e19Fb4F2D85af758950957714292DAC1e25B2",
            [ChainId.BOBA]:      "0xb554A55358fF0382Fb21F0a478C3546d1106Be8c",
            [ChainId.METIS]:     "0x67C10C397dD0Ba417329543c1a40eb48AAa7cd00",
            [ChainId.MOONBEAM]:  "0xF44938b0125A6662f9536281aD2CD6c499F22004",
            [ChainId.MOONRIVER]: "0xd80d8688b02B3FD3afb81cDb124F188BB5aD0445",
            [ChainId.ARBITRUM]:  "0x080f6aed32fc474dd5717105dba5ea57268f46eb",
            [ChainId.AVALANCHE]: "0x1f1E7c893855525b303f99bDF5c3c05Be09ca251",
            [ChainId.AURORA]:    "0xd80d8688b02B3FD3afb81cDb124F188BB5aD0445",
            [ChainId.HARMONY]:   "0xE55e19Fb4F2D85af758950957714292DAC1e25B2",
        },
        swapType: SwapType.SYN
    });

    /**
     * nUSD is a token involved in the bridge.
     */
    export const NUSD = new BaseToken({
        name:        "Synapse nUSD",
        symbol:      "nUSD",
        decimals:    18,
        addresses: {
            [ChainId.ETH]:       "0x1B84765dE8B7566e4cEAF4D0fD3c5aF52D3DdE4F",
            [ChainId.CRONOS]:    "0x396c9c192dd323995346632581BEF92a31AC623b",
            [ChainId.BSC]:       "0x23b891e5c62e0955ae2bd185990103928ab817b3",
            [ChainId.POLYGON]:   "0xb6c473756050de474286bed418b77aeac39b02af",
            [ChainId.FANTOM]:    "0xED2a7edd7413021d440b09D654f3b87712abAB66",
            [ChainId.BOBA]:      "0x6B4712AE9797C199edd44F897cA09BC57628a1CF",
            [ChainId.METIS]:     "0x961318Fc85475E125B99Cc9215f62679aE5200aB",
            [ChainId.ARBITRUM]:  "0x2913E812Cf0dcCA30FB28E6Cac3d2DCFF4497688",
            [ChainId.AVALANCHE]: "0xCFc37A6AB183dd4aED08C204D1c2773c0b1BDf46",
            [ChainId.DFK]:       "0x3AD9DFE640E1A9Cc1D9B0948620820D975c3803a",
            [ChainId.AURORA]:    "0x07379565cD8B0CaE7c60Dc78e7f601b34AF2A21c",
            [ChainId.HARMONY]:   "0xED2a7edd7413021d440b09D654f3b87712abAB66",
        },
        swapType: SwapType.USD,
    });

    export const DFK_USDC = new BaseToken({
        name:     "USD Circle",
        symbol:   "USDC",
        decimals: 18,
        addresses: {
            [ChainId.DFK]: "0x3AD9DFE640E1A9Cc1D9B0948620820D975c3803a"
        },
        swapType: SwapType.USD,
    });

    // chain native coins and wrapper tokens

    /**
     * AVAX is the native currency of Avalanche C-Chain.
     * See {@link WAVAX} for the "wrapped" ERC20 variant of this token.
     */
    export const AVAX = new BaseToken({
        name:     "Avalanche",
        symbol:   "AVAX",
        decimals: 18,
        addresses: {
            [ChainId.AVALANCHE]: "",
        },
        swapType:   SwapType.AVAX,
        isGasToken: true,
    });

    export const WAVAX = new WrapperToken({
        name:     "Wrapped AVAX",
        symbol:   "wAVAX",
        decimals: 18,
        addresses: {
            [ChainId.MOONBEAM]:  "0xA1f8890E39b4d8E33efe296D698fe42Fb5e59cC3",
            [ChainId.AVALANCHE]: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
            [ChainId.DFK]:       "0xB57B60DeBDB0b8172bb6316a9164bd3C695F133a",
        },
        swapType:        SwapType.AVAX,
        underlyingToken: AVAX,
    });

    /**
     * SYN_AVAX (synAVAX) is a "wrapped" ERC20 form of AVAX,
     * and is the supported output Token when bridging AVAX from
     * Avalanche C-Chain or Defi Kingdoms mainnet to Harmony.
     */
    export const SYN_AVAX = new BaseToken({
        name:     "Wrapped AVAX",
        symbol:   "synAVAX",
        decimals: 18,
        addresses: {
            [ChainId.HARMONY]: "0xD9eAA386cCD65F30b77FF175F6b52115FE454fD6"
        },
        swapType: SwapType.AVAX
    });

    export const MULTI_AVAX = new BaseToken({
        name:     "AnySwap/Multi Wrapped AVAX",
        symbol:   "multiAVAX",
        decimals: 18,
        addresses: {
            [ChainId.HARMONY]: "0xb12c13e66ade1f72f71834f2fc5082db8c091358"
        },
        swapType: SwapType.AVAX
    });

    /**
     * MOVR is the native currency of the Moonriver chain.
     * See {@link WMOVR} for the "wrapped" ERC20 variant of this token.
     */
    export const MOVR = new BaseToken({
        name:     "Moonriver",
        symbol:   "MOVR",
        decimals: 18,
        addresses: {
            [ChainId.MOONRIVER]: "",
        },
        swapType:   SwapType.MOVR,
        isGasToken: true,
    });

    export const WMOVR  = new WrapperToken({
        name:     "Wrapped MOVR",
        symbol:   "wMOVR",
        decimals: 18,
        addresses: {
            [ChainId.MOONBEAM]:  "0x1d4C2a246311bB9f827F4C768e277FF5787B7D7E",
            [ChainId.MOONRIVER]: "0x98878b06940ae243284ca214f92bb71a2b032b8a",
        },
        swapType:        SwapType.MOVR,
        underlyingToken: MOVR,
    });

    /**
     * GAS_JEWEL is the native currency of the DeFi Kingdoms chain.
     * See {@link JEWEL} for the "wrapped" ERC20 variant of this token.
     */
    export const GAS_JEWEL = new BaseToken({
        name:     "JEWEL",
        symbol:   "JEWEL",
        decimals: 18,
        addresses: {
            [ChainId.DFK]: "",
        },
        swapType:   SwapType.JEWEL,
        isGasToken: true,
    });

    /**
     * JEWEL is a "wrapped" ERC20 variant of {@link GAS_JEWEL}.
     * In the context of Synapse Protocol, JEWEL is primarily used for
     * bridging the native currency of the DeFi Kingdoms mainnet, {@link GAS_JEWEL},
     * to and from the Harmony and Avalanche networks.
     */
    export const JEWEL = new WrapperToken({
        name:    "JEWEL",
        symbol:  "JEWEL",
        decimals: 18,
        addresses: {
            [ChainId.AVALANCHE]: "0x997Ddaa07d716995DE90577C123Db411584E5E46",
            [ChainId.DFK]:       "0xCCb93dABD71c8Dad03Fc4CE5559dC3D89F67a260",
            [ChainId.HARMONY]:   "0x72Cb10C6bfA5624dD07Ef608027E366bd690048F"
        },
        swapType:        SwapType.JEWEL,
        underlyingToken: GAS_JEWEL,
    });

    /**
     * SYN_JEWEL ("synJewel") is an ERC20 Token used by Synapse Protocol to
     * bridge and "wrap" the native currency of the DeFi Kingdoms mainnet, {@link GAS_JEWEL},
     * to and from Avalanche C-Chain.
     *
     * synJEWEL is supported on Harmony as an "intermediate" token; for example, it is
     * possible to bridge {@link JEWEL} from Harmony to synJEWEL on Avalanche, and then
     * bridge synJEWEL to native {@link GAS_JEWEL} on the DeFi Kingdoms mainnet.
     */
    export const SYN_JEWEL = new BaseToken({
        name:    "synJEWEL",
        symbol:  "synJEWEL",
        decimals: 18,
        addresses: {
            [ChainId.HARMONY]:   "0x28b42698Caf46B4B012CF38b6C75867E0762186D"
        },
        swapType: SwapType.JEWEL
    });

    export const MULTIJEWEL = new BaseToken({
        name:     "Multichain JEWEL",
        symbol:   "multiJEWEL",
        decimals: 18,
        addresses: {
            [ChainId.AVALANCHE]: "0x4f60a160D8C2DDdaAfe16FCC57566dB84D674BD6",
        },
        swapType: SwapType.JEWEL
    });

    export const XJEWEL = new BaseToken({
        name:    "xJEWEL",
        symbol:  "xJEWEL",
        decimals: 18,
        addresses: {
            [ChainId.DFK]:     "0x77f2656d04E158f915bC22f07B779D94c1DC47Ff",
            [ChainId.HARMONY]: "0xA9cE83507D872C5e1273E745aBcfDa849DAA654F"
        },
        swapType: SwapType.XJEWEL
    });

    // non-Synapse, non-stablecoin tokens

    export const GOHM = new BaseToken({
        name:     "Olympus DAO",
        symbol:   "gOHM",
        decimals: 18,
        addresses: {
            [ChainId.ETH]:       "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f",
            [ChainId.OPTIMISM]:  "0x0b5740c6b4a97f90eF2F0220651Cca420B868FfB",
            [ChainId.CRONOS]:    "0xbB0A63A6CA2071c6C4bcAC11a1A317b20E3E999C",
            [ChainId.BSC]:       "0x88918495892BAF4536611E38E75D771Dc6Ec0863",
            [ChainId.POLYGON]:   "0xd8cA34fd379d9ca3C6Ee3b3905678320F5b45195",
            [ChainId.FANTOM]:    "0x91fa20244Fb509e8289CA630E5db3E9166233FDc",
            [ChainId.BOBA]:      "0xd22C0a4Af486C7FA08e282E9eB5f30F9AaA62C95",
            [ChainId.METIS]:     "0xFB21B70922B9f6e3C6274BcD6CB1aa8A0fe20B80",
            [ChainId.MOONBEAM]:  "0xD2666441443DAa61492FFe0F37717578714a4521",
            [ChainId.MOONRIVER]: "0x3bF21Ce864e58731B6f28D68d5928BcBEb0Ad172",
            [ChainId.ARBITRUM]:  "0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1",
            [ChainId.AVALANCHE]: "0x321E7092a180BB43555132ec53AaA65a5bF84251",
            [ChainId.HARMONY]:   "0x67C10C397dD0Ba417329543c1a40eb48AAa7cd00",
        },
        swapType: SwapType.OHM,
    });

    export const HIGH = new BaseToken({
        name:    "Highstreet",
        symbol:  "HIGH",
        decimals: 18,
        addresses: {
            [ChainId.ETH]: "0x71Ab77b7dbB4fa7e017BC15090b2163221420282",
            [ChainId.BSC]: "0x5f4bde007dc06b867f86ebfe4802e34a1ffeed63",
        },
        swapType: SwapType.HIGH
    });

    export const JUMP = new BaseToken({
        name:    "HyperJump",
        symbol:  "JUMP",
        decimals: 18,
        addresses: {
            [ChainId.BSC]:    "0x130025ee738a66e691e6a7a62381cb33c6d9ae83",
            [ChainId.FANTOM]: "0x78DE9326792ce1d6eCA0c978753c6953Cdeedd73",
        },
        swapType: SwapType.JUMP
    });

    export const DOG = new BaseToken({
        name:    "The Doge NFT",
        symbol:  "DOG",
        decimals: 18,
        addresses: {
            [ChainId.ETH]:     "0xBAac2B4491727D78D2b78815144570b9f2Fe8899",
            [ChainId.BSC]:     "0xaa88c603d142c371ea0eac8756123c5805edee03",
            [ChainId.POLYGON]: "0xeee3371b89fc43ea970e908536fcddd975135d8a",
        },
        swapType: SwapType.DOG
    });

    export const NFD = new BaseToken({
        name:         "Feisty Doge",
        symbol:       "NFD",
        decimals:     18,
        addresses: {
            [ChainId.BSC]:       "0x0fe9778c005a5a6115cbe12b0568a2d50b765a51",   // redeem
            [ChainId.POLYGON]:   "0x0a5926027d407222f8fe20f24cb16e103f617046",   // deposit
            [ChainId.AVALANCHE]: "0xf1293574ee43950e7a8c9f1005ff097a9a713959",   // redeem
        },
        swapType: SwapType.NFD,
    });

    // FRAX/synFrax

    export const FRAX = new BaseToken({
        name:     "Frax",
        symbol:   "FRAX",
        decimals: 18,
        addresses: {
            [ChainId.ETH]:       "0x853d955acef822db058eb8505911ed77f175b99e",
            [ChainId.MOONBEAM]:  "",
            [ChainId.MOONRIVER]: "0x1a93b23281cc1cde4c4741353f3064709a16197d",
            [ChainId.HARMONY]:   "0xFa7191D292d5633f702B0bd7E3E3BcCC0e633200",
        },
        swapType: SwapType.FRAX,
    });

    export const SYN_FRAX = new BaseToken({
        name:      "Synapse Frax",
        symbol:    "synFRAX",
        decimals:  18,
        addresses: {
            [ChainId.FANTOM]:    "0x1852F70512298d56e9c8FDd905e02581E04ddb2a",
            [ChainId.MOONBEAM]:  "0xDd47A348AB60c61Ad6B60cA8C31ea5e00eBfAB4F",
            [ChainId.MOONRIVER]: "0xE96AC70907ffF3Efee79f502C985A7A21Bce407d",
            [ChainId.HARMONY]:   "0x1852F70512298d56e9c8FDd905e02581E04ddb2a",
        },
        swapType: SwapType.FRAX,
    });

    export const SOLAR = new BaseToken({
        name:     "Vested SolarBeam",
        symbol:   "veSOLAR",
        decimals: 18,
        addresses: {
            [ChainId.MOONBEAM]:  "0x0DB6729C03C85B0708166cA92801BcB5CAc781fC",
            [ChainId.MOONRIVER]: "0x76906411D07815491A5E577022757aD941fb5066",
        },
        swapType: SwapType.SOLAR,
    });

    export const GMX = new BaseToken({
        name:     "GMX",
        symbol:   "GMX",
        decimals: 18,
        addresses: {
            [ChainId.ARBITRUM]:  "0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a",
            [ChainId.AVALANCHE]: "0x62edc0692bd897d2295872a9ffcac5425011c661",
        },
        wrapperAddresses: {
            [ChainId.AVALANCHE]: "0x20A9DC684B4d0407EF8C9A302BEAaA18ee15F656",
        },
        swapType: SwapType.GMX,
    });

    export const NEWO = new BaseToken({
        name:    "New Order",
        symbol:  "NEWO",
        decimals: 18,
        addresses: {
            [ChainId.ETH]:       "0x98585dFc8d9e7D48F0b1aE47ce33332CF4237D96",
            [ChainId.ARBITRUM]:  "0x0877154a755B24D499B8e2bD7ecD54d3c92BA433",
            [ChainId.AVALANCHE]: "0x4Bfc90322dD638F81F034517359BD447f8E0235a",
        },
        swapType: SwapType.NEWO,
    });

    export const SDT = new BaseToken({
        name:     "Stake DAO Token",
        symbol:   "SDT",
        decimals: 18,
        addresses: {
            [ChainId.ETH]:       "0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f",
            [ChainId.FANTOM]:    "0xE3c82A836Ec85311a433fBd9486EfAF4b1AFbF48",
            [ChainId.AVALANCHE]: "0xCCBf7c451F81752F7d2237F2c18C371E6e089E69",
            [ChainId.HARMONY]:   "0xE3c82A836Ec85311a433fBd9486EfAF4b1AFbF48",
        },
        swapType: SwapType.SDT,
    });

    export const LUNA = new BaseToken({
        name:     "LUNA",
        symbol:   "LUNA",
        decimals: 18,
        addresses: {
            [ChainId.OPTIMISM]: "0x931B8f17764362A3325D30681009f0eDd6211231",
            [ChainId.ARBITRUM]: "0x1A4dA80967373fd929961e976b4b53ceeC063a15",
        },
        swapType: SwapType.LUNA,
    });

    export const USDB = new BaseToken({
        name:     "USD Balance",
        symbol:   "USDB",
        decimals: 18,
        addresses: {
            [ChainId.ETH]:       "0x02b5453d92b730f29a86a0d5ef6e930c4cf8860b",
            [ChainId.BSC]:       "0xc8699abbba90c7479dedccef19ef78969a2fc608",
            [ChainId.POLYGON]:   "0xfa1fbb8ef55a4855e5688c0ee13ac3f202486286",
            [ChainId.FANTOM]:    "0x6fc9383486c163fa48becdec79d6058f984f62ca",
            [ChainId.MOONRIVER]: "0x3e193c39626bafb41ebe8bdd11ec7cca9b3ec0b2",
            [ChainId.AVALANCHE]: "0x5ab7084cb9d270c2cb052dd30dbecbca42f8620c"
        },
        swapType: SwapType.USDB
    });

    export const mintBurnTokens: Token[] = [
        NUSD,      SYN,        NETH,
        HIGH,      DOG,        JUMP,
        FRAX,      SYN_FRAX,   NFD,
        GOHM,      SOLAR,      GMX,
        UST,       NEWO,       SDT,
        LUNA,      USDB,       SYN_AVAX,
        GAS_JEWEL, JEWEL,      SYN_JEWEL,
        XJEWEL,    MULTIJEWEL, DFK_USDC
    ];

    export const isMintBurnToken = (token: Token): boolean => mintBurnTokens.map((t) => t.id).includes(token.id)

    export const ChainGasTokensMap: ChainIdTypeMap<Token> = {
        [ChainId.ETH]:        ETH,
        [ChainId.OPTIMISM]:   ETH,
        [ChainId.BOBA]:       ETH,
        [ChainId.ARBITRUM]:   ETH,
        [ChainId.AVALANCHE]:  AVAX,
        [ChainId.DFK]:        GAS_JEWEL,
    };

    /**
     * Returns the native currency Token ("gas token") for a given chain, if
     * it's supported by Synapse Protocol.
     * @param chainId
     */
    export const gasTokenForChain = (chainId: number): Token | null => {
        if (chainId in ChainGasTokensMap) {
            return ChainGasTokensMap[chainId]
        }

        return null
    }

    /**
     * Returns the "wrapper" Token for a given native currency Token ("gas token")
     * if such Token exists and is supported by Synapse Protocol.
     * @param gasToken
     */
    export const gasTokenWrapper = (gasToken: Token): Token | null => {
        if (!gasToken) {
            return null
        }

        switch (tokenSwitch(gasToken)) {
            case AVAX:
                return WAVAX
            case MOVR:
                return WMOVR
            case ETH:
                return WETH
            case GAS_JEWEL:
                return JEWEL
        }

        return null
    }

    export const AllTokens: Token[] = [
        DAI, BUSD, USDC, USDT, UST,
        ETH, NETH, WETH, WETHBEAM, WETH_E,
        AVWETH, ONE_ETH, FTM_ETH, METIS_ETH,
        SYN, NUSD, AVAX, WAVAX, MOVR, WMOVR,
        GOHM, HIGH, JUMP, DOG, NFD, FRAX,
        SYN_FRAX, SOLAR, GMX, NEWO, SDT,
        LUNA, USDB, SYN_AVAX, GAS_JEWEL, JEWEL,
        SYN_JEWEL, XJEWEL, MULTIJEWEL, DFK_USDC
    ];
}