import type {ChainIdTypeMap, StringMap} from "@common/types";

import type {Provider} from "@ethersproject/providers";
import {JsonRpcProvider, Web3Provider} from "@ethersproject/providers";

import {MiniRpcProvider} from "./minirpc";

export interface ProviderConnector<T extends Provider> {
    provider:          (chainId: number) => T;
    supportedChainIds: () => number[];
}

class AbstractProviderConnector<T extends Provider> implements ProviderConnector<T> {
    protected urls:           StringMap;
    protected providers:      ChainIdTypeMap<T>;
    protected newProviderFn:  (uri: string) => T;

    constructor(args: {
        urls:        StringMap,
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

    supportedChainIds(): number[] {
        return Object.keys(this.urls).map(cid => Number(cid))
    }
}

interface RpcConnectorArgs {
    urls:             StringMap,
    batchWaitTimeMs?: number,
}

export class JsonRpcConnector
    extends AbstractProviderConnector<JsonRpcProvider>
    implements ProviderConnector<JsonRpcProvider>
{
    constructor(args: RpcConnectorArgs) {
        super({
            ...args,
            newProvider: (uri: string) => new JsonRpcProvider(uri)
        });
    }
}

export class Web3RpcConnector
    extends AbstractProviderConnector<Web3Provider>
    implements ProviderConnector<Web3Provider>
{
    constructor(args: RpcConnectorArgs) {
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
}