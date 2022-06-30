import type {
    L1BridgeZap as L1BridgeZapContract,
    L2BridgeZap as L2BridgeZapContract
} from "@internal/gen/index";

type GenericZapBridgeContract = L1BridgeZapContract | L2BridgeZapContract;

export type {
    L1BridgeZapContract,
    L2BridgeZapContract,
    GenericZapBridgeContract
}

export type {
    SynapseBridge      as SynapseBridgeContract,
    SynapseERC20       as SynapseERC20Contract,
    SwapFlashLoan      as SwapContract,
    BridgeConfigV3     as BridgeConfigV3Contract,
    ERC20              as ERC20Contract,
    AvaxJewelMigration as AvaxJewelMigrationContract
} from "@internal/gen/index";

export {
    SynapseBridge__factory      as SynapseBridgeFactory,
    L1BridgeZap__factory        as L1BridgeZapFactory,
    L2BridgeZap__factory        as L2BridgeZapFactory,
    SynapseERC20__factory       as SynapseERC20Factory,
    SwapFlashLoan__factory      as SwapFactory,
    BridgeConfigV3__factory     as BridgeConfigV3Factory,
    ERC20__factory              as ERC20Factory,
    AvaxJewelMigration__factory as AvaxJewelMigrationFactory
} from "@internal/gen/index";