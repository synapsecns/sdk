export namespace UnsupportedSwapErrors {
    interface Tok {symbol: string}

    export enum UnsupportedSwapErrorKind {
        UnsupportedToken,
        UnsupportedTokenNetFrom,
        UnsupportedTokenNetTo,
        NonmatchingSwapTypes,
        BobaToL1,
        ETHOnBoba,
    }

    export interface UnsupportedSwapError {
        errorKind: UnsupportedSwapErrorKind,
        reason:    string,
    }

    export const tokenNotSupported = (t: Tok, netName: string): UnsupportedSwapError => ({
        errorKind:  UnsupportedSwapErrorKind.UnsupportedToken,
        reason:    `Token ${t.symbol} not supported on network ${netName}`,
    })

    export const tokenNotSupportedNetFrom = (t: Tok, netName: string): UnsupportedSwapError => ({
        errorKind:  UnsupportedSwapErrorKind.UnsupportedTokenNetFrom,
        reason:    `Token ${t.symbol} not supported on 'from' network ${netName}`,
    })

    export const tokenNotSupportedNetTo = (t: Tok, netName: string): UnsupportedSwapError => ({
        errorKind:  UnsupportedSwapErrorKind.UnsupportedTokenNetTo,
        reason:    `Token ${t.symbol} not supported on 'to' network ${netName}`,
    })

    export const nonMatchingSwapTypes = (st1: string, st2: string): UnsupportedSwapError => ({
        errorKind:  UnsupportedSwapErrorKind.NonmatchingSwapTypes,
        reason:    "Token swap types don't match",
    })

    export const ethOnBoba = (): UnsupportedSwapError => ({
        errorKind: UnsupportedSwapErrorKind.ETHOnBoba,
        reason:    "Currently, the SDK only supports bridging Stablecoins to and from BOBA",
    })

    export const bobaToL1 = (): UnsupportedSwapError => ({
        errorKind: UnsupportedSwapErrorKind.BobaToL1,
        reason:    "Bridging ETH from Boba Mainnet to L1 not currently supported",
    })
}