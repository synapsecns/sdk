export const BRIDGE_TXN_API_GRAPHQL_URL =
  "https://syn-explorer-api.metagabbar.xyz/graphql";

export const DEFAULT_QUERY_RESPONSE = `
kappa
toInfo {
  txnHash
  chainId
  value
  USDValue
  formattedValue
  time
}
fromInfo {
  txnHash
  chainId
  value
  USDValue
  formattedValue
  time
}
`;