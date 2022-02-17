import type {
    SynapseBridge,
    L1BridgeZap,
    L2BridgeZap,
    SynapseERC20,
    BridgeConfig,
} from "./internal/gen/index";


export declare type SynapseBridgeContract = SynapseBridge;
export declare type L1BridgeZapContract = L1BridgeZap;
export declare type L2BridgeZapContract = L2BridgeZap;
export declare type SynapseERC20Contract = SynapseERC20;
export declare type BridgeConfigContract = BridgeConfig;

export declare type GenericZapBridgeContract = L1BridgeZap | L2BridgeZapContract;
