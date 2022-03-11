import {ChainId}          from "@chainid";
import {SynapseContracts} from "./synapse_contracts";
import {StaticCallResult} from "./types";

import type {Signer}      from "@ethersproject/abstract-signer";

import type {
    PopulatedTransaction,
    ContractTransaction,
} from "@ethersproject/contracts";

export const rejectPromise = (e: any): Promise<never> => Promise.reject(e instanceof Error ? e : new Error(e))

type Resolveable<T> = T | Promise<T>

export function executePopulatedTransaction(
    populatedTxn: Resolveable<PopulatedTransaction>,
    signer:       Signer,
): Promise<ContractTransaction> {
    return Promise.resolve(populatedTxn)
        .then(txn => signer.sendTransaction(txn))
        .catch(rejectPromise)
}

export function staticCallPopulatedTransaction(
    populatedTxn: Resolveable<PopulatedTransaction>,
    signer:       Signer
): Promise<StaticCallResult> {
    return Promise.resolve(populatedTxn)
        .then(txn => {
            return signer.call(txn)
                .then(()  => StaticCallResult.Success)
                .catch((err) => StaticCallResult.Failure)
        })
}

export function contractAddressFor(chainId: number, key: string): string {
    const { address } = contractsForChainId(chainId)[key] || "";
    return address
}


const CHAINID_CONTRACTS_MAP: {[c: number]: SynapseContracts.SynapseContract} = {
    [ChainId.ETH]:       SynapseContracts.Ethereum,
    [ChainId.OPTIMISM]:  SynapseContracts.Optimism,
    [ChainId.CRONOS]:    SynapseContracts.Cronos,
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