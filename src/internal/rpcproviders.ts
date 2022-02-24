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

const RPC_BATCH_WAIT_TIME_MS = Number(process.env["RPC_BATCH_WAIT_TIME_MS"]) || 60;

console.log(RPC_BATCH_WAIT_TIME_MS);

const
    LOADED_CHAIN_RPC_URIS: StringMap = _.fromPairs(supportedChainIds().map(cid => [cid, rpcUriForChainId(cid)])),
    RPC_CONNECTOR_ARGS               = {urls: LOADED_CHAIN_RPC_URIS, batchWaitTimeMs: RPC_BATCH_WAIT_TIME_MS};

const
    JSONRPC_CONNECTOR:  JsonRpcConnector = new JsonRpcConnector(RPC_CONNECTOR_ARGS),
    WEB3_RPC_CONNECTOR: Web3RpcConnector = new Web3RpcConnector(RPC_CONNECTOR_ARGS);

const DEFAULT_RPC_CONNECTOR = WEB3_RPC_CONNECTOR;

/**
 * @param chainId chain id of the network for which to return a provider
 */
export function rpcProviderForNetwork(chainId: number): Provider {
    return DEFAULT_RPC_CONNECTOR.provider(chainId)
}

export function jsonRpcProviderForNetwork(chainId: number): Provider {
    return JSONRPC_CONNECTOR.provider(chainId)
}

export function web3ProviderForNetwork(chainId: number): Provider {
    return WEB3_RPC_CONNECTOR.provider(chainId)
}

export function rpcUriForChainId(chainId: number): string {
    const
        rpcEnvKey: string           = ENV_KEY_MAP[chainId],
        rpcEnvVal: string|undefined = rpcEnvKey in process.env ? process.env[rpcEnvKey] : undefined;

    return rpcEnvVal ?? CHAIN_RPC_URIS[chainId]
}

/**
 * Used solely for tests, initRpcConnectors() basically just makes sure on-import initialization
 * of Rpc connections occurs before tests run.
 */
export function initRpcConnectors() {
    //
}

