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

export {BaseToken, WrappedToken} from "./token";
export {Tokens} from "./tokens";

export {
    SwapPools,
    networkSwapTokensMap,
    allNetworksSwapTokensMap,
} from "./swappools";

export {TokenSwap, UnsupportedSwapErrors} from "./tokenswap";

import type {ChainIdTypeMap, AddressMap, DecimalsMap, StringMap} from "./common/types";
import type {Token} from "./token";
import type {NetworkSwappableTokensMap} from "./swappools";
import type {
    SynapseBridgeContract,
    GenericZapBridgeContract,
    L1BridgeZapContract,
    L2BridgeZapContract,
    SynapseERC20Contract,
    BridgeConfigContract
} from "./contracts";

type Network = Networks.Network;
type BridgeOutputEstimate = Bridge.BridgeOutputEstimate;

export type {
    Network,
    Token,
    ChainIdTypeMap,
    AddressMap,
    DecimalsMap,
    StringMap,
    NetworkSwappableTokensMap,
    SynapseBridgeContract,
    GenericZapBridgeContract,
    L1BridgeZapContract,
    L2BridgeZapContract,
    SynapseERC20Contract,
    BridgeConfigContract,
    BridgeOutputEstimate,
}