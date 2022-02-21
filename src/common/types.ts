import type {Signer} from "@ethersproject/abstract-signer";
import type {Provider} from "@ethersproject/providers";

export type SignerOrProvider = Signer | Provider;

export interface ChainIdTypeMap<T> {[chainId: number]: T}
export type AddressMap  = ChainIdTypeMap<string>
export type DecimalsMap = ChainIdTypeMap<number>
