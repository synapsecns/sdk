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

<<<<<<< HEAD
import {Bridge} from "./bridge/bridge";
=======
import {Bridge, Slippages} from "./bridge";
>>>>>>> 3d8ea4e (Implement token swaps in the SDK (#35))

export {Bridge};
export {Slippages} from "./bridge/slippages";
export {UnsupportedSwapReason} from "./bridge/errors";

<<<<<<< HEAD
export type BridgeOutputEstimate = Bridge.BridgeOutputEstimate;
=======
export {Bridge, Slippages}
>>>>>>> 3d8ea4e (Implement token swaps in the SDK (#35))

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
