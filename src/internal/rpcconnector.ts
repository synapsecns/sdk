import type {ChainIdTypeMap} from "@chainid";
import type {StringMap} from "@common/types";

import type {Provider} from "@ethersproject/providers";
import {Web3Provider} from "@ethersproject/providers";

import {MiniRpcProvider} from "./minirpc";

interface RpcConnectorArgs {
    urls:           StringMap;
    batchInterval?: number;
}

export class RpcConnector {
    protected _providers:     ChainIdTypeMap<MiniRpcProvider>;
    protected _web3Providers: ChainIdTypeMap<Web3Provider>

    protected _chainEndpoints: {[chainId: number]: string};


    constructor(args: RpcConnectorArgs) {
        const {urls, batchInterval=50} = args;

        this._chainEndpoints = urls;

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

        this._providers     = miniRpcProviders;
        this._web3Providers = web3Providers;
    }

    provider(chainId: number): Provider {
        return this._web3Providers[chainId]
    }

    /**
     * @internal
     */
    setProviderConfig(
        chainId:       number,
        endpoint:      string,
        batchInterval: number = 50,
    ) {
        const provider = this._newProvider(chainId, endpoint, batchInterval);

        delete this._chainEndpoints[chainId];
        delete this._providers[chainId];
        delete this._web3Providers[chainId];

        this._chainEndpoints[chainId] = endpoint;
        this._providers[chainId]      = provider
        this._web3Providers[chainId]  = new Web3Provider(provider);
    }

    private _newProvider(
        chainId:       number,
        endpoint:      string,
        batchInterval: number
    ): MiniRpcProvider {
        return new MiniRpcProvider(
            chainId,
            endpoint,
            batchInterval
        );
    }
}