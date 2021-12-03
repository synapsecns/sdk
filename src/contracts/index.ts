import type {
    SynapseBridge as SynapseBridgeContract,
    NerveBridgeZap as NerveBridgeZapContract,
    L2BridgeZap as L2BridgeZapContract,
    SynapseERC20 as SynapseERC20Contract,
    BridgeConfig as BridgeConfigContract,
    ERC20 as ERC20Contract
} from "./gen";

type GenericZapBridgeContract = NerveBridgeZapContract | L2BridgeZapContract;

export type {
    SynapseBridgeContract,
    NerveBridgeZapContract,
    L2BridgeZapContract,
    SynapseERC20Contract,
    BridgeConfigContract,
    GenericZapBridgeContract,
    ERC20Contract
}

export {
    SynapseBridge__factory as SynapseBridgeFactory,
    NerveBridgeZap__factory as NerveBridgeZapFactory,
    L2BridgeZap__factory as L2BridgeZapFactory,
    SynapseERC20__factory as SynapseERC20Factory,
    BridgeConfig__factory as BridgeConfigFactory,
    ERC20__factory as ERC20Factory
} from "./gen";