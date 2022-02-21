import {ChainIdTypeMap, StringMap} from "../common/types";
import {JsonRpcProvider} from "@ethersproject/providers";

export class RpcConnector {
    protected urls:      StringMap;
    protected providers: ChainIdTypeMap<JsonRpcProvider>;

    constructor(args: {urls: StringMap}) {
        const {urls} = args;
        this.urls = urls;
        this.providers = Object.keys(urls).reduce((acc, chainId) => {
            const cid = Number(chainId);
            acc[cid] = new JsonRpcProvider(urls[cid]);
            return acc
        }, {});
    }

    provider(chainId: number): JsonRpcProvider {
        return this.providers[chainId]
    }

    /**
     * Returns a potentially new {@link JsonRpcProvider} instance for the given chain ID
     * using the passed uri for the connection.
     * If the passed uri is the same as the uri for a pre-existing JsonRpcProvider instance,
     * said instance is returned rather than instantiating a brand new one.
     * @param chainId
     * @param uri
     */
    providerWithUri(chainId: number, uri: string): JsonRpcProvider {
        const _existingProvider = this.providers[chainId];

        if (_existingProvider?.connection.url === uri) {
            return _existingProvider
        }

        return new JsonRpcProvider(uri)
    }

    /**
     * Re-initializes the JsonRpcProvider instance for a given chain ID using the passed URI.
     * This operation is permanent for the lifetime of whatever is using the RpcConnector.
     * @param chainId
     * @param uri
     */
    setProviderUri(chainId: number, uri: string) {
        if (chainId in this.providers) {
            delete this.providers[chainId];
        }

        this.providers[chainId] = new JsonRpcProvider(uri);
    }

    supportedChainIds(): number[] {
        return Object.keys(this.urls).map(cid => Number(cid))
    }
}