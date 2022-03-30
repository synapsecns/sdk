import type {ValueOf} from "./types";

export const SwapType = {
    USD:     "USD",
    SYN:     "SYN",
    ETH:     "ETH",
    HIGH:    "HIGHSTREET",
    DOG:     "DOG",
    JUMP:    "JUMP",
    FRAX:    "FRAX",
    NFD:     "NFD",
    OHM:     "OHM",
    GMX:     "GMX",
    SOLAR:   "SOLAR",
    AVAX:    "AVAX",
    MOVR:    "MOVR",
    UST:     "UST",
    NEWO:    "NEWO",
    SDT:     "SDT",
    LUNA:    "LUNA",
    USDB:    "USDB",
    JEWEL:   "JEWEL",
    XJEWEL:  "XJEWEL"
} as const;

export type SwapType = ValueOf<typeof SwapType>

export type SwapTypeMap<T> = {[k in SwapType]?: T}

export const mintBurnSwapTypes: SwapType[] = [
    SwapType.HIGH,   SwapType.DOG,     SwapType.JUMP,
    SwapType.NFD,    SwapType.OHM,     SwapType.SOLAR,
    SwapType.GMX,    SwapType.UST,     SwapType.NEWO,
    SwapType.SDT,    SwapType.LUNA,    SwapType.USDB,
    SwapType.JEWEL,  SwapType.XJEWEL,
];