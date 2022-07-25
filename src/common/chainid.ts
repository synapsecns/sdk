import type {ValueOf} from "@internal/types";

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
    "DFK":          53935,
    "AURORA":       1313161554,
    "HARMONY":      1666600000,
    "KLAYTN":       8217,
} as const;

export type ChainId = ValueOf<typeof ChainId> | number

export type ChainIdTypeMap<T> = {[k in ChainId]?: T}

/* c8 ignore next 4 */
export function supportedChainIds(): number[] {
    return Object.values(ChainId)
        .map(k => Number.isNaN(Number(k)) ? null : Number(k))
        .filter(c => c !== null);
}

export const EIP1559Chains: ChainIdTypeMap<boolean> = {
    [ChainId.ETH]: 		 true,
    [ChainId.OPTIMISM]:  false,
    [ChainId.CRONOS]:    false,
    [ChainId.BSC]:       false,
    [ChainId.POLYGON]:   true,
    [ChainId.FANTOM]:    false,
    [ChainId.BOBA]:      false,
    [ChainId.METIS]:     false,
    [ChainId.MOONBEAM]:  true,
    [ChainId.MOONRIVER]: true,
    [ChainId.ARBITRUM]:  false,
    [ChainId.AVALANCHE]: true,
    [ChainId.DFK]: 		 true,
    [ChainId.AURORA]:    false,
    [ChainId.HARMONY]:   false,
    [ChainId.KLAYTN]:    false
} as const;

export function chainSupportsEIP1559(chainId: number): boolean { return chainId in EIP1559Chains ? EIP1559Chains[chainId] : false }