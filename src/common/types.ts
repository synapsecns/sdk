export interface ChainIdTypeMap<T> {[chainId: number]: T}
export type AddressMap  = ChainIdTypeMap<string>
export type DecimalsMap = ChainIdTypeMap<number>

