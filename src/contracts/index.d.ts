import type {
    SynapseBridge,
    NerveBridgeZap,
    L2BridgeZap,
    SynapseERC20,
    BridgeConfig,
} from "./gen";


export declare type SynapseBridgeContract = SynapseBridge;
export declare type NerveBridgeZapContract = NerveBridgeZap;
export declare type L2BridgeZapContract = L2BridgeZap;
export declare type SynapseERC20Contract = SynapseERC20;
export declare type BridgeConfigContract = BridgeConfig;

export declare type GenericZapBridgeContract = NerveBridgeZapContract | L2BridgeZapContract;
