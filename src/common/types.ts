import type {ChainIdTypeMap} from "@chainid";
import type {Signer}   from "@ethersproject/abstract-signer";
import type {Provider} from "@ethersproject/providers";

export type SignerOrProvider = Signer | Provider;

export type StringMap   = ChainIdTypeMap<string>
export type DecimalsMap = ChainIdTypeMap<number>

export type AddressMap  = StringMap

export enum StaticCallResult {
    Success,
    Failure
}