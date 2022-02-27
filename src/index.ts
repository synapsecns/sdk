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

export {Bridge} from "@bridge/bridge";
export {Slippages} from "@bridge/slippages";

export {
    ChainId,
    supportedChainIds
} from "@common/chainid";

export {
    Networks,
    supportedNetworks
} from "@common/networks";

export {
    type Token,
    BaseToken,
    WrappedToken
} from "@token";

export {Tokens} from "@tokens";

export {
    SwapPools,
    networkSwapTokensMap,
    allNetworksSwapTokensMap,
    type NetworkSwappableTokensMap
} from "@swappools";

export {TokenSwap, UnsupportedSwapErrors} from "@tokenswap";

export {
    type RPCEndpointsConfig,
    configureRPCEndpoints
} from "@internal/rpcproviders";

export type {
    SynapseBridgeContract,
    GenericZapBridgeContract,
    L1BridgeZapContract,
    L2BridgeZapContract,
    SynapseERC20Contract,
    BridgeConfigV3Contract
} from "@contracts";