import {useState} from "react";
import {ethers} from "ethers";
import {useWeb3Signer} from "./useWeb3Signer";

import {TransactionStatus} from "../utils";

interface SendTransactionResponse {
    transaction?: ethers.providers.TransactionResponse,
    error?:       Error,
}

interface UseSendTransaction {
    transaction: ethers.PopulatedTransaction | Promise<ethers.PopulatedTransaction>,
}

export function useSendTransaction(props: UseSendTransaction) {
    const [txnStatus,   setTxnStatus]   = useState<TransactionStatus>(TransactionStatus.NOT_SENT);
    const [txnResponse, setTxnResponse] = useState<SendTransactionResponse>(null);

    const sendTxn = (signer: ethers.providers.JsonRpcSigner) =>
        Promise.resolve(props.transaction)
            .then((txn) => {
                setTxnStatus(TransactionStatus.SENT);
                signer.sendTransaction(txn)
                    .then((txnResponse) => {
                        setTxnResponse({transaction: txnResponse});
                        setTxnStatus(TransactionStatus.COMPLETE);
                    })
                    .catch((e: any) => {
                        let err = e instanceof Error ? e : new Error(e);
                        setTxnResponse({error: err});
                        setTxnStatus(TransactionStatus.ERROR);
                    })
            })

    return {
        sendTxn,
        txnStatus,
        txnResponse,
    } as const
}