import type {ChainIdTypeMap, StringMap} from "@common/types";

import type {Provider} from "@ethersproject/providers";
import {JsonRpcProvider, Web3Provider} from "@ethersproject/providers";

import {MiniRpcProvider} from "./minirpc";

export interface ProviderConnector<T extends Provider> {
    provider:          (chainId: number) => T;
    providerWithUri:   (chainId: number, uri: string) => T;
    setProviderUri:    (chainId: number, uri: string) => void;
    supportedChainIds: () => number[];
}

class AbstractProviderConnector<T extends Provider> implements ProviderConnector<T> {
    protected urls:           StringMap;
    protected providers:      ChainIdTypeMap<T>;
    protected newProviderFn:  (uri: string) => T;

    constructor(args: {
        urls: StringMap,
        newProvider: (uri: string) => T
    }) {
        const {urls, newProvider} = args;
        this.urls = urls;
        this.newProviderFn = newProvider;
        this.providers = Object.keys(urls).reduce((acc, chainId) => {
            const cid = Number(chainId);
            acc[cid]  = newProvider(urls[cid]);
            return acc
        }, {});
    }

    provider(chainId: number): T {
        return this.providers[chainId]
    }

    providerWithUri(chainId: number, uri: string): T {
        return this.newProviderFn(uri)
    }

    /**
     * Re-initializes the Provider instance for a given chain ID using the passed URI.
     * This operation is permanent for the lifetime of whatever is using the RpcConnector.
     * @param chainId
     * @param uri
     */
    setProviderUri(chainId: number, uri: string) {
        if (chainId in this.providers) {
            delete this.providers[chainId];
        }

        this.providers[chainId] = this.newProviderFn(uri);
    }

    supportedChainIds(): number[] {
        return Object.keys(this.urls).map(cid => Number(cid))
    }
}

export class JsonRpcConnector extends AbstractProviderConnector<JsonRpcProvider> implements ProviderConnector<JsonRpcProvider> {
    constructor(args: {urls: StringMap}) {
        super({
            ...args,
            newProvider: (uri: string) => new JsonRpcProvider(uri)
        });
    }

    /**
     * Returns a potentially new {@link JsonRpcProvider} instance for the given chain ID
     * using the passed uri for the connection.
     * If the passed uri is the same as the uri for a pre-existing JsonRpcProvider instance,
     * said instance is returned rather than instantiating a brand new one.
     * @param chainId
     * @param uri
     * @override
     */
    providerWithUri(chainId: number, uri: string): JsonRpcProvider {
        const _existing = this.providers[chainId];
        if (_existing?.connection.url === uri) {
            return _existing
        }

        return super.providerWithUri(chainId, uri)
    }
}

export class Web3RpcConnector extends AbstractProviderConnector<Web3Provider> implements ProviderConnector<Web3Provider> {
    constructor(args: {urls: StringMap, batchWaitTimeMs?: number}) {
        let invertedUrlsMap = Object.keys(args.urls).reduce((acc, chainId) => {
            const cid = Number(chainId);
            const url = args.urls[cid];
            acc[url] = cid;
            return acc
        }, {})

        super({
            ...args,
            newProvider: (uri: string) => {
                const provider = new MiniRpcProvider(invertedUrlsMap[uri], uri, args.batchWaitTimeMs);
                return new Web3Provider(provider)
            }
        });
    }

    /**
     * Returns a potentially new {@link Web3Provider} instance for the given chain ID
     * using the passed uri for the connection.
     * If the passed uri is the same as the uri for a pre-existing JsonRpcProvider instance,
     * said instance is returned rather than instantiating a brand new one.
     * @param chainId
     * @param uri
     * @override
     */
    providerWithUri(chainId: number, uri: string): Web3Provider {
        const _existing = this.providers[chainId];
        if (_existing?.connection.url === uri) {
            return _existing
        }

        return super.providerWithUri(chainId, uri)
    }
}