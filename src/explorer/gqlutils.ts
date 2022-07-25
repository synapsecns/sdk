export const EXPLORER_GQL_API =
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
