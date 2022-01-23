import {Tokens} from "../tokens";
import {ChainId} from "../common";

import {BaseToken} from "../token";
import type {Token, IBaseToken} from "../token";


import {SwapType} from "../common/swaptype";


export namespace SwapPools {
    function moveFirstToLast(arr: Token[]) {
        return [
            ...arr.slice(1),
            arr[0]
        ]
    }

    export class SwapToken implements IBaseToken {
        readonly baseToken: BaseToken;
        readonly poolId:   number;
        readonly poolName: string;
        readonly poolType: string;

        readonly swapEthAddresses: {[chainid: number]: string};
        readonly swapAddresses: {[chainid: number]: string} = {};
        readonly poolTokens:    Token[];
        readonly nativeTokens:  Token[];
        readonly depositTokens: Token[];

        constructor(args: {
            name:      string,
            symbol:    string,
            decimals:  number | {[k: number]: number},
            addresses: {[k: number]: string},
            poolId:    number,
            poolName:  string,
            poolType:  string,
            swapAddresses: {[chainid: number]: string},
            swapEthAddresses?: {[chainid: number]: string},
            poolTokens:     Token[],
            nativeTokens?:  Token[],
            depositTokens?: Token[],
        }) {
            this.baseToken = new BaseToken({
                name:      args.name,
                symbol:    args.symbol,
                decimals:  args.decimals,
                addresses: args.addresses,
                swapType:  args.poolType
            });

            this.poolId = args.poolId;
            this.poolName = args.poolName;
            this.poolType = args.poolType;
            this.swapAddresses = args.swapAddresses;
            this.poolTokens = args.poolTokens;

            if (args.swapEthAddresses) {
                this.swapEthAddresses = args.swapEthAddresses;
            }
            if (args.nativeTokens) {
                this.nativeTokens = args.nativeTokens;
            }

            if (args.depositTokens) {
                this.depositTokens = args.depositTokens;
            }
        }

        get name(): string {
           return this.baseToken.name
        }

        get symbol(): string {
            return this.baseToken.symbol
        }

        get addresses(): {[k: number]: string} {
            return this.baseToken.addresses
        }

        get swapType(): string {
            return this.baseToken.swapType
        }

        get hash(): string {
            return this.baseToken.hash
        }

        address(chainId: number): string|null {
            return this.baseToken.address(chainId)
        }

        decimals(chainId: number): number | null {
            return this.baseToken.decimals(chainId)
        }

        get poolTokensForBridgeSwaps(): Token[] {
            if (this.depositTokens?.length > 0) {
                return moveFirstToLast(this.depositTokens)
            }

            return moveFirstToLast(this.poolTokens);
        }
    }

    export const ETH_POOL_SWAP_TOKEN = new SwapToken({
        addresses: {
            [ChainId.ETH]: Tokens.NUSD.address(ChainId.ETH),
        },
        decimals:      18,
        symbol:        'nUSD',
        name:          'Synapse nUSD LP Token Ethereum',
        poolName:      'Ethereum Stableswap Pool',
        poolId:        420,
        poolType:      'USD',
        swapAddresses: {
            [ChainId.ETH]: '0x1116898DdA4015eD8dDefb84b6e8Bc24528Af2d8',
        },
        poolTokens: [Tokens.DAI, Tokens.USDC, Tokens.USDT]
    });

    export const OPTIMISM_ETH_SWAP_TOKEN = new SwapToken({
        addresses: {
            [ChainId.OPTIMISM]: '0x4619a06ddd3b8f0f951354ec5e75c09cd1cd1aef',
        },
        decimals:      18,
        symbol:        "nETH-LP",
        name:          "Synapse Eth LP Token Optimism",
        poolName:      "Optimism ETH Pool",
        poolId:        0,
        poolType:      "ETH",
        swapAddresses: {
            [ChainId.OPTIMISM]: "0xE27BFf97CE92C3e1Ff7AA9f86781FDd6D48F5eE9",
        },
        swapEthAddresses: {
            [ChainId.OPTIMISM]: "0x8c7d5f8A8e154e1B59C92D8FB71314A43F32ef7B",
        },
        poolTokens:   [Tokens.NETH, Tokens.WETH],                                // add eth token whether eth or weth here
        nativeTokens: [Tokens.NETH, Tokens.ETH],
    });

    export const BSC_POOL_SWAP_TOKEN = new SwapToken({
        addresses: {
            [ChainId.BSC]:     '0xa4b7Bc06EC817785170C2DbC1dD3ff86CDcdcc4C',
        },
        decimals:      18,
        symbol:        'nUSD-LP',
        name:          'Synapse nUSD LP Token',
        poolName:      'BSC Stableswap Pool ', // DONT GET RID OF SPACE AFTER POOL
        poolId:        1,
        poolType:      'USD',
        swapAddresses: {
            [ChainId.BSC]: '0x28ec0B36F0819ecB5005cAB836F4ED5a2eCa4D13',
        },
        poolTokens: [Tokens.NUSD, Tokens.BUSD, Tokens.USDC, Tokens.USDT]
    });

    export const POLYGON_POOL_SWAP_TOKEN = new SwapToken({
        addresses: {
            [ChainId.POLYGON]: '0x7479e1bc2f2473f9e78c89b4210eb6d55d33b645',
        },
        decimals:      18,
        symbol:        'nUSD-LP',
        name:          'Synapse nUSD LP Token Polygon ',
        poolName:      'Polygon Stableswap Pool ',         // DONT GET RID OF SPACE AFTER POOL
        poolId:        1,
        poolType:      'USD',
        swapAddresses: {
            [ChainId.POLYGON]: '0x85fCD7Dd0a1e1A9FCD5FD886ED522dE8221C3EE5',
        },
        poolTokens: [Tokens.NUSD, Tokens.DAI, Tokens.USDC, Tokens.USDT]
    });

    export const FANTOM_POOL_SWAP_TOKEN = new SwapToken({
        addresses: {
            [ChainId.FANTOM]: '0x464d121D3cA63cEEfd390D76f19364D3Bd024cD2',
        },
        decimals:      18,
        symbol:        'nUSD-LP',
        name:          'Synapse nUSD LP Token Fantom',
        poolName:      'Fantom Stableswap Pool ',        // DONT GET RID OF SPACE AFTER POOL
        poolId:        1,
        poolType:      'USD',
        swapAddresses: {
            [ChainId.FANTOM]: '0x2913E812Cf0dcCA30FB28E6Cac3d2DCFF4497688',
        },
        poolTokens: [Tokens.NUSD, Tokens.MIM, Tokens.USDC, Tokens.USDT],
    });

    export const FANTOM_ETH_SWAP_TOKEN = new SwapToken({
        addresses: {
            [ChainId.FANTOM]: "0x0e3dD3403ee498694A8f61B04AFed8919F747f77",
        },
        decimals:  18,
        symbol:   "nETH-LP",
        name:     "Synapse ETH LP Token Fantom",
        poolName: "Fantom ETH Pool ",
        poolId:    2,
        poolType: "ETH",
        swapAddresses: {
            [ChainId.FANTOM]: "0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1",
        },
        poolTokens: [Tokens.NETH, Tokens.FTM_ETH],
    })

    export const BOBA_POOL_SWAP_TOKEN = new SwapToken({
        addresses: {
            [ChainId.BOBA]: '0x9D7283A6AeeD9BCd4Ac70876fEA2b69a63DD8cb9',
        },
        decimals:      18,
        symbol:        'nUSD-LP',
        name:          'Synapse nUSD LP Token Boba',
        poolName:      'Boba Stableswap Pool ',        // DONT GET RID OF SPACE AFTER POOL
        poolId:        1,
        poolType:      'USD',
        swapAddresses: {
            [ChainId.BOBA]: '0x75FF037256b36F15919369AC58695550bE72fead',
        },
        poolTokens:  [Tokens.NUSD, Tokens.DAI, Tokens.USDC, Tokens.USDT],
    });

    export const BOBA_ETH_SWAP_TOKEN = new SwapToken({
        addresses: {
            [ChainId.BOBA]: '0x498657f2AF18D525049dE520dD86ee376Db9c67c',
        },
        decimals:      18,
        symbol:        'nETH-LP',                         // make sure this gets update to match conytract
        name:          'Synapse Eth LP Token Boba',
        poolName:      'Boba ETH Pool',
        poolId:        2,
        poolType:      'ETH',
        swapAddresses: {
            [ChainId.BOBA]: '0x753bb855c8fe814233d26Bb23aF61cb3d2022bE5',
        },
        swapEthAddresses: {
            [ChainId.BOBA]: '0x4F4f66964335D7bef23C16a62Fcd3d1E89f02959',
        },
        poolTokens:   [Tokens.NETH, Tokens.WETH],                                // add eth token whether eth or weth here
        nativeTokens: [Tokens.NETH, Tokens.ETH],
    });

    export const ARBITRUM_POOL_SWAP_TOKEN = new SwapToken({
        addresses: {
            [ChainId.ARBITRUM]: '0xADeac0343C2Ac62DFE5A5f51E896AefFF5Ab513E',
        },
        decimals:      18,
        symbol:        'nUSD-LP',
        name:          'Synapse nUSD LP Token Arbitrum',
        poolName:      'Arbitrum Stableswap Pool ',        // DONT GET RID OF SPACE AFTER POOL
        poolId:        2,
        poolType:      'USD',
        swapAddresses: {
            [ChainId.ARBITRUM]: '0x0Db3FE3B770c95A0B99D1Ed6F2627933466c0Dd8',
        },
        poolTokens: [Tokens.NUSD, Tokens.MIM, Tokens.USDC, Tokens.USDT],
    });

    export const ARBITRUM_ETH_SWAP_TOKEN = new SwapToken({
        addresses: {
            [ChainId.ARBITRUM]: '0xD70A52248e546A3B260849386410C7170c7BD1E9',
        },
        decimals:      18,
        symbol:        'nETH-LP',                         // make sure this gets update to match conytract
        name:          'Synapse Eth LP Token Arbitrum',
        poolName:      'Arbitrum ETH Pool',
        poolId:        0,
        poolType:      'ETH',
        swapAddresses: {
            [ChainId.ARBITRUM]: '0xa067668661C84476aFcDc6fA5D758C4c01C34352',
        },
        swapEthAddresses: {
            [ChainId.ARBITRUM]: '0x1c3fe783a7c06bfAbd124F2708F5Cc51fA42E102',
        },
        poolTokens:   [Tokens.NETH, Tokens.WETH],
        nativeTokens: [Tokens.NETH, Tokens.ETH],
    });

    export const AVALANCHE_POOL_SWAP_TOKEN = new SwapToken({
        addresses: {
            [ChainId.AVALANCHE]: '0xCA87BF3ec55372D9540437d7a86a7750B42C02f4',
        },
        decimals:      18,
        symbol:        'nUSD-LP',
        name:          'Synapse nUSD LP Token Avalanche',
        poolName:      'Avalanche Stableswap Pool ',        // DONT GET RID OF SPACE AFTER POOL
        poolId:        1,
        poolType:      'USD',
        swapAddresses: {
            [ChainId.AVALANCHE]: '0xED2a7edd7413021d440b09D654f3b87712abAB66',
        },
        poolTokens: [Tokens.NUSD, Tokens.DAI, Tokens.USDC, Tokens.USDT]
    });

    export const AVALANCHE_ETH_SWAP_TOKEN = new SwapToken({
        addresses: {
            [ChainId.AVALANCHE]: '0x5dF1dB940dd8fEE0e0eB0C8917cb50b4dfaDF98c',
        },
        decimals:      18,
        symbol:        'nETH-LP',                         // make sure this gets update to match conytract
        name:          'Synapse Eth LP Token Avalanche',
        poolName:      'Avalanche ETH Pool',
        poolId:        2,
        poolType:      'ETH',
        swapAddresses: {
            [ChainId.AVALANCHE]: '0x77a7e60555bC18B4Be44C181b2575eee46212d44',
        },
        swapEthAddresses: {
            [ChainId.AVALANCHE]: '0xdd60483Ace9B215a7c019A44Be2F22Aa9982652E',
        },
        poolTokens:    [Tokens.NETH, Tokens.AVWETH],
        nativeTokens:  [Tokens.NETH, Tokens.WETH_E],
        depositTokens: [Tokens.NETH, Tokens.WETH_E],
    });

    export const AURORA_POOL_SWAP_TOKEN = new SwapToken({
        addresses: {
            [ChainId.AURORA]: '0xEAdC3524f3F007cdC5104BF28663b1141D3e3127',
        },
        decimals:      18,
        symbol:        'nUSD-LP',
        name:          'Synapse nUSD LP Token Aurora',
        poolName:      'Aurora Stableswap Pool ',
        poolId:        1,
        poolType:      'USD',
        swapAddresses: {
            [ChainId.AURORA]: '0xcEf6C2e20898C2604886b888552CA6CcF66933B0',
        },
        poolTokens: [Tokens.NUSD, Tokens.USDC, Tokens.USDT],
    })

    export const HARMONY_POOL_SWAP_TOKEN = new SwapToken({
        addresses: {
            [ChainId.HARMONY]: '0xE269abBFAF52b26D2632F55B6b223A5223088B96',
        },
        decimals:      18,
        symbol:        'nUSD-LP',
        name:          'Synapse nUSD LP Token Harmony',
        poolName:      'Harmony Stableswap Pool ',        // DONT GET RID OF SPACE AFTER POOL
        poolId:        1,
        poolType:      'USD',
        swapAddresses: {
            [ChainId.HARMONY]: '0x3ea9B0ab55F34Fb188824Ee288CeaEfC63cf908e',
        },
        poolTokens: [Tokens.NUSD, Tokens.DAI, Tokens.USDC, Tokens.USDT],
    });

    export const HARMONY_ONEETH_TOKEN = new SwapToken({
        addresses: {
            [ChainId.HARMONY]: '0x464d121D3cA63cEEfd390D76f19364D3Bd024cD2',
        },
        decimals:      18,
        symbol:        'nETH-LP',
        name:          'Synapse 1ETH LP Token Harmony',
        poolName:      'Harmony 1ETH Pool ',        // DONT GET RID OF SPACE AFTER POOL
        poolId:        1,
        poolType:      'ETH',
        swapAddresses: {
            [ChainId.HARMONY]: '0x2913E812Cf0dcCA30FB28E6Cac3d2DCFF4497688',
        },
        poolTokens:    [Tokens.NETH, Tokens.ONE_ETH],
        nativeTokens:  [Tokens.NETH, Tokens.ONE_ETH],
        depositTokens: [Tokens.NETH, Tokens.ONE_ETH],
    });

    export interface SwapGroupTokenMap {
        [grp: string]: Token[]
    }

    export interface BridgeTokensBySwapGroupMap {
        [c: number]: SwapGroupTokenMap
    }

    export const bridgeSwappableTokensByType: BridgeTokensBySwapGroupMap = {
        [ChainId.ETH]: {
            [SwapType.USD]:  [...ETH_POOL_SWAP_TOKEN.poolTokens, Tokens.NUSD],
            [SwapType.ETH]:  [Tokens.ETH],
            [SwapType.SYN]:  [Tokens.SYN],
            [SwapType.HIGH]: [Tokens.HIGH],
            [SwapType.DOG]:  [Tokens.DOG],
            [SwapType.FRAX]: [Tokens.FRAX],
            [SwapType.OHM]:  [Tokens.GOHM],
        },
        [ChainId.OPTIMISM]: {
            [SwapType.ETH]: [...OPTIMISM_ETH_SWAP_TOKEN.poolTokens],
            [SwapType.SYN]: [Tokens.SYN],
        },
        [ChainId.BSC]: {
            [SwapType.USD]:   [...BSC_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
            [SwapType.SYN]:   [Tokens.SYN],
            [SwapType.HIGH]:  [Tokens.HIGH],
            [SwapType.DOG]:   [Tokens.DOG],
            [SwapType.JUMP]:  [Tokens.JUMP],
            [SwapType.NFD]:   [Tokens.NFD],
        },
        [ChainId.POLYGON]: {
            [SwapType.USD]: [...POLYGON_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
            [SwapType.SYN]: [Tokens.SYN],
            [SwapType.NFD]: [Tokens.NFD],
            [SwapType.DOG]: [Tokens.DOG],
            [SwapType.OHM]: [Tokens.GOHM],
        },
        [ChainId.FANTOM]: {
            [SwapType.USD]:  [...FANTOM_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
            [SwapType.ETH]:  [...FANTOM_ETH_SWAP_TOKEN.poolTokensForBridgeSwaps],
            [SwapType.SYN]:  [Tokens.SYN],
            [SwapType.JUMP]: [Tokens.JUMP],
            [SwapType.OHM]:  [Tokens.GOHM],
            [SwapType.FRAX]: [Tokens.FRAX],
        },
        [ChainId.BOBA]: {
            [SwapType.USD]: [...BOBA_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
            [SwapType.ETH]: [...BOBA_ETH_SWAP_TOKEN.poolTokens],
            [SwapType.SYN]: [Tokens.SYN],
        },
        [ChainId.MOONBEAM]: {
            // [SwapType.ETH]:   [Tokens.WETHBEAM],
            // [SwapType.FRAX]:  [Tokens.FRAX, Tokens.SYN_FRAX],
            [SwapType.SYN]:   [Tokens.SYN],
            [SwapType.SOLAR]: [Tokens.SOLAR],
            [SwapType.AVAX]:  [Tokens.WAVAX],
            [SwapType.MOVR]:  [Tokens.WMOVR],
        },
        [ChainId.MOONRIVER]: {
            [SwapType.FRAX]:  [Tokens.FRAX],
            [SwapType.SYN]:   [Tokens.SYN],
            [SwapType.OHM]:   [Tokens.GOHM],
            [SwapType.SOLAR]: [Tokens.SOLAR],
            [SwapType.MOVR]:  [Tokens.MOVR],
        },
        [ChainId.ARBITRUM]: {
            [SwapType.USD]: [...ARBITRUM_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
            [SwapType.ETH]: [...ARBITRUM_ETH_SWAP_TOKEN.poolTokens],
            [SwapType.SYN]: [Tokens.SYN],
            [SwapType.OHM]: [Tokens.GOHM],
            [SwapType.GMX]: [Tokens.GMX],
        },
        [ChainId.AVALANCHE]: {
            [SwapType.USD]:  [...AVALANCHE_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
            [SwapType.ETH]:  [...AVALANCHE_ETH_SWAP_TOKEN.poolTokensForBridgeSwaps],
            [SwapType.SYN]:  [Tokens.SYN],
            [SwapType.NFD]:  [Tokens.NFD],
            [SwapType.OHM]:  [Tokens.GOHM],
            [SwapType.AVAX]: [Tokens.AVAX],
            [SwapType.GMX]:  [Tokens.GMX],
        },
        [ChainId.AURORA]: {
            [SwapType.USD]: [...AURORA_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
            [SwapType.SYN]: [Tokens.SYN],
        },
        [ChainId.HARMONY]: {
            [SwapType.USD]:  [...HARMONY_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
            [SwapType.ETH]:  [...HARMONY_ONEETH_TOKEN.poolTokensForBridgeSwaps],
            [SwapType.SYN]:  [Tokens.SYN],
            [SwapType.FRAX]: [Tokens.FRAX],
        },
    }

    const
        FRAX_SPOOF    = "frax",
        SYNFRAX_SPOOF = "synfrax",
        MOVR_SPOOF    = "movr",
        WMOVR_SPOOF   = "wmovr",
        AVAX_SPOOF    = "avax",
        WAVAX_SPOOF   = "wavax";

    const swapTypesToksMap = {
        [SwapType.SYN]:    {[SwapType.SYN]:   { poolTokens: [Tokens.SYN]      }},
        [SwapType.HIGH]:   {[SwapType.HIGH]:  { poolTokens: [Tokens.HIGH]     }},
        [SwapType.DOG]:    {[SwapType.DOG]:   { poolTokens: [Tokens.DOG]      }},
        [SwapType.JUMP]:   {[SwapType.JUMP]:  { poolTokens: [Tokens.JUMP]     }},
        [SwapType.ETH]:    {[SwapType.ETH]:   { poolTokens: [Tokens.ETH]      }},
        [SwapType.NFD]:    {[SwapType.NFD]:   { poolTokens: [Tokens.NFD]      }},
        [SwapType.OHM]:    {[SwapType.OHM]:   { poolTokens: [Tokens.GOHM]     }},
        [SwapType.GMX]:    {[SwapType.GMX]:   { poolTokens: [Tokens.GMX]      }},
        [SwapType.SOLAR]:  {[SwapType.SOLAR]: { poolTokens: [Tokens.SOLAR]    }},
        FRAX_SPOOF:        {[SwapType.FRAX]:  { poolTokens: [Tokens.FRAX]     }},
        SYNFRAX_SPOOF:     {[SwapType.FRAX]:  { poolTokens: [Tokens.SYN_FRAX] }},
        MOVR_SPOOF:        {[SwapType.MOVR]:  { poolTokens: [Tokens.MOVR]     }},
        WMOVR_SPOOF:       {[SwapType.MOVR]:  { poolTokens: [Tokens.WMOVR]    }},
        AVAX_SPOOF:        {[SwapType.AVAX]:  { poolTokens: [Tokens.AVAX]     }},
        WAVAX_SPOOF:       {[SwapType.AVAX]:  { poolTokens: [Tokens.WAVAX]    }},
    }


    interface TokenPool {
        poolTokens: Token[],
    }

    interface SwapTypeTokenPool {
        [s: string]: TokenPool,
    }

    function makeSwapTypeTokenPool(poolSwapToken?: TokenPool, ethSwapToken?: TokenPool, ...swapTypes: string[]): SwapTypeTokenPool {
        let m: SwapTypeTokenPool = {};

        if (poolSwapToken) {
            m[SwapType.USD] = poolSwapToken;
        }

        if (ethSwapToken) {
            m[SwapType.ETH] = ethSwapToken
        }

        swapTypes.forEach((s) => {
            m = {
                ...m,
                ...swapTypesToksMap[s],
            }
        })

        return m
    }

    export const bridgeSwappableTypePoolsByChain = {
        [ChainId.ETH]: makeSwapTypeTokenPool(
            ETH_POOL_SWAP_TOKEN,
            null,
            SwapType.ETH,
            SwapType.SYN,
            SwapType.HIGH,
            SwapType.DOG,
            SwapType.OHM,
            FRAX_SPOOF,
        ),
        [ChainId.OPTIMISM]: makeSwapTypeTokenPool(
            null,
            OPTIMISM_ETH_SWAP_TOKEN,
            SwapType.SYN
        ),
        [ChainId.BSC]: makeSwapTypeTokenPool(
            BSC_POOL_SWAP_TOKEN,
            null,
            SwapType.SYN,
            SwapType.HIGH,
            SwapType.DOG,
            SwapType.JUMP,
            SwapType.NFD
        ),
        [ChainId.POLYGON]: makeSwapTypeTokenPool(
            POLYGON_POOL_SWAP_TOKEN,
            null,
            SwapType.SYN,
            SwapType.NFD,
            SwapType.DOG,
            SwapType.OHM
        ),
        [ChainId.FANTOM]: makeSwapTypeTokenPool(
            FANTOM_POOL_SWAP_TOKEN,
            FANTOM_ETH_SWAP_TOKEN,
            SwapType.SYN,
            SwapType.JUMP,
            SwapType.OHM,
            FRAX_SPOOF,
        ),
        [ChainId.BOBA]: makeSwapTypeTokenPool(
            BOBA_POOL_SWAP_TOKEN,
            BOBA_ETH_SWAP_TOKEN,
            SwapType.SYN,
        ),
        [ChainId.MOONBEAM]: makeSwapTypeTokenPool(
            null, null,
            SwapType.SYN,
            SwapType.SOLAR,
            SwapType.OHM,
            WMOVR_SPOOF,
            WAVAX_SPOOF,
        ),
        [ChainId.MOONRIVER]: makeSwapTypeTokenPool(
            null, null,
            SwapType.SYN,
            SwapType.OHM,
            SwapType.SOLAR,
            MOVR_SPOOF,
            FRAX_SPOOF,
        ),
        [ChainId.ARBITRUM]: makeSwapTypeTokenPool(
            ARBITRUM_POOL_SWAP_TOKEN,
            ARBITRUM_ETH_SWAP_TOKEN,
            SwapType.SYN,
            SwapType.OHM,
            SwapType.GMX,
        ),
        [ChainId.AVALANCHE]: makeSwapTypeTokenPool(
            AVALANCHE_POOL_SWAP_TOKEN,
            AVALANCHE_ETH_SWAP_TOKEN,
            SwapType.SYN,
            SwapType.NFD,
            SwapType.OHM,
            SwapType.GMX,
            AVAX_SPOOF,
        ),
        [ChainId.AURORA]: makeSwapTypeTokenPool(
            AURORA_POOL_SWAP_TOKEN,
            null,
            SwapType.SYN
        ),
        [ChainId.HARMONY]: makeSwapTypeTokenPool(
            HARMONY_POOL_SWAP_TOKEN,
            HARMONY_ONEETH_TOKEN,
            SwapType.SYN,
            FRAX_SPOOF,
        )
    }

    export function getAllSwappableTokensForNetwork(chainId: number): Token[] {
        let
            swappableTokens: Token[] = [],
            groupsForChain = bridgeSwappableTokensByType[chainId];

        Object.keys(groupsForChain).forEach((grp) => {
            swappableTokens = [...swappableTokens, ...groupsForChain[grp]];
        })

        return swappableTokens
    }

    export const swapGroupsForNetwork = (chainId: number): string[] => Object.keys(bridgeSwappableTokensByType[chainId])
}

export interface NetworkSwappableTokensMap {
    [c: number]: Token[]
}

export interface AllNetworksSwappableTokensMap {
    [c: number]: NetworkSwappableTokensMap
}

function filterGrps(chainAGrps: string[], chainBGrpsMap: SwapPools.SwapGroupTokenMap): Token[] {
    let tokens: Token[] = [];

    Object.keys(chainBGrpsMap).forEach((grp: string) => {
        if (chainAGrps.includes(grp)) {
            tokens = [...tokens, ...chainBGrpsMap[grp]];
        }
    })

    return tokens
}

function swapGroupsLoop(chainIdA: number, swapGrps: string[]): NetworkSwappableTokensMap {
    let res: NetworkSwappableTokensMap = {}

    ChainId.supportedChainIds().forEach((chainId: number) => {
        if (chainIdA === chainId) {
            return
        }

        res[chainId] = filterGrps(swapGrps, SwapPools.bridgeSwappableTokensByType[chainId]);
    })

    return res
}
/**
 * @deprecated Use {@link networkSwapTokensMap} instead.
 */
export function swappableTokens(chainIdA: number, chainIdB?: number): NetworkSwappableTokensMap {
    return networkSwapTokensMap(chainIdA, chainIdB)
}

/**
 * Returns a map of swappable tokens for two given networks; or, if a second chainid isn't passed,
 * a map of all swappable tokens for the passed chainid between all supported networks.
 * @param chainIdA
 * @param chainIdB Optional second network; if passed, a map of swappable tokens between ONLY chainIdA and chainIdB is returned.
 * @return NetworkSwappableTokensMap
 */
export function networkSwapTokensMap(chainIdA: number, chainIdB?: number): NetworkSwappableTokensMap {
    let res: NetworkSwappableTokensMap = {};

    const swapGrpsA: string[] = SwapPools.swapGroupsForNetwork(chainIdA);

    if (typeof chainIdB !== 'undefined') {
        res[chainIdB] = filterGrps(swapGrpsA, SwapPools.bridgeSwappableTokensByType[chainIdB]);
    } else {
        res = swapGroupsLoop(chainIdA, swapGrpsA);
    }

    return res
}

/**
 * @deprecated Use {@link allNetworksSwapTokensMap} instead.
 */
export function swappableTokensAllNetworks(): AllNetworksSwappableTokensMap {
    return allNetworksSwapTokensMap()
}

/**
 * Returns map of all swappable tokens between all supported networks.
 * @return AllNetworksSwappableTokensMap
 */
export function allNetworksSwapTokensMap(): AllNetworksSwappableTokensMap {
    let res: AllNetworksSwappableTokensMap = {};

    ChainId.supportedChainIds().forEach((chainIdA: number) => {
        const swapGrpsA: string[] = SwapPools.swapGroupsForNetwork(chainIdA);

        res[chainIdA] = swapGroupsLoop(chainIdA, swapGrpsA);
    })

    return res
}