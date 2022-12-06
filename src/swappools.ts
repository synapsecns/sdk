import {isEqual} from "lodash-es";

import {Tokens} from "@tokens";

import {
    ChainId,
    supportedChainIds,
    type ChainIdTypeMap
} from "@chainid";

import type {
    AddressMap,
    DecimalsMap
} from "@common/types";

import {
    BaseToken,
    type IBaseToken,
    type Token
} from "@token";

import type {ID} from "@internal/types";
import {
    SwapType,
    type SwapTypeMap
} from "@internal/swaptype";

import {BigNumber} from "@ethersproject/bignumber";
import type {BigNumberish} from "@ethersproject/bignumber";

export namespace SwapPools {
    function moveFirstToLast(arr: Token[]) {
        return [
            ...arr.slice(1),
            arr[0]
        ]
    }

    export interface LPToken {
        readonly poolTokens: Token[];
        readonly swapType:   SwapType;
    }

    export type PoolTokensAmountsMap = {
        [k: string]: BigNumberish;
    }

    export interface SwapPoolToken extends IBaseToken, LPToken {
        readonly baseToken:       BaseToken;
        readonly chainId:         number;
        readonly poolId:          number;
        readonly poolName:        string;
        readonly poolType:        string;
        readonly nativeTokens?:   Token[];
        readonly depositTokens?:  Token[];
        readonly swapAddress:     string;
        readonly swapETHAddress:  string | null;

        readonly poolTokensForBridgeSwaps: Token[]

        liquidityAmountsMap:     () => PoolTokensAmountsMap;
        liquidityAmountsFromMap: (m: PoolTokensAmountsMap) => BigNumber[];
    }

    interface SwapTokenArgs {
        name:           string;
        symbol:         string;
        chainId:        number;
        decimals:       number | DecimalsMap;
        addresses:      AddressMap;
        poolId:         number;
        poolName:       string;
        poolType:       SwapType;
        poolTokens:     Token[];
        swapAddress:    string;
    }

    interface ETHSwapTokenArgs extends SwapTokenArgs {
        nativeTokens?:     Token[];
        depositTokens?:    Token[];
        swapEthAddress?:   string;
    }

    interface makeSwapTokenArgs {
        chainId:      number;
        netName:      string;
        address:      string;
        swapAddress:  string;
        poolId:       number;
        poolTokens:   Token[];
        notLP?:       boolean;
        symbol?:      string;
    }

    interface makeETHSwapTokenArgs extends makeSwapTokenArgs {
        swapETHAddress?: string;
        poolName?:       string;
        nativeTokens?:   Token[];
        depositTokens?:  Token[];
    }

    const makeSwapToken = (args: makeSwapTokenArgs): SwapToken =>
        new SwapToken({
            name:           `Synapse nUSD LP Token${args.netName != "BSC" ? ` ${args.netName}` : ""}`,
            poolName:       `${args.netName} Stableswap Pool `,
            symbol:          (args.notLP ?? false) ? "nUSD" : "nUSD-LP",
            chainId:         args.chainId,
            decimals:        18,
            poolId:          args.poolId,
            poolTokens:      args.poolTokens,
            addresses:     {[args.chainId]: args.address},
            swapAddress:     args.swapAddress,
            poolType:        SwapType.USD,
        })

    const makeETHSwapToken = (args: makeETHSwapTokenArgs): ETHSwapToken =>
        new ETHSwapToken({
            name:            `Synapse ${args.poolName ?? "ETH"} LP Token ${args.netName}`,
            poolName:        `${args.netName} ${args.poolName ?? "ETH"} Pool `,
            symbol:           "nETH-LP",
            chainId:          args.chainId,
            decimals:         18,
            poolId:           args.poolId,
            addresses:      {[args.chainId]: args.address},
            swapAddress:      args.swapAddress,
            swapEthAddress:   args.swapETHAddress,
            poolTokens:       args.poolTokens,
            nativeTokens:     args.nativeTokens,
            depositTokens:    args.depositTokens,
            poolType:         SwapType.ETH,
        })

    export class SwapToken implements SwapPoolToken {
        readonly baseToken: BaseToken;
        readonly chainId:   number;

        readonly poolId:   number;
        readonly poolName: string;
        readonly poolType: SwapType;

        readonly poolTokens: Token[];

        readonly swapAddress: string;

        constructor(args: SwapTokenArgs) {
            this.baseToken = new BaseToken({
                name:      args.name,
                symbol:    args.symbol,
                decimals:  args.decimals,
                addresses: args.addresses,
                swapType:  args.poolType
            });

            this.chainId     = args.chainId;
            this.poolId      = args.poolId;
            this.poolName    = args.poolName;
            this.poolType    = args.poolType;
            this.swapAddress = args.swapAddress;
            this.poolTokens  = args.poolTokens;
        }

        get id(): ID {
            return this.baseToken.id
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

        get swapType(): SwapType {
            return this.baseToken.swapType
        }

        address(chainId: number): string|null {
            return this.baseToken.address(chainId)
        }

        decimals(chainId: number): number | null {
            return this.baseToken.decimals(chainId)
        }

        get poolTokensForBridgeSwaps(): Token[] {
            return moveFirstToLast(this.poolTokens)
        }

        get swapETHAddress(): string | null {
            return null
        }

        liquidityAmountsMap(): PoolTokensAmountsMap {
            let m: PoolTokensAmountsMap = {};

            for (const t of this.poolTokens) {
                m[t.symbol] = BigNumber.from(0);
            }

            return m
        }

        liquidityAmountsFromMap(m: PoolTokensAmountsMap): BigNumber[] {
            let amounts: BigNumber[] = new Array<BigNumber>(this.poolTokens.length);

            const mapKeys = Object.keys(m);
            const wantMapKeys = Object.keys(this.liquidityAmountsMap());

            /* c8 ignore start */
            if (!isEqual(mapKeys, wantMapKeys)) {
                const err = new Error(`expected passed PoolTokensAmountsMap to have keys ${wantMapKeys}; got ${mapKeys}`);
                console.error(err);
                return amounts;
            }
            /* c8 ignore stop */

            mapKeys.forEach((k, idx) => {
                const amt = m[k];

                let realAmt: BigNumber;

                /* c8 ignore start */
                if (amt instanceof BigNumber) {
                    realAmt = amt as BigNumber;
                } else {
                    const token = this.poolTokens[idx];
                    realAmt = token.etherToWei(amt, this.chainId);
                }
                /* c8 ignore stop */

                amounts[idx] = realAmt;
            });

            return amounts
        }
    }

    export class ETHSwapToken extends SwapToken {
        readonly nativeTokens:  Token[];
        readonly depositTokens: Token[];

        private readonly _swapETHAddress: string | null = null;

        constructor(args: ETHSwapTokenArgs) {
            let {
                swapEthAddress,
                nativeTokens,
                depositTokens,
                ...constructorArgs
            } = args;

            super(constructorArgs);

            if (swapEthAddress) {
                this._swapETHAddress = args.swapEthAddress;
            }

            if (args.nativeTokens) {
                this.nativeTokens = args.nativeTokens;
            }

            if (args.depositTokens) {
                this.depositTokens = args.depositTokens;
            }
        }

        get poolTokensForBridgeSwaps(): Token[] {
            return this.depositTokens?.length > 0
                ? moveFirstToLast(this.depositTokens)
                : moveFirstToLast(this.poolTokens)
        }

        get swapETHAddress(): string | null {
            return this._swapETHAddress
        }
    }

    const USDPoolTokens = (tok: Token = Tokens.DAI, nUSD: boolean = true): Token[] => [
        ...(nUSD ? [Tokens.NUSD] : []),
        ...(tok === null ? [] : [tok]),
        Tokens.USDC,
        Tokens.USDT,
    ]

    const
        ETHTokensPool = (t: Token): Token[] => [Tokens.NETH, t],
        WETHTokenPool: Token[] = ETHTokensPool(Tokens.WETH),
        ETHTokenPool:  Token[] = ETHTokensPool(Tokens.ETH);

    export const ETH_POOL_SWAP_TOKEN = makeSwapToken({
        chainId:     ChainId.ETH,
        address:     Tokens.NUSD.address(ChainId.ETH),
        netName:     "Ethereum",
        poolId:       420,
        swapAddress: "0x1116898DdA4015eD8dDefb84b6e8Bc24528Af2d8",
        poolTokens:   USDPoolTokens(Tokens.DAI, false),
        notLP:        true
    });

    export const OPTIMISM_POOL_SWAP_TOKEN = makeSwapToken({
        chainId:     ChainId.OPTIMISM,
        address:     "0x2c6d91accC5Aa38c84653F28A80AEC69325BDd12",
        netName:     "Optimism",
        poolId:      1,
        swapAddress: "0xF44938b0125A6662f9536281aD2CD6c499F22004",
        poolTokens:  [Tokens.NUSD, Tokens.USDC],
    });

    export const OPTIMISM_ETH_SWAP_TOKEN = makeETHSwapToken({
        chainId:         ChainId.OPTIMISM,
        address:        "0x4619a06ddd3b8f0f951354ec5e75c09cd1cd1aef",
        netName:        "Optimism",
        poolId:          0,
        swapAddress:    "0xE27BFf97CE92C3e1Ff7AA9f86781FDd6D48F5eE9",
        swapETHAddress: "0x8c7d5f8A8e154e1B59C92D8FB71314A43F32ef7B",
        poolTokens:      WETHTokenPool,
        nativeTokens:    ETHTokenPool,
    });

    export const CRONOS_POOL_SWAP_TOKEN = makeSwapToken({
        chainId:     ChainId.CRONOS,
        address:     "0xd5Da35646A79C42a0BAB148656192A22e8CBfad6",
        netName:     "Cronos",
        poolId:      1,
        swapAddress: "0xCb6674548586F20ca39C97A52A0ded86f48814De",
        poolTokens:  [
            Tokens.NUSD,
            Tokens.USDC,
        ],
    });

    export const BSC_POOL_SWAP_TOKEN = makeSwapToken({
        chainId:      ChainId.BSC,
        address:     "0xa4b7Bc06EC817785170C2DbC1dD3ff86CDcdcc4C",
        netName:     "BSC",
        poolId:       1,
        swapAddress: "0x28ec0B36F0819ecB5005cAB836F4ED5a2eCa4D13",
        poolTokens:   USDPoolTokens(Tokens.BUSD),
    });

    export const POLYGON_POOL_SWAP_TOKEN = makeSwapToken({
        chainId:      ChainId.POLYGON,
        address:     "0x7479e1bc2f2473f9e78c89b4210eb6d55d33b645",
        netName:     "Polygon",
        poolId:       1,
        swapAddress: "0x85fCD7Dd0a1e1A9FCD5FD886ED522dE8221C3EE5",
        poolTokens:   USDPoolTokens(),
    });

    export const FANTOM_POOL_SWAP_TOKEN = makeSwapToken({
        chainId:      ChainId.FANTOM,
        address:     "0x2DC777ff99058a12844A33D9B1AE6c8AB4701F66",
        netName:     "Fantom",
        poolId:       3,
        swapAddress: "0x85662fd123280827e11C59973Ac9fcBE838dC3B4",
        poolTokens:   USDPoolTokens(null),
    });

    export const FANTOM_ETH_SWAP_TOKEN = makeETHSwapToken({
        chainId:     ChainId.FANTOM,
        address:     "0x0e3dD3403ee498694A8f61B04AFed8919F747f77",
        netName:     "Fantom",
        poolId:       2,
        swapAddress: "0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1",
        poolTokens:   ETHTokensPool(Tokens.FTM_ETH),
    });

    export const BOBA_POOL_SWAP_TOKEN = makeSwapToken({
        chainId:      ChainId.BOBA,
        address:     "0x9D7283A6AeeD9BCd4Ac70876fEA2b69a63DD8cb9",
        netName:     "Boba",
        poolId:       1,
        swapAddress: "0x75FF037256b36F15919369AC58695550bE72fead",
        poolTokens:   USDPoolTokens(),
    });

    export const BOBA_ETH_SWAP_TOKEN = makeETHSwapToken({
        chainId:        ChainId.BOBA,
        address:        "0x498657f2AF18D525049dE520dD86ee376Db9c67c",
        netName:        "Boba",
        poolId:          2,
        swapAddress:    "0x753bb855c8fe814233d26Bb23aF61cb3d2022bE5",
        swapETHAddress: "0x4F4f66964335D7bef23C16a62Fcd3d1E89f02959",
        poolTokens:      WETHTokenPool,
        nativeTokens:    ETHTokenPool,
    });

    export const METIS_POOL_SWAP_TOKEN = makeSwapToken({
        chainId:      ChainId.METIS,
        address:     "0xC6f684aE516480A35f337a4dA8b40EB6550e07E0",
        netName:     "Metis",
        poolId:       0,
        swapAddress: "0x555982d2E211745b96736665e19D9308B615F78e",
        poolTokens:   [Tokens.NUSD, Tokens.USDC],
    });

    export const METIS_ETH_SWAP_TOKEN = makeETHSwapToken({
        chainId:      ChainId.METIS,
        address:     "0x9C1340Bf093d057fA29819575517fb9fE2f04AcE",
        netName:     "Metis",
        poolId:       1,
        swapAddress: "0x09fEC30669d63A13c666d2129230dD5588E2e240",
        poolTokens:   ETHTokensPool(Tokens.METIS_ETH),
    });

    export const ARBITRUM_POOL_SWAP_TOKEN = makeSwapToken({
        chainId:      ChainId.ARBITRUM,
        address:     "0xcFd72be67Ee69A0dd7cF0f846Fc0D98C33d60F16",
        netName:     "Arbitrum",
        poolId:       2,
        swapAddress: "0x9Dd329F5411466d9e0C488fF72519CA9fEf0cb40",
        poolTokens:   USDPoolTokens(null),
    });

    export const ARBITRUM_ETH_SWAP_TOKEN = makeETHSwapToken({
        chainId:        ChainId.ARBITRUM,
        address:        "0xD70A52248e546A3B260849386410C7170c7BD1E9",
        netName:        "Arbitrum",
        poolId:          0,
        swapAddress:    "0xa067668661C84476aFcDc6fA5D758C4c01C34352",
        swapETHAddress: "0x1c3fe783a7c06bfAbd124F2708F5Cc51fA42E102",
        poolTokens:      WETHTokenPool,
        nativeTokens:    ETHTokenPool,
    });

    export const AVALANCHE_POOL_SWAP_TOKEN = makeSwapToken({
        chainId:      ChainId.AVALANCHE,
        address:     "0xCA87BF3ec55372D9540437d7a86a7750B42C02f4",
        netName:     "Avalanche",
        poolId:       1,
        swapAddress: "0xED2a7edd7413021d440b09D654f3b87712abAB66",
        poolTokens:   USDPoolTokens(),
    });

    const
        AVAX_AVWETH_POOLTOKENS = ETHTokensPool(Tokens.AVWETH),
        AVAX_WETHE_POOLTOKENS  = ETHTokensPool(Tokens.WETH_E);

    export const AVALANCHE_ETH_SWAP_TOKEN = makeETHSwapToken({
        chainId:        ChainId.AVALANCHE,
        address:        "0x5dF1dB940dd8fEE0e0eB0C8917cb50b4dfaDF98c",
        netName:        "Avalanche",
        poolId:          2,
        swapAddress:    "0x77a7e60555bC18B4Be44C181b2575eee46212d44",
        swapETHAddress: "0xdd60483Ace9B215a7c019A44Be2F22Aa9982652E",
        poolTokens:      AVAX_AVWETH_POOLTOKENS,
        nativeTokens:    AVAX_WETHE_POOLTOKENS,
        depositTokens:   AVAX_WETHE_POOLTOKENS,
    });

    export const AURORA_POOL_SWAP_TOKEN = makeSwapToken({
        chainId:      ChainId.AURORA,
        address:     "0xEAdC3524f3F007cdC5104BF28663b1141D3e3127",
        netName:     "Aurora",
        poolId:       0,
        swapAddress: "0xcEf6C2e20898C2604886b888552CA6CcF66933B0",
        poolTokens:   USDPoolTokens(null),
    });

    export const HARMONY_POOL_SWAP_TOKEN = makeSwapToken({
        chainId:      ChainId.HARMONY,
        address:     "0xE269abBFAF52b26D2632F55B6b223A5223088B96",
        netName:     "Harmony",
        poolId:       1,
        swapAddress: "0x3ea9B0ab55F34Fb188824Ee288CeaEfC63cf908e",
        poolTokens:   USDPoolTokens(),
    });

    const ONEETH_POOL_TOKENS = ETHTokensPool(Tokens.ONE_ETH);

    export const HARMONY_ONEETH_TOKEN = makeETHSwapToken({
        chainId:        ChainId.HARMONY,
        address:        "0x464d121D3cA63cEEfd390D76f19364D3Bd024cD2",
        netName:        "Harmony",
        poolName:       "1ETH",
        poolId:          1,
        swapAddress:    "0x2913E812Cf0dcCA30FB28E6Cac3d2DCFF4497688",
        poolTokens:      ONEETH_POOL_TOKENS,
        nativeTokens:    ONEETH_POOL_TOKENS,
        depositTokens:   ONEETH_POOL_TOKENS,
    });

    export const HARMONY_AVAX_SWAP_TOKEN = new SwapToken({
        chainId:  ChainId.HARMONY,
        name:     "AVAX LP Token Harmony ",
        symbol:   "AVAXLP",
        decimals: 18,
        addresses: {
            [ChainId.HARMONY]: "0x02f7D17f126BD54573c8EbAD9e05408A56f46452"
        },
        poolId:      0,
        poolType:    SwapType.AVAX,
        poolName:    "Harmony AVAX Swap Pool ",
        poolTokens:  [Tokens.SYN_AVAX, Tokens.MULTI_AVAX],
        swapAddress: "0x00A4F57D926781f62D09bb05ec76e6D8aE4268da"
    });

    export const HARMONY_JEWEL_SWAP_TOKEN = new SwapToken({
        chainId:  ChainId.HARMONY,
        name:     "Jewel LP Token Harmony ",
        symbol:   "JEWELP",
        decimals: 18,
        addresses: {
            [ChainId.HARMONY]: "0x0000000000000000000000000000000000000000"
        },
        poolId:      0,
        poolType:    SwapType.JEWEL,
        poolName:    "Harmony Jewel Swap Pool ",
        poolTokens:  [Tokens.JEWEL, Tokens.SYN_JEWEL],
        swapAddress: "0x7bE461cce1501f07969BCE24Ccb2140fCA0a35b3"
    });

    const makeSingleTokenPool = (t: Token): LPToken => ({poolTokens: [t], swapType: t.swapType});

    const
        ETH_Pool        = makeSingleTokenPool(Tokens.ETH),
        SYN_Pool        = makeSingleTokenPool(Tokens.SYN),
        FRAX_Pool       = makeSingleTokenPool(Tokens.FRAX),
        HIGH_Pool       = makeSingleTokenPool(Tokens.HIGH),
        DOG_Pool        = makeSingleTokenPool(Tokens.DOG),
        JUMP_Pool       = makeSingleTokenPool(Tokens.JUMP),
        NFD_Pool        = makeSingleTokenPool(Tokens.NFD),
        GOHM_Pool       = makeSingleTokenPool(Tokens.GOHM),
        GMX_Pool        = makeSingleTokenPool(Tokens.GMX),
        SOLAR_Pool      = makeSingleTokenPool(Tokens.SOLAR),
        AVAX_Pool       = makeSingleTokenPool(Tokens.AVAX),
        WAVAX_Pool      = makeSingleTokenPool(Tokens.WAVAX),
        MOVR_Pool       = makeSingleTokenPool(Tokens.MOVR),
        WMOVR_Pool      = makeSingleTokenPool(Tokens.WMOVR),
        UST_Pool        = makeSingleTokenPool(Tokens.UST),
        NEWO_Pool       = makeSingleTokenPool(Tokens.NEWO),
        SDT_Pool        = makeSingleTokenPool(Tokens.SDT),
        LUNA_Pool       = makeSingleTokenPool(Tokens.LUNA),
        USDB_Pool       = makeSingleTokenPool(Tokens.USDB),
        DFK_USDC_Pool   = makeSingleTokenPool(Tokens.DFK_USDC),
        XJEWEL_Pool     = makeSingleTokenPool(Tokens.XJEWEL),
        DFKTEARS_Pool   = makeSingleTokenPool(Tokens.DFKTEARS),
        VSTA_Pool       = makeSingleTokenPool(Tokens.VSTA),
        H20_Pool        = makeSingleTokenPool(Tokens.H20),
        SFI_Pool        = makeSingleTokenPool(Tokens.SFI),
        FTM_Pool       = makeSingleTokenPool(Tokens.FTM),
        WFTM_Pool       = makeSingleTokenPool(Tokens.WFTM),
        KLAY_Pool      = makeSingleTokenPool(Tokens.KLAY),
        WKLAY_Pool      = makeSingleTokenPool(Tokens.WKLAY),
        WMATIC_Pool     = makeSingleTokenPool(Tokens.WMATIC),
        MATIC_Pool     = makeSingleTokenPool(Tokens.MATIC),
        BTCB_Pool       = makeSingleTokenPool(Tokens.BTCB),
        WBTC_Pool       = makeSingleTokenPool(Tokens.WBTC),
        JEWEL_POOL      = makeSingleTokenPool(Tokens.JEWEL),
        DFK_ETH_Pool    = makeSingleTokenPool(Tokens.DFK_ETH),
        WETH_POOL = makeSingleTokenPool(Tokens.WETH);

    const
        AVAX_JEWEL_Pool:    LPToken = {poolTokens: [Tokens.JEWEL, Tokens.MULTIJEWEL], swapType: SwapType.JEWEL},
        DFK_JEWEL_Pool:     LPToken = {poolTokens: [Tokens.GAS_JEWEL, Tokens.JEWEL],  swapType: SwapType.JEWEL},
        HARMONY_JEWEL_Pool: LPToken = {poolTokens: [Tokens.JEWEL, Tokens.SYN_JEWEL],  swapType: SwapType.JEWEL};

    export type SwapTypePoolTokens = SwapTypeMap<LPToken>

    interface SwapTypeMapArgs {
        usdPool?:   [SwapToken, Token[]];
        ethPool?:   [ETHSwapToken, Token[]];
        ohm?:        boolean;
    }

    interface BridgeTokenMapping {
        swappableTokens:     SwapTypeMap<Token[]>;
        swappableSwapGroups: SwapTypeMap<LPToken>;
    }

    type ChainSwapTypePoolsMap = ChainIdTypeMap<BridgeTokenMapping>

    const makeSwapTypeMap = (base: SwapTypeMapArgs, ...pools: LPToken[]): BridgeTokenMapping => {
        let m: BridgeTokenMapping = {
            swappableTokens: {
                [SwapType.SYN]: SYN_Pool.poolTokens,
                [SwapType.UST]: UST_Pool.poolTokens,
                [SwapType.OHM]: GOHM_Pool.poolTokens,
            },
            swappableSwapGroups: {
                [SwapType.SYN]: SYN_Pool,
                [SwapType.UST]: UST_Pool,
                [SwapType.OHM]: GOHM_Pool,
            }
        };

        const {usdPool=null, ethPool=null, ohm: useOhm=true} = base;

        if (usdPool) {
            m.swappableSwapGroups[SwapType.USD] = usdPool[0];
            m.swappableTokens[SwapType.USD] = usdPool[1];
        }
        if (ethPool) {
            m.swappableSwapGroups[SwapType.ETH] = ethPool[0];
            m.swappableTokens[SwapType.ETH] = ethPool[1];
        }

        for (const p of pools) {
            m.swappableTokens[p.swapType] = p.poolTokens;
            m.swappableSwapGroups[p.swapType] = p;
        }

        if (!useOhm) {
            delete m.swappableTokens[SwapType.OHM];
            delete m.swappableSwapGroups[SwapType.OHM];
        }

        return m
    }

    export const bridgeSwappableMap: ChainSwapTypePoolsMap = {
        [ChainId.ETH]: makeSwapTypeMap(
            {
                usdPool: [
                    ETH_POOL_SWAP_TOKEN,
                    [...ETH_POOL_SWAP_TOKEN.poolTokens, Tokens.NUSD]
                ]
            },
            ETH_Pool,
            HIGH_Pool,
            DOG_Pool,
            FRAX_Pool,
            NEWO_Pool,
            SDT_Pool,
            USDB_Pool,
            VSTA_Pool,
            H20_Pool,
            SFI_Pool,
            WBTC_Pool,
        ),
        [ChainId.OPTIMISM]: makeSwapTypeMap(
            {
                usdPool: [OPTIMISM_POOL_SWAP_TOKEN, OPTIMISM_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
                ethPool: [OPTIMISM_ETH_SWAP_TOKEN,  OPTIMISM_ETH_SWAP_TOKEN.poolTokens]
            },
            LUNA_Pool,
        ),
        [ChainId.CRONOS]: makeSwapTypeMap(
            {
                usdPool: [CRONOS_POOL_SWAP_TOKEN, CRONOS_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps]
            }
        ),
        [ChainId.BSC]:    makeSwapTypeMap(
            {
                usdPool: [BSC_POOL_SWAP_TOKEN, BSC_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps]
            },
            HIGH_Pool,
            DOG_Pool,
            JUMP_Pool,
            NFD_Pool,
            USDB_Pool,
        ),
        [ChainId.POLYGON]: makeSwapTypeMap(
            {
                usdPool: [POLYGON_POOL_SWAP_TOKEN, POLYGON_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps]
            },
            NFD_Pool,
            DOG_Pool,
            USDB_Pool,
            H20_Pool,
            MATIC_Pool
        ),
        [ChainId.FANTOM]: makeSwapTypeMap(
            {
                usdPool: [FANTOM_POOL_SWAP_TOKEN, FANTOM_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
                ethPool: [FANTOM_ETH_SWAP_TOKEN,  FANTOM_ETH_SWAP_TOKEN.poolTokensForBridgeSwaps]
            },
            JUMP_Pool,
            FRAX_Pool,
            SDT_Pool,
            USDB_Pool,
            FTM_Pool
        ),
        [ChainId.BOBA]: makeSwapTypeMap(
            {
                usdPool: [BOBA_POOL_SWAP_TOKEN, BOBA_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
                ethPool: [BOBA_ETH_SWAP_TOKEN,  BOBA_ETH_SWAP_TOKEN.poolTokens]
            },
        ),
        [ChainId.METIS]: makeSwapTypeMap(
            {
                usdPool: [METIS_POOL_SWAP_TOKEN, METIS_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
                ethPool: [METIS_ETH_SWAP_TOKEN,  METIS_ETH_SWAP_TOKEN.poolTokensForBridgeSwaps]
            }
        ),
        [ChainId.MOONBEAM]: makeSwapTypeMap(
            {},
            SOLAR_Pool,
            WMOVR_Pool,
            WAVAX_Pool,
        ),
        [ChainId.MOONRIVER]: makeSwapTypeMap(
            {},
            SOLAR_Pool,
            FRAX_Pool,
            MOVR_Pool,
            USDB_Pool,
        ),
        [ChainId.ARBITRUM]: makeSwapTypeMap(
            {
                usdPool: [ARBITRUM_POOL_SWAP_TOKEN, ARBITRUM_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
                ethPool: [ARBITRUM_ETH_SWAP_TOKEN,  ARBITRUM_ETH_SWAP_TOKEN.poolTokens]
            },
            GMX_Pool,
            NEWO_Pool,
            LUNA_Pool,
            VSTA_Pool
        ),
        [ChainId.AVALANCHE]: makeSwapTypeMap(
            {
                usdPool: [AVALANCHE_POOL_SWAP_TOKEN, AVALANCHE_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
                ethPool: [AVALANCHE_ETH_SWAP_TOKEN,  AVALANCHE_ETH_SWAP_TOKEN.poolTokensForBridgeSwaps]
            },
            NFD_Pool,
            GMX_Pool,
            AVAX_Pool,
            NEWO_Pool,
            SDT_Pool,
            USDB_Pool,
            AVAX_JEWEL_Pool,
            SFI_Pool,
            BTCB_Pool
        ),
        [ChainId.DFK]: {
            swappableTokens: {
                [SwapType.USD]:     DFK_USDC_Pool.poolTokens,
                [SwapType.JEWEL]:   DFK_JEWEL_Pool.poolTokens,
                [SwapType.XJEWEL]:  XJEWEL_Pool.poolTokens,
                [SwapType.KLAY]:    WKLAY_Pool.poolTokens,
                [SwapType.BTCB]:    BTCB_Pool.poolTokens,
                [SwapType.FTM]:     WFTM_Pool.poolTokens,
                [SwapType.MATIC]:   WMATIC_Pool.poolTokens,
                [SwapType.DFKTEARS]: DFKTEARS_Pool.poolTokens,
                [SwapType.AVAX]:     WAVAX_Pool.poolTokens,
                [SwapType.ETH]:      [Tokens.DFK_ETH],
            },
            swappableSwapGroups: {
                [SwapType.USD]:      DFK_USDC_Pool,
                [SwapType.JEWEL]:    DFK_JEWEL_Pool,
                [SwapType.XJEWEL]:   XJEWEL_Pool,
                [SwapType.DFKTEARS]: DFKTEARS_Pool,
                [SwapType.AVAX]:     WAVAX_Pool,
                [SwapType.KLAY]:     WKLAY_Pool,
                [SwapType.BTCB]:     BTCB_Pool,
                [SwapType.FTM]:      WFTM_Pool,
                [SwapType.MATIC]:    WMATIC_Pool,
                [SwapType.ETH]:      DFK_ETH_Pool,
            }
        },
        [ChainId.AURORA]: makeSwapTypeMap(
            {
                usdPool: [AURORA_POOL_SWAP_TOKEN, AURORA_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
                ohm:     false
            }
        ),
        [ChainId.HARMONY]: makeSwapTypeMap(
            {
                usdPool: [HARMONY_POOL_SWAP_TOKEN, HARMONY_POOL_SWAP_TOKEN.poolTokensForBridgeSwaps],
                ethPool: [HARMONY_ONEETH_TOKEN,    HARMONY_ONEETH_TOKEN.poolTokensForBridgeSwaps]
            },
            FRAX_Pool,
            SDT_Pool,
            HARMONY_AVAX_SWAP_TOKEN,
            XJEWEL_Pool,
            DFKTEARS_Pool,
            HARMONY_JEWEL_Pool
        ),
        [ChainId.KLAYTN]: {
            swappableTokens: {
                [SwapType.ETH]:      [Tokens.DFK_ETH],
                [SwapType.WBTC]: [Tokens.WBTC],
                [SwapType.KLAY]: KLAY_Pool.poolTokens,
                [SwapType.JEWEL]: [Tokens.JEWEL],
                [SwapType.BTCB]: [Tokens.BTCB],
                [SwapType.AVAX]: [Tokens.WAVAX],
            },
            swappableSwapGroups: {
                [SwapType.ETH]:      DFK_ETH_Pool,
                [SwapType.WBTC]: {poolTokens: [Tokens.WBTC], swapType: SwapType.WBTC},
                [SwapType.KLAY]: KLAY_Pool,
                [SwapType.JEWEL]: JEWEL_POOL,
                [SwapType.BTCB]: BTCB_Pool,
                [SwapType.AVAX]: WAVAX_Pool,
            },
        },
    };

    export function swapGroupsForChain(chainId: number): string[] {
        return Object.values(bridgeSwappableMap[chainId].swappableSwapGroups).map(lp => lp.swapType)
    }

    export function tokensForChainBySwapGroup(
        chainId: number,
        swapGroup: string
    ): Token[] {
        const m = bridgeSwappableMap[chainId].swappableTokens;
        return swapGroup in m ? m[swapGroup] : []
    }

    export function getAllSwappableTokensForNetwork(chainId: number): Token[] {
        let swappableTokens: Token[] = [];

        swapGroupsForChain(chainId).forEach((grp) => {
            const tokens = tokensForChainBySwapGroup(chainId, grp);
            swappableTokens = [...swappableTokens, ...tokens];
        })

        return swappableTokens
    }

    export function stableswapPoolForNetwork(chainId: number): SwapPoolToken {
        switch (chainId) {
            case ChainId.ETH:
                return ETH_POOL_SWAP_TOKEN
            case ChainId.OPTIMISM:
                return OPTIMISM_POOL_SWAP_TOKEN
            case ChainId.CRONOS:
                return CRONOS_POOL_SWAP_TOKEN
            case ChainId.BSC:
                return BSC_POOL_SWAP_TOKEN
            case ChainId.POLYGON:
                return POLYGON_POOL_SWAP_TOKEN
            case ChainId.FANTOM:
                return FANTOM_POOL_SWAP_TOKEN
            case ChainId.BOBA:
                return BOBA_POOL_SWAP_TOKEN
            case ChainId.METIS:
                return METIS_POOL_SWAP_TOKEN
            case ChainId.ARBITRUM:
                return ARBITRUM_POOL_SWAP_TOKEN
            case ChainId.AVALANCHE:
                return AVALANCHE_POOL_SWAP_TOKEN
            case ChainId.AURORA:
                return AURORA_POOL_SWAP_TOKEN
            case ChainId.HARMONY:
                return HARMONY_POOL_SWAP_TOKEN
        }

        return undefined
    }

    export function ethSwapPoolForNetwork(chainId: number): SwapPoolToken {
        switch (chainId) {
            case ChainId.OPTIMISM:
                return OPTIMISM_ETH_SWAP_TOKEN
            case ChainId.FANTOM:
                return FANTOM_ETH_SWAP_TOKEN
            case ChainId.BOBA:
                return BOBA_ETH_SWAP_TOKEN
            case ChainId.METIS:
                return METIS_ETH_SWAP_TOKEN
            case ChainId.ARBITRUM:
                return ARBITRUM_ETH_SWAP_TOKEN
            case ChainId.AVALANCHE:
                return AVALANCHE_ETH_SWAP_TOKEN
            case ChainId.HARMONY:
                return HARMONY_ONEETH_TOKEN
        }

        return undefined
    }

    export const AllSwapPoolTokens: SwapPoolToken[] = [
        ETH_POOL_SWAP_TOKEN,
        OPTIMISM_POOL_SWAP_TOKEN,
        OPTIMISM_ETH_SWAP_TOKEN,
        CRONOS_POOL_SWAP_TOKEN,
        BSC_POOL_SWAP_TOKEN,
        POLYGON_POOL_SWAP_TOKEN,
        FANTOM_POOL_SWAP_TOKEN,
        FANTOM_ETH_SWAP_TOKEN,
        BOBA_POOL_SWAP_TOKEN,
        BOBA_ETH_SWAP_TOKEN,
        METIS_POOL_SWAP_TOKEN,
        METIS_ETH_SWAP_TOKEN,
        ARBITRUM_POOL_SWAP_TOKEN,
        ARBITRUM_ETH_SWAP_TOKEN,
        AVALANCHE_POOL_SWAP_TOKEN,
        AVALANCHE_ETH_SWAP_TOKEN,
        AURORA_POOL_SWAP_TOKEN,
        HARMONY_POOL_SWAP_TOKEN,
        HARMONY_ONEETH_TOKEN,
        HARMONY_AVAX_SWAP_TOKEN,
        HARMONY_JEWEL_SWAP_TOKEN,
    ];

    function checkChainId(t: SwapPoolToken, chainId?: number): boolean {
        if (typeof chainId !== 'undefined' && chainId !== null) {
            return chainId === t.chainId
        }

        return true
    }

    enum CheckAddressKind {
        LpTokenAddress,
        SwapAddress
    }

    function checkSwapPoolTokenAddress(address: string, field: CheckAddressKind, chainId?: number): SwapPoolToken {
        let res: SwapPoolToken = null;

        for (const t of AllSwapPoolTokens) {
            let checkAddress: string;
            switch (field) {
                case CheckAddressKind.LpTokenAddress:
                    checkAddress = t.address(t.chainId);
                    break;
                case CheckAddressKind.SwapAddress:
                    checkAddress = t.swapAddress;
                    break;
            }

            if (checkAddress === address) {
                if (checkChainId(t, chainId)) {
                    res = t;
                    break;
                }
            }
        }

        return res
    }

    export function swapPoolTokenFromLPTokenAddress(lpTokenAddress: string, chainId?: number): SwapPoolToken {
        return checkSwapPoolTokenAddress(lpTokenAddress, CheckAddressKind.LpTokenAddress, chainId)
    }

    export function swapPoolTokenFromSwapAddress(swapAddress: string, chainId?: number): SwapPoolToken {
        return checkSwapPoolTokenAddress(swapAddress, CheckAddressKind.SwapAddress, chainId)
    }

    export function swapPoolTokenForTypeForChain(chainId: number, swapType: SwapType): SwapPoolToken {
        let res: SwapPoolToken = null;

        for (const t of swapPoolTokensForChainId(chainId)) {
            if (t.swapType === swapType) {
                res = t;
                break;
            }
        }

        return res
    }

    export function swapPoolTokensForChainId(chainId: number): SwapPoolToken[] {
        let res: SwapPoolToken[] = [];

        AllSwapPoolTokens.forEach(t => {
            if (t.chainId === chainId) {
                res.push(t);
            }
        });

        return res
    }
}

export type NetworkSwappableTokensMap     = ChainIdTypeMap<Token[]>;
export type AllNetworksSwappableTokensMap = ChainIdTypeMap<NetworkSwappableTokensMap>;

function filterGrps(chainAGrps: string[], chainBGrpsMap: SwapPools.SwapTypePoolTokens): Token[] {
    let tokens: Token[] = [];

    Object.keys(chainBGrpsMap).forEach((grp: string) => {
        if (chainAGrps.includes(grp)) {
            tokens = [...tokens, ...chainBGrpsMap[grp].poolTokens];
        }
    })

    return tokens
}

function swapGroupsLoop(chainIdA: number, swapGrps: string[]): NetworkSwappableTokensMap {
    let res: NetworkSwappableTokensMap = {}

    supportedChainIds().forEach((chainId: number) => {
        if (chainIdA === chainId) {
            return
        }

        res[chainId] = filterGrps(swapGrps, SwapPools.bridgeSwappableMap[chainId].swappableSwapGroups);
    })

    return res
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

    const swapGrpsA: string[] = SwapPools.swapGroupsForChain(chainIdA);

    if (typeof chainIdB !== 'undefined') {
        res[chainIdB] = filterGrps(swapGrpsA, SwapPools.bridgeSwappableMap[chainIdB].swappableSwapGroups);
    } else {
        res = swapGroupsLoop(chainIdA, swapGrpsA);
    }

    return res
}

/**
 * Returns map of all swappable tokens between all supported networks.
 * @return AllNetworksSwappableTokensMap
 */
export function allNetworksSwapTokensMap(): AllNetworksSwappableTokensMap {
    let res: AllNetworksSwappableTokensMap = {};

    supportedChainIds().forEach((chainIdA: number) => {
        const swapGrpsA: string[] = SwapPools.swapGroupsForChain(chainIdA);

        res[chainIdA] = swapGroupsLoop(chainIdA, swapGrpsA);
    })

    return res
}