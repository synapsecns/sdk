import { request } from 'graphql-request';
import { buildTxnQuery } from './gql/query_builder.js';
import { BRIDGE_TXN_API_GRAPHQL_URL } from './gql/utils.js';

/**
 * @notice Gets transaction info with a GraphQL query
 * @param query_type The type of query to build. Types in QUERY_INFO
 * @param chainId The chainId to query for. Optional.
 * @param address The address to query for. Optional.
 * @param txnHash The transaction hash to query for. Optional.
 * @param kappa The kappa to query for. Optional.
 * @returns A promise that resolves to the transaction info as a JSON object
 */
export async function getBridgeTxnInfo(
  query_type: string,
  chainId?: number,
  address?: string,
  txnHash?: string,
  kappa?: string,
): Promise<JSON> {
  const query = buildTxnQuery(query_type, chainId, address, txnHash, kappa);
  return await request(BRIDGE_TXN_API_GRAPHQL_URL, query);
}