import {DeferredPopulatedTransaction} from "./types";
import {ethers} from "ethers";

export function getSigner(ethereum: any) {
    return (new ethers.providers.Web3Provider(ethereum)).getSigner()
}

export interface SendTransactionResponse {
    transaction?: ethers.providers.TransactionResponse,
    error?:       Error,
}

function catchTransactionError(e: any): SendTransactionResponse {
    let err = e instanceof Error ? e : new Error(e);

    return {error: err}
}

export function sendTransaction(
    transaction: DeferredPopulatedTransaction,
    ethereum:    any
): Promise<SendTransactionResponse> {
    return Promise.resolve(transaction)
        .then((txn): Promise<SendTransactionResponse> =>
            getSigner(ethereum).sendTransaction(txn)
                .then((txnResponse) => ({transaction: txnResponse}))
                .catch(catchTransactionError)
        )
        .catch(catchTransactionError)
}