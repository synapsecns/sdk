export {
    newSynapseBridgeInstance,
    newL1BridgeZapInstance,
    newL2BridgeZapInstance
} from "@entities";

import {SynapseEntities} from "@entities";

export const {
    synapseBridge,
    l1BridgeZap,
    l2BridgeZap,
} = SynapseEntities;

import {Bridge} from "@bridge/bridge";
export {Bridge};
export {Slippages} from "@bridge/slippages";

export {
    ChainId,
    supportedChainIds
} from "@common/chainid";

export {
    Networks,
    supportedNetworks
} from "@common/networks";

export {BaseToken, WrappedToken} from "@token";
export {Tokens} from "@tokens";

export {
    SwapPools,
    networkSwapTokensMap,
    allNetworksSwapTokensMap,
} from "@swappools";

export {TokenSwap, UnsupportedSwapErrors} from "@tokenswap";

export type {ChainIdTypeMap, AddressMap, DecimalsMap, StringMap} from "@common/types";
export type {Token} from "@token";
export type {NetworkSwappableTokensMap} from "@swappools";
export type {
    SynapseBridgeContract,
    GenericZapBridgeContract,
    L1BridgeZapContract,
    L2BridgeZapContract,
    SynapseERC20Contract,
    BridgeConfigV3Contract
} from "@contracts";