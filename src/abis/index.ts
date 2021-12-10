import SynapseBridgeABI from "./SynapseBridge.json";
import SynapseERC20ABI from "./SynapseERC20.json";
import L2BridgeZapABI from "./L2BridgeZap.json";
import L1BridgeZapABI from "./L1BridgeZap.json";

export namespace ABIs {
    export const
        SynapseBridge      = SynapseBridgeABI.abi,
        L1BridgeZap        = L1BridgeZapABI.abi,
        L2BridgeZap        = L2BridgeZapABI.abi,
        SynapseERC20       = SynapseERC20ABI.abi;
}