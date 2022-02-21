import {Token} from "@synapseprotocol/sdk";
import {BigNumber, ethers} from "ethers";
import {useSendTransaction} from "../../../hooks/useSendTransaction";
import {useSynapseBridge} from "../../../hooks";
import {useState} from "react";

interface UseApprove {
    token:   Token,
    chainId: number,
    amount?: BigNumber,
}

export function useApprove(props: UseApprove) {
    const {token, chainId, amount} = props;
    const [synapseBridge] = useSynapseBridge({chainId});

    const [txn, setTxn] = useState<Promise<ethers.PopulatedTransaction>>(synapseBridge.buildApproveTransaction({token, amount}));

    // useEffect(() => {
    //
    // }, [props])

    const {sendTxn, txnStatus, txnResponse} = useSendTransaction({transaction: txn});

    return [sendTxn, txnStatus, txnResponse] as const;
}