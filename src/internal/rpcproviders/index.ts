import {JsonRpcProvider} from "@ethersproject/providers";

import {ChainId} from "../../common";

import {rpcUriForChainId} from "./uris";

interface RpcProviderMap {[c: number]: JsonRpcProvider}

const PROVIDERS: RpcProviderMap = ((): RpcProviderMap => {
    let m: RpcProviderMap = {};

    ChainId.supportedChainIds().map((c) => {
        m[c] = new JsonRpcProvider(rpcUriForChainId(c));
    })

    return m
})()


export const newProviderForNetwork = (chainId: number): JsonRpcProvider => PROVIDERS[chainId] ?? null

