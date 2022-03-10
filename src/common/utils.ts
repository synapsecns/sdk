import {ChainId}          from "@chainid";
import {SynapseContracts} from "./synapse_contracts";

import {
    GenericSigner,
    Resolveable,
    GenericTxnRequest,
    GenericTxnResponse,
    StaticCallResult,
} from "./types";

import {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import {arrayify, BytesLike} from "@ethersproject/bytes";
import type {Signer}  from "@ethersproject/abstract-signer";
import type {PopulatedTransaction} from "@ethersproject/contracts";
import bech32 from "bech32";

export function rejectPromise(e: any): Promise<never> { return Promise.reject(e instanceof Error ? e : new Error(e)) }

export function executePopulatedTransaction(
    populatedTxn: GenericTxnRequest,
    signer:       GenericSigner,
): Promise<GenericTxnResponse> {
    return Promise.resolve(populatedTxn)
        .then(txn => signer.sendTransaction(txn))
        .catch(rejectPromise)
}

export function staticCallPopulatedTransaction(
    populatedTxn: Resolveable<PopulatedTransaction>,
    signer:       Signer,
    successFn?:   (result: BytesLike, tx?: {data: string, value?: BigNumberish}) => boolean
): Promise<StaticCallResult> {
    return Promise.resolve(populatedTxn)
        .then(txn => signer.call(txn)
            .then((res): number  => {
                let successRes = StaticCallResult.Success;
                /* c8 ignore start */
                if (successFn && (txn.data && txn.data !== "0x")) {
                    try {
                        let {data="", value} = txn;
                        successRes = successFn(res, {data, value})
                            ? StaticCallResult.Success
                            : StaticCallResult.Failure
                    } catch {}
                }
                /* c8 ignore stop */

                return successRes
        })
            .catch((err) => {
                // console.error(err);
                return StaticCallResult.Failure
            })
        )
        .catch(rejectPromise)
}

function pow10(exp: number): BigNumber { return BigNumber.from(10).pow(exp) }

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
    [ChainId.TERRA]:     SynapseContracts.Terra,
    [ChainId.AURORA]:    SynapseContracts.Aurora,
    [ChainId.HARMONY]:   SynapseContracts.Harmony,
}

export const contractsForChainId = (chainId: number): SynapseContracts.SynapseContract => CHAINID_CONTRACTS_MAP[chainId] ?? nullexport function decodeHexTerraAddress(hexAddr: string): string {
    let addrAsBytes: number[] = [];
    arrayify(hexAddr).forEach(b => addrAsBytes.push(b));

    return bech32.encode("terra", addrAsBytes);
}