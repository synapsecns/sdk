import { BRIDGE_TXN_API_GRAPHQL_URL, DEFAULT_QUERY_RESPONSE } from '../gqlutils.js';

/**
 * @notice Builds string with txn parameters for a GraphQL query
 * @param chainId - Chain ID. Optional.
 * @param address - Address. Optional.
 * @param txnHash - Transaction hash. Optional.
 * @param kappa - Kappa. Optional.
 * @returns String with txn parameters for a GraphQL query
 */
function buildTxnParams(
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
* @param chainId The chainId to query for. Optional.
* @param address The address to query for. Optional.
* @param txnHash The transaction hash to query for. Optional.
* @param kappa The kappa to query for. Optional.
* @returns A GraphQL query string
*/
function buildTxnQuery(
  chainId?: number,
  address?: string,
  txnHash?: string,
  kappa?: string,
): string {
  // Get the parameters of the query
  const query_params = buildTxnParams(chainId, address, txnHash, kappa);

  // Construct the query
  const query = `
      query{
          bridgeTransactions(${query_params}) {
              ${DEFAULT_QUERY_RESPONSE}
          }
      }
  `;

  return query;
}

/**
 * @notice Gets transaction info with a GraphQL query
 * @param chainId The chainId to query for. Optional.
 * @param address The address to query for. Optional.
 * @param txnHash The transaction hash to query for. Optional.
 * @param kappa The kappa to query for. Optional.
 * @returns A promise that resolves to the transaction info as a JSON object
 */
 export async function getBridgeTxnInfo(
  chainId?: number,
  address?: string,
  txnHash?: string,
  kappa?: string,
): Promise<JSON> {
  const query = buildTxnQuery(chainId, address, txnHash, kappa);
  return (await fetch(BRIDGE_TXN_API_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })).json();
}

// getBridgeTxnInfo(null, null, null, "0x5f102aacb2bb0f900df542e7d736c186de3838c762eb0a953e6f0a834243da5b").then(res => { console.log(JSON.stringify(res)) })
// getBridgeTxnInfo(null, null, null, null).then(res => { console.log(JSON.stringify(res)) })