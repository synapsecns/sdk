export {
    newSynapseBridgeInstance,
    newL1BridgeZapInstance,
    newL2BridgeZapInstance
} from "./entities";

import {SynapseEntities} from "./entities";

export const {
    synapseBridge,
    l1BridgeZap,
    l2BridgeZap,
} = SynapseEntities;

import {Bridge} from "./bridge/bridge";

export {Bridge};
export {Slippages} from "./bridge/slippages";

export type BridgeOutputEstimate = Bridge.BridgeOutputEstimate;

export {
    ChainId,
    supportedChainIds
} from "./common/chainid";

import {
    Networks,
    supportedNetworks
} from "./common/networks";

export {
    Networks,
    supportedNetworks
};

export type Network = Networks.Network;

export type {ChainIdTypeMap, AddressMap, DecimalsMap} from "./common/types";

export {BaseToken, WrappedToken} from "./token";
export type {Token} from "./token";

export {Tokens} from "./tokens";

export {
    SwapPools,
    networkSwapTokensMap,
    allNetworksSwapTokensMap,
    swappableTokens,
    swappableTokensAllNetworks,
} from "./swappools";

export type {
    NetworkSwappableTokensMap
} from "./swappools";

export {TokenSwap, UnsupportedSwapErrors} from "./tokenswap";

export type {
    SynapseBridgeContract,
    GenericZapBridgeContract,
    L1BridgeZapContract,
    L2BridgeZapContract,
    SynapseERC20Contract,
    BridgeConfigContract
} from "./contracts";
