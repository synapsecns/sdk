import {
    SynapseBridgeContract,
    SynapseBridgeFactory,
    L1BridgeZapContract,
    L1BridgeZapFactory,
    L2BridgeZapContract,
    L2BridgeZapFactory,
} from "../contracts";

import type {SignerOrProvider} from "../common";


export const newSynapseBridgeInstance = (params: {
    address: string,
    signerOrProvider?: SignerOrProvider
}): SynapseBridgeContract => SynapseBridgeFactory.connect(params.address, params.signerOrProvider);


export const newL1BridgeZapInstance = (params: {
    address: string,
    signerOrProvider?: SignerOrProvider
}): L1BridgeZapContract => L1BridgeZapFactory.connect(params.address, params.signerOrProvider);


export const newL2BridgeZapInstance = (params: {
    address: string,
    signerOrProvider?: SignerOrProvider
}): L2BridgeZapContract => L2BridgeZapFactory.connect(params.address, params.signerOrProvider);
