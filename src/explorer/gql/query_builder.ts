import { gql } from 'graphql-request';
import { QUERY_INFO } from './utils.js';

/**
 * @notice Builds string with txn parameters for a GraphQL query
 * @param chainId - Chain ID. Optional.
 * @param address - Address. Optional.
 * @param txnHash - Transaction hash. Optional.
 * @param kappa - Kappa. Optional.
 * @returns String with txn parameters for a GraphQL query
 */
export function buildTxnParams(
    chainId?: number,
    address?: string,
    txnHash?: string,
    kappa?: string,
): string {
    if (!chainId && !address && !txnHash && !kappa) {
        throw new Error('Must provide at least one of chainId, address, txnHash, kappa');
    };
    
    let query_params = ``;

    if (chainId) {
        query_params += `chainId: ${chainId}`;
    }
    if (address) {
        if (query_params.length > 0) {
            query_params += ", ";
        }
        query_params += `address: "${address}"`;
    }
    if (txnHash) {
        if (query_params.length > 0) {
            query_params += ", ";
        }
        query_params += `txnHash: "${txnHash}"`;
    }
    if (kappa) {
        if (query_params.length > 0) {
            query_params += ", ";
        }
        query_params += `kappa: "${kappa}"`;
    }

    return query_params;
}

/**
 * @notice Builds a GraphQL query string for the given query type
 * @param query_type The type of query to build. Types in QUERY_INFO
 * @param chainId The chainId to query for. Optional.
 * @param address The address to query for. Optional.
 * @param txnHash The transaction hash to query for. Optional.
 * @param kappa The kappa to query for. Optional.
 * @returns A GraphQL query string
 */
export function buildTxnQuery(
    query_type: string,
    chainId?: number,
    address?: string,
    txnHash?: string,
    kappa?: string,
): string {
    // Get the parameters of the query
    const query_params = buildTxnParams(chainId, address, txnHash, kappa);

    // Construct the query
    const query = gql`
        query{
            bridgeTransactions(${query_params}) {
                ${QUERY_INFO[query_type]}
            }
        }
    `;

    return query;
}
