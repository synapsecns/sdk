import {JsonRpcProvider} from "@ethersproject/providers";

import {ChainId} from "../common";


const PROVIDERS: {[c:number]: JsonRpcProvider} = {
    [ChainId.ETH]:       new JsonRpcProvider("https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"),
    [ChainId.OPTIMISM]:  new JsonRpcProvider("https://mainnet.optimism.io"),
    [ChainId.BSC]:       new JsonRpcProvider("https://bsc-dataseed.binance.org"),
    [ChainId.POLYGON]:   new JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/O6nbQONUKZ-V4B_4111Xt7Dg0vm_bQEm"),
    [ChainId.FANTOM]:    new JsonRpcProvider("https://rpc.ftm.tools/"),
    [ChainId.BOBA]:      new JsonRpcProvider("https://mainnet.boba.network/"),
    [ChainId.MOONRIVER]: new JsonRpcProvider("https://rpc.moonriver.moonbeam.network"),
    [ChainId.ARBITRUM]:  new JsonRpcProvider("https://arb1.arbitrum.io/rpc"),
    [ChainId.AVALANCHE]: new JsonRpcProvider("https://api.avax.network/ext/bc/C/rpc"),
    [ChainId.HARMONY]:   new JsonRpcProvider("https://api.harmony.one"),
}


export const newProviderForNetwork = (chainId: number): JsonRpcProvider => PROVIDERS[chainId] ?? null

