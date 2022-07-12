import {
  BRIDGE_TXN_API_GRAPHQL_URL,
  DEFAULT_QUERY_RESPONSE,
} from "../gqlutils.js";
import fetch from "node-fetch";

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
  kappa?: string
): string {
  if (!chainId && !address && !txnHash && !kappa) {
    throw new Error(
      "Must provide at least one of chainId, address, txnHash, kappa"
    );
  }

  let query_params = "";

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
  kappa?: string
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


// - [EXTERNAL] - //

/**
 * @notice Gets transaction info with a GraphQL query
 * @param chainId The chainId to query for. Optional.
 * @param address The address to query for. Optional.
 * @param txnHash The transaction hash to query for. Optional.
 * @param kappa The kappa to query for. Optional.
 * @returns A promise that resolves to the transaction info as a JSON object
 */
export async function getBridgeTxnInfo(args: {
  chainId?: number,
  address?: string,
  txnHash?: string,
  kappa?: string,
}): Promise<JSON> {
  const query = buildTxnQuery(args.chainId, args.address, args.txnHash, args.kappa);
  try {
    const response = await fetch(BRIDGE_TXN_API_GRAPHQL_URL, {
      method: "post",
      body: JSON.stringify({ query }),
      headers: { "Content-Type": "application/json" },
    });
    return (await response.json()) as JSON;
  } catch (error) {
    throw new Error(`Error fetching bridge transactions: ${error}`);
  }
}
