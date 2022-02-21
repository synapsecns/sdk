export enum ChainId {
    ETH          = 1,
    OPTIMISM     = 10,
    CHRONOS      = 25,
    BSC          = 56,
    POLYGON      = 137,
    FANTOM       = 250,
    BOBA         = 288,
    METIS        = 1088,
    MOONBEAM     = 1284,
    MOONRIVER    = 1285,
    ARBITRUM     = 42161,
    AVALANCHE    = 43114,
    AURORA       = 1313161554,
    HARMONY      = 1666600000,
}

export const supportedChainIds = (): number[] => [
    ChainId.ETH,       ChainId.OPTIMISM,  ChainId.CHRONOS,
    ChainId.BSC,       ChainId.POLYGON,   ChainId.FANTOM,
    ChainId.BOBA,      ChainId.METIS,     ChainId.MOONBEAM,
    ChainId.MOONRIVER, ChainId.ARBITRUM,  ChainId.AVALANCHE,
    ChainId.AURORA,    ChainId.HARMONY,
]