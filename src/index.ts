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
export {UnsupportedSwapReason} from "./bridge/errors";

export type BridgeOutputEstimate = Bridge.BridgeOutputEstimate;

export {
    ChainId,
    supportedChainIds
} from "./common/chainid";

export {
    Networks,
    supportedNetworks
} from "./common/networks";

export type {ChainIdTypeMap, AddressMap, DecimalsMap} from "./common/types";

export {BaseToken, WrappedToken} from "./token";
export type {Token} from "./token";

export {Tokens} from "./tokens";

export {
    SwapPools,
    networkSwapTokensMap,
    allNetworksSwapTokensMap,
    detailedTokenSwapMap,
    swappableTokens,
    swappableTokensAllNetworks,
} from "./swappools";

export type {
    DetailedTokenSwapMap,
    NetworkSwappableTokensMap
} from "./swappools";

export type {
    SynapseBridgeContract,
    GenericZapBridgeContract,
    L1BridgeZapContract,
    L2BridgeZapContract,
    SynapseERC20Contract,
    BridgeConfigContract
} from "./contracts";
