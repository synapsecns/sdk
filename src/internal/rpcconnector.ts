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

    supportedChainIds(): number[] {
        return Object.keys(this.urls).map(cid => Number(cid))
    }
}