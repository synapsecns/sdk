import _ from "lodash";

import type {Provider} from "@ethersproject/providers";

import {ChainId, supportedChainIds} from "@chainid";
import type {StringMap} from "@common/types";

import {RpcConnector} from "./rpcconnector";

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
    [ChainId.MOONRIVER]: "https://rpc.api.moonriver.moonbeam.network",
    [ChainId.ARBITRUM]:  "https://arb1.arbitrum.io/rpc",
    [ChainId.AVALANCHE]: "https://api.avax.network/ext/bc/C/rpc",
    [ChainId.DFK]:       "https://rpc.dfkchain.com",
    [ChainId.AURORA]:    "https://mainnet.aurora.dev",
    [ChainId.HARMONY]:   "https://api.harmony.one/",
}

const CHAINID_URI_MAP: StringMap = _.fromPairs(supportedChainIds().map(cid => [cid, _getChainRpcUri(cid)]));

const RPC_BATCH_INTERVAL = Number(process.env["RPC_BATCH_INTERVAL"]) || 60;

const RPC_CONNECTOR = new RpcConnector({
    urls:          CHAINID_URI_MAP,
    batchInterval: RPC_BATCH_INTERVAL
});

function _getChainRpcUri(chainId: number): string {
    const
        rpcEnvKey: string           = ENV_KEY_MAP[chainId],
        rpcEnvVal: string|undefined = rpcEnvKey in process.env ? process.env[rpcEnvKey] : undefined;

    return rpcEnvVal ?? CHAIN_RPC_URIS[chainId]
}

/**
 * @param chainId chain id of the network for which to return a provider
 */
export function rpcProviderForChain(chainId: number): Provider {
    return RPC_CONNECTOR.provider(chainId)
}

export interface RPCEndpointsConfig {
    [chainId: number]: {
        endpoint:       string,
        batchInterval?: number,
    }
}

export function configureRPCEndpoints(config: RPCEndpointsConfig) {
    for (const chainId of supportedChainIds()) {
        if (config[chainId]) {
            let {endpoint, batchInterval} = config[chainId];
            RPC_CONNECTOR.setProviderConfig(chainId, endpoint, batchInterval);
        }
    }
}
/**
 * Used solely for tests, initRpcConnectors() basically just makes sure on-import initialization
 * of Rpc connections occurs before tests run.
 * @internal
 */
export function initRpcConnectors() {}