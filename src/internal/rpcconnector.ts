import type {ChainIdTypeMap, StringMap} from "@common/types";

import type {Provider} from "@ethersproject/providers";
import {Web3Provider} from "@ethersproject/providers";

import {MiniRpcProvider} from "./minirpc";

interface RpcConnectorArgs {
    urls:           StringMap,
    batchInterval?: number,
}

export class RpcConnector {
    private _providers:     ChainIdTypeMap<MiniRpcProvider>;
    private _web3Providers: ChainIdTypeMap<Web3Provider>

    private _chainUris: {[chainId: number]: string};


    constructor(args: RpcConnectorArgs) {
        const {urls, batchInterval=50} = args;

        this._chainUris = urls;

        const miniRpcProviders = Object.keys(urls).reduce((acc, chainId) => {
            const cid = Number(chainId);
            acc[cid]  = this._newProvider(cid, urls[cid], batchInterval);
            return acc
        }, {});

        const web3Providers = Object.keys(miniRpcProviders).reduce((acc, chainId) => {
            const cid = Number(chainId);
            acc[cid]  = new Web3Provider(miniRpcProviders[cid]);
            return acc
        }, {});

        this._providers = miniRpcProviders;
        this._web3Providers = web3Providers;
    }

    provider(chainId: number): Provider {
        return this._web3Providers[chainId]
    }

    providerUri(chainId: number): string {
        return this._providers[chainId].url
    }

    /**
     * @internal
     */
    _miniRpcProvider(chainId: number): MiniRpcProvider {
        return this._providers[chainId]
    }

    /**
     * @internal
     */
    addProvider(
        chainId: number,
        uri: string,
        batchInterval: number = 50,
        override: boolean = false
    ) {
        if (this._providers[chainId] && !override) {
            return
        }

        const provider = this._newProvider(chainId, uri, batchInterval);

        this._chainUris[chainId]     = uri;
        this._providers[chainId]     = provider
        this._web3Providers[chainId] = new Web3Provider(provider);
    }

    /**
     * @internal
     */
    setProviderUri(chainId: number, newUri: string) {
        if (this._providers[chainId]) {
            this._chainUris[chainId] = newUri;

            this._providers[chainId].url = newUri;
            this._web3Providers[chainId] = new Web3Provider(this._providers[chainId]);
        }
    }

    /**
     * @internal
     */
    setProviderBatchInterval(chainId: number, batchInterval: number) {
        if (this._providers[chainId]) {
            this._providers[chainId].batchInterval = batchInterval;
            this._web3Providers[chainId] = new Web3Provider(this._providers[chainId]);
        }
    }

    private _newProvider(
        chainId: number,
        uri: string,
        batchInterval: number
    ): MiniRpcProvider {
        return new MiniRpcProvider(
            chainId,
            uri,
            batchInterval
        );
    }
}