import {ChainId}          from "@chainid";
import {SynapseContracts} from "@synapsecontracts";
import {StaticCallResult} from "./types";

import {BigNumber} from "@ethersproject/bignumber";

import type {Signer} from "@ethersproject/abstract-signer";
import type {
    PopulatedTransaction,
    ContractTransaction,
} from "@ethersproject/contracts";

export function rejectPromise(e: any): Promise<never> { return Promise.reject(e instanceof Error ? e : new Error(e)) }

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

export function pow10(exp: number): BigNumber { return BigNumber.from(10).pow(exp) }

/**
 * "Fixes" a value into units of Wei; should be used when tokens
 * have a decimals value which isn't 18
 * (such as USDC/USDT on chains which aren't BSC) and you need to do
 * calculations using proper units of Wei instead of, for example in the case of
 * USDC/USDT, Szabo (10^-6)
 * @param amt
 * @param decimals
 */
export function fixWeiValue(amt: BigNumber, decimals: number): BigNumber {
    const multiplier = pow10(18).div(pow10(decimals))
    return amt.mul(multiplier)
}

export function contractAddressFor(chainId: number, key: string): string {
    let address: string;

    const contractsForChain = contractsForChainId(chainId);

    switch (key) {
        case "bridgeAddress":
            address = contractsForChain.bridgeAddress;
            break;
        case "bridgeZapAddress":
            address = contractsForChain.bridgeZapAddress;
            break;

    }

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
    [ChainId.DFK]:       SynapseContracts.DFK,
    [ChainId.AURORA]:    SynapseContracts.Aurora,
    [ChainId.HARMONY]:   SynapseContracts.Harmony,
}

export const contractsForChainId = (chainId: number): SynapseContracts.SynapseContract => CHAINID_CONTRACTS_MAP[chainId] ?? null