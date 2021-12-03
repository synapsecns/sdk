import SynapseBridgeABI from "./SynapseBridge.json";
import NerveBridgeZapABI from "./NerveBridgeZap.json";
import SynapseERC20ABI from "./SynapseERC20.json";
import L2BridgeZapABI from "./L2BridgeZap.json";

export namespace ABIs {
    export const
        SynapseBridge      = SynapseBridgeABI.abi,
        NerveBridgeZap     = NerveBridgeZapABI.abi,
        L2BridgeZap        = L2BridgeZapABI.abi,
        SynapseERC20       = SynapseERC20ABI.abi;
}