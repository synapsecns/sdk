import type {
    SynapseBridge  as SynapseBridgeContract,
    L1BridgeZap    as L1BridgeZapContract,
    L2BridgeZap    as L2BridgeZapContract,
    SynapseERC20   as SynapseERC20Contract,
    SwapFlashLoan  as SwapContract,
    BridgeConfigV3 as BridgeConfigV3Contract,
    ERC20 as ERC20Contract
} from "@internal/gen/index";

type GenericZapBridgeContract = L1BridgeZapContract | L2BridgeZapContract;

export type {
    SynapseBridgeContract,
    L1BridgeZapContract,
    L2BridgeZapContract,
    SynapseERC20Contract,
    SwapContract,
    BridgeConfigV3Contract,
    GenericZapBridgeContract,
    ERC20Contract
}

export {
    SynapseBridge__factory as SynapseBridgeFactory,
    L1BridgeZap__factory as L1BridgeZapFactory,
    L2BridgeZap__factory as L2BridgeZapFactory,
    SynapseERC20__factory as SynapseERC20Factory,
    SwapFlashLoan__factory as SwapFactory,
    BridgeConfigV3__factory as BridgeConfigV3Factory,
    ERC20__factory as ERC20Factory
} from "@internal/gen/index";