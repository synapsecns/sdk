import { buildTxnQuery } from '../query_builder.js';
import { BRIDGE_TXN_API_GRAPHQL_URL } from '../gqlutils.js';

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

getBridgeTxnInfo(null, null, null, '0x5f102aacb2bb0f900df542e7d736c186de3838c762eb0a953e6f0a834243da5b').then(data => console.log(JSON.stringify(data)));