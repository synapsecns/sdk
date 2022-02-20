import {useState} from "react";
import {ethers} from "ethers";
import {useWeb3Signer} from "./useWeb3Signer";

import {TransactionStatus} from "../utils";
import {useMetaMask} from "metamask-react";

interface SendTransactionResponse {
    transaction?: ethers.providers.TransactionResponse,
    error?:       Error,
}

interface UseSendTransaction {
    transaction: ethers.PopulatedTransaction | Promise<ethers.PopulatedTransaction>,
}

function getSigner(ethereum: any) {
    return (new ethers.providers.Web3Provider(ethereum)).getSigner()
}

export function useSendTransaction(props: UseSendTransaction) {
    const {ethereum} = useMetaMask();

    const [txnStatus,   setTxnStatus]   = useState<TransactionStatus>(TransactionStatus.NOT_SENT);
    const [txnResponse, setTxnResponse] = useState<SendTransactionResponse>(null);

    function sendTxn() {
        Promise.resolve(props.transaction)
            .then((txn) => {
                setTxnStatus(TransactionStatus.SENT);
                getSigner(ethereum).sendTransaction(txn)
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
    }

    return {
        sendTxn,
        txnStatus,
        txnResponse,
    } as const
}