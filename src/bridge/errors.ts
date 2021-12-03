export namespace UnsupportedSwapReason {
    export const
        TokenNotSupported_From = "Token not supported on 'from' network",
        TokenNotSupported_To   = "Token not suppoorted on 'to' network",
        NonmatchingSwapTypes   = "Token swap types don't match",
        BOBAToL1               = "Bridging ETH from Boba Mainnet to L1 not currently supported",
        ETHOnBOBA              = "Currently, the SDK only supports bridging Stablecoins to and from BOBA";
}