import type {Token} from "../token";

import {
    BaseToken,
    WrappedToken,
} from "../token";

import {
    ChainId,
} from "../common";

import {SwapType} from "../common/swaptype";

export namespace Tokens {
    const KEEP_THIS_HERE = new BaseToken({
        name:      "",
        symbol:    "",
        decimals:  18,
        addresses: {},
        swapType:  SwapType.USD,
    });

    // Stablecoins

    /**
     * The DAI stablecoin, available on Arbitrum, Avalanche, Binance Smart Chain, Ethereum, and Polygon.
     */
    export const DAI = new BaseToken({
        name:         'Dai',
        symbol:       'DAI',
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
        name:        'Binance USD',
        symbol:      'BUSD',
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
        symbol:       'UST',
        name:         'TerraUSD',
        decimals:     18,
        addresses: {
            [ChainId.BSC]: "0x23396cf899ca06c4472205fc903bdb4de249d6f",
        },
        swapType: SwapType.USD
    });

    // ETH, ETH wrappers, and nETH :D

    export const ETH = new BaseToken({
        name:        'Ethereum',
        symbol:      'ETH',
        decimals:    18,
        addresses: {
            [ChainId.ETH]:      '',
            [ChainId.OPTIMISM]: '',
            [ChainId.BOBA]:     '',
            [ChainId.ARBITRUM]: ''
        },
        swapType: SwapType.ETH,
        isETH:    true,
    });

    /**
     * nETH is a token involved in the bridge.
     */
    export const NETH = new BaseToken({
        name:        'Synapse nETH',
        symbol:      'nETH',
        decimals:    18,
        addresses: {
            [ChainId.OPTIMISM]:  "0x809DC529f07651bD43A172e8dB6f4a7a0d771036",
            [ChainId.FANTOM]:    "0x67C10C397dD0Ba417329543c1a40eb48AAa7cd00",
            [ChainId.BOBA]:      "0x96419929d7949D6A801A6909c145C8EEf6A40431",
            [ChainId.MOONBEAM]:  "0x3192Ae73315c3634Ffa217f71CF6CBc30FeE349A",
            [ChainId.ARBITRUM]:  "0x3ea9B0ab55F34Fb188824Ee288CeaEfC63cf908e",
            [ChainId.AVALANCHE]: "0x19E1ae0eE35c0404f835521146206595d37981ae",
            [ChainId.HARMONY]:   "0x0b5740c6b4a97f90eF2F0220651Cca420B868FfB",
        },
        swapType: SwapType.ETH
    });

    export const WETH = new BaseToken({
        name:         'Wrapped ETH',
        symbol:       'WETH', // SHOULD BE WETH
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
    })

    export const WETH_E = new BaseToken({
        name:     "Wrapped Ether",
        symbol:   "WETH.e",
        decimals: 18,
        addresses: {
            [ChainId.AVALANCHE]: "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab",
        },
        swapType: SwapType.ETH,
    })

    export const AVWETH = new BaseToken({
        name:     "AAVE Wrapped Ether",
        symbol:   "AVWETH",
        decimals: 18,
        addresses: {
            [ChainId.AVALANCHE]: "0x53f7c5869a859f0aec3d334ee8b4cf01e3492f21",
        },
        swapType: SwapType.ETH,
    })

    export const ONE_ETH = new BaseToken({
        name:     "Harmony ETH",
        symbol:   "1ETH",
        decimals: 18,
        addresses: {
            [ChainId.HARMONY]: "0x6983d1e6def3690c4d616b13597a09e6193ea013",
        },
        swapType: SwapType.ETH,
    })

    export const FTM_ETH = new BaseToken({
        name:     "Wrapped ETH",
        symbol:   "ETH ",
        decimals: 18,
        addresses: {
            [ChainId.FANTOM]: "0x74b23882a30290451A17c44f4F05243b6b58C76d"
        },
        swapType: SwapType.ETH,
    })

    // Synapse tokens

    export const SYN = new BaseToken({
        name:        'Synapse',
        symbol:      'SYN',
        decimals:    18,
        addresses: {
            [ChainId.ETH]:       "0x0f2d719407fdbeff09d87557abb7232601fd9f29",
            [ChainId.OPTIMISM]:  "0x5A5fFf6F753d7C11A56A52FE47a177a87e431655",
            [ChainId.BSC]:       "0xa4080f1778e69467e905b8d6f72f6e441f9e9484",
            [ChainId.POLYGON]:   "0xf8f9efc0db77d8881500bb06ff5d6abc3070e695",
            [ChainId.FANTOM]:    "0xE55e19Fb4F2D85af758950957714292DAC1e25B2",
            [ChainId.BOBA]:      "0xb554A55358fF0382Fb21F0a478C3546d1106Be8c",
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
        name:        'Synapse nUSD',
        symbol:      'nUSD',
        decimals:    18,
        addresses: {
            [ChainId.ETH]:       "0x1B84765dE8B7566e4cEAF4D0fD3c5aF52D3DdE4F",
            [ChainId.BSC]:       "0x23b891e5c62e0955ae2bd185990103928ab817b3",
            [ChainId.POLYGON]:   "0xb6c473756050de474286bed418b77aeac39b02af",
            [ChainId.FANTOM]:    "0xED2a7edd7413021d440b09D654f3b87712abAB66",
            [ChainId.BOBA]:      "0x6B4712AE9797C199edd44F897cA09BC57628a1CF",
            [ChainId.ARBITRUM]:  "0x2913E812Cf0dcCA30FB28E6Cac3d2DCFF4497688",
            [ChainId.AVALANCHE]: "0xCFc37A6AB183dd4aED08C204D1c2773c0b1BDf46",
            [ChainId.AURORA]:    "0x07379565cD8B0CaE7c60Dc78e7f601b34AF2A21c",
            [ChainId.HARMONY]:   "0xED2a7edd7413021d440b09D654f3b87712abAB66",
        },
        swapType: SwapType.USD,
    });

    // chain native coins and wrapper tokens

    export const AVAX = new BaseToken({
        name:     "Avalanche",
        symbol:   "AVAX",
        decimals: 18,
        addresses: {
            [ChainId.AVALANCHE]: "",
        },
        swapType: SwapType.AVAX,
    })

    export const WAVAX = new WrappedToken({
        name:     "Wrapped AVAX",
        symbol:   "wAVAX",
        decimals: 18,
        addresses: {
            [ChainId.AVALANCHE]: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
            [ChainId.MOONBEAM]:  "0xA1f8890E39b4d8E33efe296D698fe42Fb5e59cC3",
        },
        swapType:        SwapType.AVAX,
        underlyingToken: AVAX,
    })

    export const MOVR = new BaseToken({
        name:     "Moonriver",
        symbol:   "MOVR",
        decimals: 18,
        addresses: {
            [ChainId.MOONRIVER]: "",
        },
        swapType: SwapType.MOVR,
    })

    export const WMOVR  = new WrappedToken({
        name:     "Wrapped MOVR",
        symbol:   "wMOVR",
        decimals: 18,
        addresses: {
            [ChainId.MOONBEAM]:  "0x1d4C2a246311bB9f827F4C768e277FF5787B7D7E",
            [ChainId.MOONRIVER]: "0x98878b06940ae243284ca214f92bb71a2b032b8a",
        },
        swapType:        SwapType.MOVR,
        underlyingToken: MOVR,
    })

    // non-Synapse, non-stablecoin tokens

    export const GOHM = new BaseToken({
        name:     "Olympus DAO",
        symbol:   "gOHM",
        decimals: 18,
        addresses: {
            [ChainId.ETH]:       '0x0ab87046fBb341D058F17CBC4c1133F25a20a52f',
            [ChainId.BSC]:       '0x88918495892BAF4536611E38E75D771Dc6Ec0863',
            [ChainId.POLYGON]:   '0xd8cA34fd379d9ca3C6Ee3b3905678320F5b45195',
            [ChainId.FANTOM]:    '0x91fa20244Fb509e8289CA630E5db3E9166233FDc',
            [ChainId.BOBA]:      '0xd22C0a4Af486C7FA08e282E9eB5f30F9AaA62C95',
            [ChainId.MOONBEAM]:  '0xD2666441443DAa61492FFe0F37717578714a4521',
            [ChainId.MOONRIVER]: '0x3bF21Ce864e58731B6f28D68d5928BcBEb0Ad172',
            [ChainId.ARBITRUM]:  '0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1',
            [ChainId.AVALANCHE]: '0x321E7092a180BB43555132ec53AaA65a5bF84251',
            [ChainId.HARMONY]:   '0x67C10C397dD0Ba417329543c1a40eb48AAa7cd00',
        },
        swapType: SwapType.OHM,
    });

    export const MIM = new BaseToken({
        name:         'MIM',
        symbol:       'MIM',
        decimals:     18,
        addresses: {
            [ChainId.FANTOM]: '0x82f0b8b456c1a451378467398982d4834b6829c1'
        },
        swapType: SwapType.USD
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
            [ChainId.ETH]: "0xBAac2B4491727D78D2b78815144570b9f2Fe8899",
            [ChainId.BSC]: "0xaa88c603d142c371ea0eac8756123c5805edee03",
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
        name:     'Frax',
        symbol:   'FRAX',
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
        name:      'Synapse Frax',
        symbol:    'synFRAX',
        decimals:  18,
        addresses: {
            [ChainId.FANTOM]:    "0x1852F70512298d56e9c8FDd905e02581E04ddb2a",
            [ChainId.MOONBEAM]:  "0xDd47A348AB60c61Ad6B60cA8C31ea5e00eBfAB4F",
            [ChainId.MOONRIVER]: "0xE96AC70907ffF3Efee79f502C985A7A21Bce407d",
            [ChainId.HARMONY]:   "0x1852F70512298d56e9c8FDd905e02581E04ddb2a",
        },
        swapType: SwapType.FRAX,
    })

    export const SOLAR = new BaseToken({
        name:     "Vested SolarBeam",
        symbol:   "veSOLAR",
        decimals: 18,
        addresses: {
            [ChainId.MOONBEAM]:  "0x0DB6729C03C85B0708166cA92801BcB5CAc781fC",
            [ChainId.MOONRIVER]: "0x76906411D07815491A5E577022757aD941fb5066",
        },
        swapType: SwapType.SOLAR,
    })

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
    })

    export const mintBurnTokens: Token[] = [
        NUSD,  SYN,      NETH,
        HIGH,  DOG,      JUMP,
        FRAX,  SYN_FRAX, NFD,
        GOHM,  SOLAR,    GMX,
    ];

    export function isMintBurnToken(token: Token): boolean {
        return mintBurnTokens.map((t) => t.symbol).includes(token.symbol)
    }
}