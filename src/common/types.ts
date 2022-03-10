import type {ChainId} from "./chainid";
import type {Signer}   from "@ethersproject/abstract-signer";
import type {
    Provider,
    TransactionRequest,
    TransactionResponse
} from "@ethersproject/providers";

import type {BlockTxBroadcastResult, MsgExecuteContract} from "@terra-money/terra.js";
import {PopulatedTransaction} from "@ethersproject/contracts";

export type Deferrable<T> = {[ K in keyof T ]: T[K] | Promise<T[K]>};
export type Resolveable<T> = T | Promise<T>

export type GenericTxnRequest  = PopulatedTransaction | TransactionRequest | MsgExecuteContract;
export type GenericTxnResponse = TransactionResponse | BlockTxBroadcastResult;

export interface GenericSigner {
    getAddress:      () => Promise<string>;
    sendTransaction: (tx: Resolveable<GenericTxnRequest> | Deferrable<GenericTxnRequest>) => Promise<GenericTxnResponse>;
}

export type SignerOrProvider = Signer | Provider;

export type ChainIdTypeMap<T> = {[k in ChainId]?: T}


export type StringMap   = ChainIdTypeMap<string>
export type NumberMap   = ChainIdTypeMap<number>

export type AddressMap  = StringMap

export enum StaticCallResult {
    Success,
    Failure
}