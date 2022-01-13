import {ChainId} from "./chainid";
import {SynapseContracts} from "./synapse_contracts";

import {Signer} from "@ethersproject/abstract-signer";
import {Provider} from "@ethersproject/providers";
import {PopulatedTransaction, ContractTransaction} from "@ethersproject/contracts";


export type SignerOrProvider = Signer | Provider;


export const rejectPromise = (e: any): Promise<never> => Promise.reject(e instanceof Error ? e : new Error(e))


export function executePopulatedTransaction(
    populatedTxn: Promise<PopulatedTransaction>,
    signer: Signer
): Promise<ContractTransaction> {
    return populatedTxn
        .then((populatedTxn: PopulatedTransaction) => signer.sendTransaction(populatedTxn))
        .catch(rejectPromise)
}


export function contractAddressFor(chainId: number, key: string): string {
    const { address } = contractsForChainId(chainId)[key];
    return address
}


const CHAINID_CONTRACTS_MAP: {[c: number]: SynapseContracts.SynapseContract} = {
    [ChainId.ETH]:       SynapseContracts.Ethereum,
    [ChainId.OPTIMISM]:  SynapseContracts.Optimism,
    [ChainId.BSC]:       SynapseContracts.BSC,
    [ChainId.POLYGON]:   SynapseContracts.Polygon,
    [ChainId.FANTOM]:    SynapseContracts.Fantom,
    [ChainId.BOBA]:      SynapseContracts.Boba,
    [ChainId.MOONBEAM]:  SynapseContracts.Moonbeam,
    [ChainId.MOONRIVER]: SynapseContracts.Moonriver,
    [ChainId.ARBITRUM]:  SynapseContracts.Arbitrum,
    [ChainId.AVALANCHE]: SynapseContracts.Avalanche,
    [ChainId.AURORA]:    SynapseContracts.Aurora,
    [ChainId.HARMONY]:   SynapseContracts.Harmony,
}

export const contractsForChainId = (chainId: number): SynapseContracts.SynapseContract => CHAINID_CONTRACTS_MAP[chainId] ?? null

