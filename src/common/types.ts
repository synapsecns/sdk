import {Signer} from "@ethersproject/abstract-signer";
import {Provider} from "@ethersproject/providers";

export interface ChainIdTypeMap<T> {[chainId: number]: T}
export type AddressMap  = ChainIdTypeMap<string>
export type DecimalsMap = ChainIdTypeMap<number>

export type SignerOrProvider = Signer | Provider;
