import {JsonRpcProvider} from "@ethersproject/providers";

import {ChainId} from "../common";


const PROVIDERS: {[c:number]: JsonRpcProvider} = {
    [ChainId.ETH]:       new JsonRpcProvider("https://eth-mainnet.alchemyapi.io/v2/0AovFRYl9L7l4YUf6nPaMrs7H2_pj_Pf"),
    [ChainId.OPTIMISM]:  new JsonRpcProvider("https://mainnet.optimism.io"),
    [ChainId.BSC]:       new JsonRpcProvider("https://bsc-dataseed1.binance.org/"),
    [ChainId.POLYGON]:   new JsonRpcProvider("https://polygon-rpc.com/"),
    [ChainId.FANTOM]:    new JsonRpcProvider("https://rpc.ftm.tools/"),
    [ChainId.BOBA]:      new JsonRpcProvider("https://replica-oolong.boba.network/"),
    [ChainId.MOONRIVER]: new JsonRpcProvider("https://rpc.moonriver.moonbeam.network"),
    [ChainId.ARBITRUM]:  new JsonRpcProvider("https://arb1.arbitrum.io/rpc"),
    [ChainId.AVALANCHE]: new JsonRpcProvider("https://api.avax.network/ext/bc/C/rpc"),
    [ChainId.HARMONY]:   new JsonRpcProvider("https://harmony-0-rpc.gateway.pokt.network/"),
}


export const newProviderForNetwork = (chainId: number): JsonRpcProvider => PROVIDERS[chainId] ?? null

