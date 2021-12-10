export {
    newSynapseBridgeInstance,
    newNerveBridgeZapInstance,
    newL2BridgeZapInstance
} from "./entities";

import {SynapseEntities} from "./entities";

export const {
    synapseBridge,
    l1BridgeZap,
    l2BridgeZap,
} = SynapseEntities;

import {Bridge, Slippages, UnsupportedSwapReason} from "./bridge";

export type BridgeOutputEstimate = Bridge.BridgeOutputEstimate;

export {Bridge, Slippages, UnsupportedSwapReason}

export {
    ChainId,
    Networks,
    supportedChainIds,
    supportedNetworks,
    utils
} from "./common";

export {Token} from "./token";

export {Tokens} from "./tokens";

export {SwapPools, swappableTokens, swappableTokensAllNetworks} from "./swappools";
export type {NetworkSwappableTokensMap} from "./swappools";

export type {
    SynapseBridgeContract,
    GenericZapBridgeContract,
    L1BridgeZapContract,
    L2BridgeZapContract,
    SynapseERC20Contract,
    BridgeConfigContract
} from "./contracts";
