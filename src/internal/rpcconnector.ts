import type {ChainIdTypeMap, StringMap} from "../common/types";
import {JsonRpcProvider, Provider} from "@ethersproject/providers";

import {MiniRpcProvider} from "./minirpc";

import type {ConnectorUpdate} from "@web3-react/types";
import {AbstractConnector} from "@web3-react/abstract-connector";

export interface ProviderConnector<T extends Provider | MiniRpcProvider> {
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
            acc[cid] = newProvider(urls[cid]);
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

export class RpcConnector extends AbstractProviderConnector<JsonRpcProvider> implements ProviderConnector<JsonRpcProvider> {
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

export class Web3Connector extends AbstractConnector {
    readonly urls:      StringMap;
    readonly providers: ChainIdTypeMap<MiniRpcProvider>;

    currentChainId: number;

    constructor(args: {
        urls:           StringMap,
        defaultChainId: number
    }) {
        const {urls, defaultChainId} = args;

        super({
            supportedChainIds: Object.keys(urls).map(k => Number(k))
        });

        this.urls = urls;
        this.currentChainId = defaultChainId || Number(Object.keys(urls)[0]);

        this.providers = Object.keys(urls).reduce((acc, chainId) => {
            const cid = Number(chainId);
            acc[cid] = new MiniRpcProvider(cid, urls[cid]);
            return acc
        }, {});
    }

    get provider(): MiniRpcProvider {
        return this.providers[this.currentChainId]
    }

    async getProvider(): Promise<any> {
        return this.providers[this.currentChainId]
    }

    async getChainId(): Promise<number | string> {
        return this.currentChainId
    }

    async getAccount(): Promise<null | string> {
        return null
    }

    async activate(): Promise<ConnectorUpdate> {
        return {
            provider: this.providers[this.currentChainId],
            chainId:  this.currentChainId,
            account:  null,
        }
    }

    deactivate(): void {
        return
    }
}