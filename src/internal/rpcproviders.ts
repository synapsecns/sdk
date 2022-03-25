import {fromPairs} from "lodash-es";

import type {Provider} from "@ethersproject/providers";

import {
    ChainId,
    supportedChainIds,
    isTerraChainId
} from "@chainid";
import type {StringMap} from "@common/types";

import {
    EvmRpcConnector,
    TerraRpcConnector
} from "./rpcconnector";

import {LCDClient} from "@terra-money/terra.js";

enum UriMapKind {
    evm,
    nonEvm,
}

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
    [ChainId.TERRA]:     "TERRA_RPC_URI",
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
    [ChainId.TERRA]:     "https://lcd.terra.dev/",
    [ChainId.AURORA]:    "https://mainnet.aurora.dev",
    [ChainId.HARMONY]:   "https://api.harmony.one/",
}

const
    EVM_CHAINS_URI_MAP:    StringMap = _makeChainIdMap(UriMapKind.evm),
    NONEVM_CHAINS_URI_MAP: StringMap = _makeChainIdMap(UriMapKind.nonEvm);


const RPC_BATCH_INTERVAL = Number(process.env["RPC_BATCH_INTERVAL"]) || 60;

const EVM_RPC_CONNECTOR = new EvmRpcConnector({
    urls:          EVM_CHAINS_URI_MAP,
    batchInterval: RPC_BATCH_INTERVAL
});

const TERRA_RPC_CONNECTOR = new TerraRpcConnector({
    urls: NONEVM_CHAINS_URI_MAP
});

function _makeChainIdMap(mapKind: UriMapKind): StringMap {
    let allChainIds = supportedChainIds();

    let filterFn: (cid: number) => boolean;

    switch (mapKind) {
        case UriMapKind.evm:
            filterFn = cid => !isTerraChainId(cid)
            break;
        case UriMapKind.nonEvm:
            filterFn = cid => isTerraChainId(cid)
            break;
    }

    return fromPairs(
        allChainIds
            .filter(filterFn)
            .map(cid => [cid, _getChainRpcUri(cid)])
    );
}

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
    /* c8 ignore next 4 */
    if (isTerraChainId(chainId)) {
        console.error("call `terraRpcProvider(chainId)` for a Terra-compatible RPC provider");
        return null
    }

    return EVM_RPC_CONNECTOR.provider(chainId)
}

export function terraRpcProvider(chainId: number = ChainId.TERRA): LCDClient {
    /* c8 ignore next 4 */
    if (!isTerraChainId(chainId)) {
        console.error("call `rpcProviderForChain(chainId)` for an EVM-compatible RPC provider");
        return null
    }

    return TERRA_RPC_CONNECTOR.provider(chainId)
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
            isTerraChainId(chainId)
                ? TERRA_RPC_CONNECTOR.setProviderConfig(chainId, endpoint, batchInterval)
                : EVM_RPC_CONNECTOR.setProviderConfig(chainId, endpoint, batchInterval);
        }
    }
}
/**
 * Used solely for tests, initRpcConnectors() basically just makes sure on-import initialization
 * of Rpc connections occurs before tests run.
 * @internal
 */
export function initRpcConnectors() {}