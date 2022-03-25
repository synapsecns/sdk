import type {ValueOf} from "@internal";

export const ChainId = {
    "ETH":          1,
    "OPTIMISM":     10,
    "CRONOS":       25,
    "BSC":          56,
    "POLYGON":      137,
    "FANTOM":       250,
    "BOBA":         288,
    "METIS":        1088,
    "MOONBEAM":     1284,
    "MOONRIVER":    1285,
    "ARBITRUM":     42161,
    "AVALANCHE":    43114,
    "TERRA":        121014925,
    "AURORA":       1313161554,
    "HARMONY":      1666600000,
} as const;

export type ChainId = ValueOf<typeof ChainId> | number

export const TerraChainNames: {[cid: number]: string} = {
    [ChainId.TERRA]: "columbus-5"
}

export const supportedChainIds = (): number[] =>
    Object.values(ChainId)
        .map(k => Number.isNaN(Number(k)) ? null : Number(k))
        .filter(c => c !== null);


export const terraChainIdName = (chainId: number) => TerraChainNames[chainId];
export const isTerraChainId   = (chainId: number) => Object.keys(TerraChainNames).includes(chainId.toString());