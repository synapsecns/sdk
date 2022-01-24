import type {
    SynapseBridge as SynapseBridgeContract,
    L1BridgeZap as L1BridgeZapContract,
    L2BridgeZap as L2BridgeZapContract,
    SynapseERC20 as SynapseERC20Contract,
    SwapFlashLoan as SwapContract,
    BridgeConfig as BridgeConfigContract,
    PoolConfig as PoolConfigContract,
    ERC20 as ERC20Contract
} from "./gen";

type GenericZapBridgeContract = L1BridgeZapContract | L2BridgeZapContract;

export type {
    SynapseBridgeContract,
    L1BridgeZapContract,
    L2BridgeZapContract,
    SynapseERC20Contract,
    SwapContract,
    BridgeConfigContract,
    PoolConfigContract,
    GenericZapBridgeContract,
    ERC20Contract
}

export {
    SynapseBridge__factory as SynapseBridgeFactory,
    L1BridgeZap__factory as L1BridgeZapFactory,
    L2BridgeZap__factory as L2BridgeZapFactory,
    SynapseERC20__factory as SynapseERC20Factory,
    SwapFlashLoan__factory as SwapFactory,
    BridgeConfig__factory as BridgeConfigFactory,
    PoolConfig__factory as PoolConfigFactory,
    ERC20__factory as ERC20Factory
} from "./gen";