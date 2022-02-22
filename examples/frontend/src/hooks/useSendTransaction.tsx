import {useState} from "react";

import {DeferredPopulatedTransaction, TransactionStatus, sendTransaction, SendTransactionResponse} from "@utils";
import {useMetaMask} from "metamask-react";

interface UseSendTransaction {
    transaction: DeferredPopulatedTransaction,
}

export function useSendTransaction(props: UseSendTransaction) {
    const {ethereum} = useMetaMask();

    const {transaction} = props;

    const [txnStatus,   setTxnStatus]   = useState<TransactionStatus>(TransactionStatus.NOT_SENT);
    const [txnResponse, setTxnResponse] = useState<SendTransactionResponse>(null);

    const sendTxn = () => sendTransaction(transaction, ethereum);

    return {
        sendTxn,
        txnStatus,
        txnResponse,
    } as const
}