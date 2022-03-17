export enum SwapType {
    USD     = "USD",
    SYN     = "SYN",
    ETH     = "ETH",
    HIGH    = "HIGHSTREET",
    DOG     = "DOG",
    JUMP    = "JUMP",
    FRAX    = "FRAX",
    NFD     = "NFD",
    OHM     = "OHM",
    GMX     = "GMX",
    SOLAR   = "SOLAR",
    AVAX    = "AVAX",
    MOVR    = "MOVR",
    UST     = "UST",
    NEWO    = "NEWO",
    LUNA    = "LUNA",
}

export const mintBurnSwapTypes = [
    SwapType.HIGH, SwapType.DOG, SwapType.JUMP,
    SwapType.NFD,  SwapType.OHM, SwapType.SOLAR,
    SwapType.GMX,  SwapType.UST, SwapType.NEWO,
    SwapType.LUNA,
];