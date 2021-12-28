import SynapseBridgeABI from "./SynapseBridge";
import SynapseERC20ABI from "./SynapseERC20";
import L2BridgeZapABI from "./L2BridgeZap";
import L1BridgeZapABI from "./L1BridgeZap";

export namespace ABIs {
    export const
        SynapseBridge = SynapseBridgeABI.abi,
        L1BridgeZap   = L1BridgeZapABI.abi,
        L2BridgeZap   = L2BridgeZapABI.abi,
        SynapseERC20  = SynapseERC20ABI.abi;
}