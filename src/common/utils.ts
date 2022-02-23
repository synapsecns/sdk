import {ChainId} from "./chainid";
import {SynapseContracts} from "./synapse_contracts";

import type {JsonRpcProvider} from "@ethersproject/providers";
import {setRpcUriForNetwork} from "../internal/rpcproviders";

import type {Signer} from "@ethersproject/abstract-signer";

import type {
    PopulatedTransaction,
    ContractTransaction,
} from "@ethersproject/contracts";

export const rejectPromise = (e: any): Promise<never> => Promise.reject(e instanceof Error ? e : new Error(e))

export const executePopulatedTransaction = (
    populatedTxn: Promise<PopulatedTransaction>,
    signer:       Signer,
): Promise<ContractTransaction> =>
    populatedTxn
        .then((populatedTxn: PopulatedTransaction): Promise<ContractTransaction> => signer.sendTransaction(populatedTxn))
        .catch(rejectPromise)


export function contractAddressFor(chainId: number, key: string): string {
    const { address } = contractsForChainId(chainId)[key] || "";
    return address
}


const CHAINID_CONTRACTS_MAP: {[c: number]: SynapseContracts.SynapseContract} = {
    [ChainId.ETH]:       SynapseContracts.Ethereum,
    [ChainId.OPTIMISM]:  SynapseContracts.Optimism,
    [ChainId.CRONOS]:   SynapseContracts.Cronos,
    [ChainId.BSC]:       SynapseContracts.BSC,
    [ChainId.POLYGON]:   SynapseContracts.Polygon,
    [ChainId.FANTOM]:    SynapseContracts.Fantom,
    [ChainId.BOBA]:      SynapseContracts.Boba,
    [ChainId.METIS]:     SynapseContracts.Metis,
    [ChainId.MOONBEAM]:  SynapseContracts.Moonbeam,
    [ChainId.MOONRIVER]: SynapseContracts.Moonriver,
    [ChainId.ARBITRUM]:  SynapseContracts.Arbitrum,
    [ChainId.AVALANCHE]: SynapseContracts.Avalanche,
    [ChainId.AURORA]:    SynapseContracts.Aurora,
    [ChainId.HARMONY]:   SynapseContracts.Harmony,
}

export const contractsForChainId = (chainId: number): SynapseContracts.SynapseContract => CHAINID_CONTRACTS_MAP[chainId] ?? null

/**
 * Sets the JSON-RPC URI for a given chain ID. All SDK functions which use internal, pre-initialized
 * {@link JsonRpcProvider} instances which retrieve the {@link JsonRpcProvider} for the passed chain ID
 * will henceforth use an instance which uses the passed URI.
 * @param chainId
 * @param uri
 */
export function setJsonRpcUriForNetwork(chainId: number, uri: string) {
    setRpcUriForNetwork(chainId, uri);
}