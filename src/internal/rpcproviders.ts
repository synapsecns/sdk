import dotenv from "dotenv";

dotenv.config();

import _ from "lodash";

import type {Provider} from "@ethersproject/providers";

import {ChainId, supportedChainIds} from "@chainid";
import type {StringMap} from "@common/types";

import {Web3RpcConnector, JsonRpcConnector} from "./rpcconnector";

const ENV_KEY_MAP: StringMap = {
    [ChainId.ETH]:       "ETH_RPC_URI",
    [ChainId.OPTIMISM]:  "OPTIMISM_RPC_URI",
    [ChainId.CRONOS]:    "CRONOS_RPC_URI",
    [ChainId.BSC]:       "BSC_RPC_URI",
    [ChainId.POLYGON]:   "POLYGON_RPC_URI",
    [ChainId.FANTOM]:    "FANTOM_RPC_URI",
    [ChainId.BOBA]:      "BOBA_RPC_URI",
    [ChainId.METIS]:     "METIS_RPC_URI",
    [ChainId.MOONBEAM]:  "MOONBEAM_RPC_URI",
    [ChainId.MOONRIVER]: "MOONRIVER_RPC_URI",
    [ChainId.ARBITRUM]:  "ARBITRUM_RPC_URI",
    [ChainId.AVALANCHE]: "AVALANCHE_RPC_URI",
    [ChainId.AURORA]:    "AURORA_RPC_URI",
    [ChainId.HARMONY]:   "HARMONY_RPC_URI",
}

const CHAIN_RPC_URIS: StringMap = {
    [ChainId.ETH]:       "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    [ChainId.OPTIMISM]:  "https://mainnet.optimism.io",
    [ChainId.CRONOS]:    "https://evm-cronos.crypto.org",
    [ChainId.BSC]:       "https://bsc-dataseed.binance.org/",
    [ChainId.POLYGON]:   "https://polygon-rpc.com/",
    [ChainId.FANTOM]:    "https://rpc.ftm.tools/",
    [ChainId.BOBA]:      "https://replica-oolong.boba.network/",
    [ChainId.METIS]:     "https://andromeda.metis.io/?owner=1088",
    [ChainId.MOONBEAM]:  "https://rpc.api.moonbeam.network",
    [ChainId.MOONRIVER]: "https://rpc.moonriver.moonbeam.network",
    [ChainId.ARBITRUM]:  "https://arb1.arbitrum.io/rpc",
    [ChainId.AVALANCHE]: "https://api.avax.network/ext/bc/C/rpc",
    [ChainId.AURORA]:    "https://mainnet.aurora.dev",
    [ChainId.HARMONY]:   "https://api.harmony.one/",
}

const LOADED_CHAIN_RPC_URIS: StringMap = _.fromPairs(supportedChainIds().map(cid => [cid, rpcUriForChainId(cid)]))

const
    RPC_CONNECTOR:      JsonRpcConnector = new JsonRpcConnector({urls: LOADED_CHAIN_RPC_URIS}),
    WEB3_RPC_CONNECTOR: Web3RpcConnector = new Web3RpcConnector({urls: LOADED_CHAIN_RPC_URIS, batchWaitTimeMs: 65});

const DEFAULT_CONNECTOR = WEB3_RPC_CONNECTOR;

/**
 * @param chainId chain id of the network for which to return a provider
 */
export function rpcProviderForNetwork(chainId: number): Provider {
    return DEFAULT_CONNECTOR.provider(chainId)
}

export function jsonRpcProviderForNetwork(chainId: number): Provider {
    return RPC_CONNECTOR.provider(chainId)
}

export function web3ProviderForNetwork(chainId: number): Provider {
    return WEB3_RPC_CONNECTOR.provider(chainId)
}

export function rpcUriForChainId(chainId: number): string {
    return checkEnv(chainId) ?? CHAIN_RPC_URIS[chainId]
}

function checkEnv(chainId: number): string|undefined {
    const envKey: string = ENV_KEY_MAP[chainId];

    return envKey in process.env ? process.env[envKey] : undefined
}

/**
 * Used solely for tests, initRpcConnectors() basically just makes sure on-import initialization
 * of Rpc connections occurs before tests run.
 */
export function initRpcConnectors() {
    //
}

