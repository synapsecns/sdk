import dotenv from 'dotenv'
import {ChainId} from "../common";

dotenv.config()

const
    ETH_RPC_URI_ENV:       string = "ETH_RPC_URI",
    OPTIMISM_RPC_URI_ENV:  string = "OPTIMISM_RPC_URI",
    BSC_RPC_URI_ENV:       string = "BSC_RPC_URI",
    POLYGON_RPC_URI_ENV:   string = "POLYGON_RPC_URI",
    FANTOM_RPC_URI_ENV:    string = "FANTOM_RPC_URI",
    BOBA_RPC_URI_ENV:      string = "BOBA_RPC_URI",
    MOONRIVER_RPC_URI_ENV: string = "MOONRIVER_RPC_URI",
    ARBITRUM_RPC_URI_ENV:  string = "ARBITRUM_RPC_URI",
    AVALANCHE_RPC_URI_ENV: string = "AVALANCHE_RPC_URI",
    AURORA_RPC_URI_ENV:    string = "AURORA_RPC_URI",
    HARMONY_RPC_URI_ENV:   string = "HARMONY_RPC_URI";


const ENV_KEY_MAP: {[c: number]: string} = {
    [ChainId.ETH]:       ETH_RPC_URI_ENV,
    [ChainId.OPTIMISM]:  OPTIMISM_RPC_URI_ENV,
    [ChainId.BSC]:       BSC_RPC_URI_ENV,
    [ChainId.POLYGON]:   POLYGON_RPC_URI_ENV,
    [ChainId.FANTOM]:    FANTOM_RPC_URI_ENV,
    [ChainId.BOBA]:      BOBA_RPC_URI_ENV,
    [ChainId.MOONRIVER]: MOONRIVER_RPC_URI_ENV,
    [ChainId.ARBITRUM]:  ARBITRUM_RPC_URI_ENV,
    [ChainId.AVALANCHE]: AVALANCHE_RPC_URI_ENV,
    [ChainId.AURORA]:    AURORA_RPC_URI_ENV,
    [ChainId.HARMONY]:   HARMONY_RPC_URI_ENV,
}

const CHAIN_RPC_URIS: {[c: number]: string} = {
    [ChainId.ETH]:       "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    [ChainId.OPTIMISM]:  "https://mainnet.optimism.io",
    [ChainId.BSC]:       "https://bsc-dataseed1.binance.org/",
    [ChainId.POLYGON]:   "https://polygon-rpc.com/",
    [ChainId.FANTOM]:    "https://rpc.ftm.tools/",
    [ChainId.BOBA]:      "https://replica-oolong.boba.network/",
    [ChainId.MOONRIVER]: "https://rpc.moonriver.moonbeam.network",
    [ChainId.ARBITRUM]:  "https://arb1.arbitrum.io/rpc",
    [ChainId.AVALANCHE]: "https://api.avax.network/ext/bc/C/rpc",
    [ChainId.AURORA]:    "https://mainnet.aurora.dev",
    [ChainId.HARMONY]:   "https://api.harmony.one/",
}

export const rpcUriForChainId = (chainId: number): string => {
    return checkEnv(chainId) ?? CHAIN_RPC_URIS[chainId]
}

const checkEnv = (chainId: number): string|undefined => {
    const envKey: string = ENV_KEY_MAP[chainId];

    if (envKey in process.env) {
        return process.env[envKey]
    }

    return undefined
}