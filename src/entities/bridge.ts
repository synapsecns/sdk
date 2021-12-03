import {
    SynapseBridgeContract,
    SynapseBridgeFactory,
    NerveBridgeZapContract,
    NerveBridgeZapFactory,
    L2BridgeZapContract,
    L2BridgeZapFactory,
} from "../contracts";

import type {SignerOrProvider} from "../common";


export const newSynapseBridgeInstance = (params: {
    address: string,
    signerOrProvider?: SignerOrProvider
}): SynapseBridgeContract => SynapseBridgeFactory.connect(params.address, params.signerOrProvider);


export const newNerveBridgeZapInstance = (params: {
    address: string,
    signerOrProvider?: SignerOrProvider
}): NerveBridgeZapContract => NerveBridgeZapFactory.connect(params.address, params.signerOrProvider);


export const newL2BridgeZapInstance = (params: {
    address: string,
    signerOrProvider?: SignerOrProvider
}): L2BridgeZapContract => L2BridgeZapFactory.connect(params.address, params.signerOrProvider);
