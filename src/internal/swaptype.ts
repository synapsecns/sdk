import type {ValueOf} from "./types";

export const SwapType = {
    USD:      "USD",
    SYN:      "SYN",
    ETH:      "ETH",
    HIGH:     "HIGHSTREET",
    DOG:      "DOG",
    JUMP:     "JUMP",
    FRAX:     "FRAX",
    NFD:      "NFD",
    OHM:      "OHM",
    GMX:      "GMX",
    SOLAR:    "SOLAR",
    AVAX:     "AVAX",
    MOVR:     "MOVR",
    FTM:      "FTM",
    KLAY:     "KLAY",
    MATIC:    "MATIC",
    BTCB:     "BTCB",
    LINK:     "LINK",
    UST:      "UST",
    NEWO:     "NEWO",
    SDT:      "SDT",
    LUNA:     "LUNA",
    USDB:     "USDB",
    JEWEL:    "JEWEL",
    XJEWEL:   "XJEWEL",
    DFKTEARS: "DFKTEARS",
    VSTA:     "VSTA",
    H20:      "H20",
    WBTC:     "WBTC",
    SFI:      "SFI",
} as const;

export type SwapType = ValueOf<typeof SwapType>

export type SwapTypeMap<T> = {[k in SwapType]?: T}

export const mintBurnSwapTypes: SwapType[] = [
    SwapType.HIGH,   SwapType.DOG,     SwapType.JUMP,
    SwapType.NFD,    SwapType.OHM,     SwapType.SOLAR,
    SwapType.GMX,    SwapType.UST,     SwapType.NEWO,
    SwapType.SDT,    SwapType.LUNA,    SwapType.USDB,
    SwapType.JEWEL,  SwapType.XJEWEL,  SwapType.VSTA,
    SwapType.H20,    SwapType.SFI,     SwapType.WBTC,
    SwapType.SFI,    SwapType.BTCB,    SwapType.KLAY,
    SwapType.MATIC,  SwapType.FTM
];