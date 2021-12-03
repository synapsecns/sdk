import {Tokens} from "../tokens";
import {ChainId} from "../common";

import {Token} from "../token";
import type {BaseToken} from "../token";


import {SwapType} from "../common/swaptype";


export namespace SwapPools {
    function moveFirstToLast(arr: Token[]) {
        return [
            ...arr.slice(1),
            arr[0]
        ]
    }

    export class SwapToken implements BaseToken {
        readonly baseToken: Token;
        readonly poolId:   number;
        readonly poolName: string;
        readonly poolType: string;

        readonly swapEthAddresses: {[chainid: number]: string};
        readonly swapAddresses: {[chainid: number]: string} = {};
        readonly poolTokens:   Token[];
        readonly nativeTokens: Token[];

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
            poolTokens:    Token[],
            nativeTokens?: Token[],
        }) {
            this.baseToken = new Token({
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
            [ChainId.BOBA]: '0x56A28e084B29f975bf0D31fD3aA074647F43728C',
        },
        decimals:      18,
        symbol:        'nETH-LP',                         // make sure this gets update to match conytract
        name:          'Synapse Eth LP Token Boba',
        poolName:      'Boba ETH Pool',
        poolId:        0,
        poolType:      'ETH',
        swapAddresses: {
            [ChainId.BOBA]: '0xaB1EB0B9a0124D89445a547366C9eD61a5180E43',
        },
        swapEthAddresses: {
            [ChainId.BOBA]: '0x06Fea8513FF03a0d3f61324da709D4cf06F42A5c',
        },
        poolTokens:   [Tokens.NETH, Tokens.WETH],                                // add eth token whether eth or weth here
        nativeTokens: [Tokens.NETH, Tokens.ETH],
    });

    export const bridgeSwappableTokensByType = {
        [ChainId.ETH]: {
            [SwapType.USD]:  [...ETH_POOL_SWAP_TOKEN.poolTokens, Tokens.NUSD],
            [SwapType.ETH]:  [Tokens.ETH],
            [SwapType.SYN]:  [Tokens.SYN],
            [SwapType.HIGH]: [Tokens.HIGH],
            [SwapType.DOG]:  [Tokens.DOG],
            [SwapType.FRAX]: [Tokens.FRAX],
        },
        [ChainId.BSC]: {
            [SwapType.USD]:   [...BSC_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
            [SwapType.SYN]:   [Tokens.SYN],
            [SwapType.HIGH]:  [Tokens.HIGH],
            [SwapType.DOG]:   [Tokens.DOG],
            [SwapType.JUMP]:  [Tokens.JUMP],
        },
        [ChainId.POLYGON]: {
            [SwapType.USD]: [...POLYGON_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
            [SwapType.SYN]: [Tokens.SYN],
        },
        [ChainId.FANTOM]: {
            [SwapType.USD]:  [...FANTOM_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
            [SwapType.SYN]:  [Tokens.SYN],
            [SwapType.JUMP]: [Tokens.JUMP],
        },
        [ChainId.BOBA]: {
            [SwapType.USD]: [...BOBA_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
            [SwapType.SYN]: [Tokens.SYN],
            [SwapType.ETH]: [...BOBA_ETH_SWAP_TOKEN.poolTokens],
        },
        [ChainId.MOONRIVER]: {
            [SwapType.FRAX]: [Tokens.FRAX],
            [SwapType.SYN]:  [Tokens.SYN],
        },
        [ChainId.ARBITRUM]: {
            [SwapType.USD]: [...ARBITRUM_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
            [SwapType.SYN]: [Tokens.SYN],
            [SwapType.ETH]: [...ARBITRUM_ETH_SWAP_TOKEN.poolTokens],
        },
        [ChainId.AVALANCHE]: {
            [SwapType.USD]: [...AVALANCHE_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
            [SwapType.SYN]: [Tokens.SYN],
        },
        [ChainId.HARMONY]: {
            [SwapType.USD]: [...HARMONY_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
            [SwapType.SYN]: [Tokens.SYN],
        },
    }

    const
        synPoolTokens  = {[SwapType.SYN]:  { poolTokens: [Tokens.SYN]  }},
        highPoolTokens = {[SwapType.HIGH]: { poolTokens: [Tokens.HIGH] }},
        dogPoolTokens  = {[SwapType.DOG]:  { poolTokens: [Tokens.DOG]  }},
        jumpPoolTokens = {[SwapType.JUMP]: { poolTokens: [Tokens.JUMP] }},
        ethPoolTokens  = {[SwapType.ETH]:  { poolTokens: [Tokens.ETH]  }},
        fraxPoolTokens = {[SwapType.FRAX]: { poolTokens: [Tokens.FRAX] }};

    export const bridgeSwappableTypePoolsByChain = {
        [ChainId.ETH]: {
            [SwapType.USD]: ETH_POOL_SWAP_TOKEN,
            ...ethPoolTokens,
            ...synPoolTokens,
            ...highPoolTokens,
            ...dogPoolTokens,
            ...fraxPoolTokens,
        },
        [ChainId.BSC]: {
            [SwapType.USD]: BSC_POOL_SWAP_TOKEN,
            ...synPoolTokens,
            ...highPoolTokens,
            ...dogPoolTokens,
            ...jumpPoolTokens,
        },
        [ChainId.POLYGON]: {
            [SwapType.USD]: POLYGON_POOL_SWAP_TOKEN,
            ...synPoolTokens,
        },
        [ChainId.FANTOM]: {
            [SwapType.USD]: FANTOM_POOL_SWAP_TOKEN,
            ...synPoolTokens,
            ...jumpPoolTokens,
        },
        [ChainId.BOBA]: {
            [SwapType.USD]: BOBA_POOL_SWAP_TOKEN,
            [SwapType.ETH]: BOBA_ETH_SWAP_TOKEN,
            ...synPoolTokens,
        },
        [ChainId.MOONRIVER]: {
            ...synPoolTokens,
            ...fraxPoolTokens,
        },
        [ChainId.ARBITRUM]: {
            [SwapType.USD]: ARBITRUM_POOL_SWAP_TOKEN,
            [SwapType.ETH]: ARBITRUM_ETH_SWAP_TOKEN,
            ...synPoolTokens,
        },
        [ChainId.AVALANCHE]: {
            [SwapType.USD]: AVALANCHE_POOL_SWAP_TOKEN,
            ...synPoolTokens,
        },
        [ChainId.HARMONY]: {
            [SwapType.USD]: HARMONY_POOL_SWAP_TOKEN,
            ...synPoolTokens,
        }
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
}