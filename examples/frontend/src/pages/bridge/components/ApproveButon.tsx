import {useMetaMask} from "metamask-react";
import {useContext, useEffect, useState} from "react";
import {BigNumber} from "ethers";
import {
    MetamaskStatus,
    sendTransaction,
    getSigner,
    SendTransactionResponse,
    SetStateFunction,
    TransactionStatus
} from "../../../utils";
import {NetworkMenuContext} from "../contexts/NetworkMenuContext";
import {TokenMenuContext} from "../contexts/TokenMenuContext";
import {useSynapseBridge} from "../../../hooks";

import {
    ButtonProps,
    ActionButton, emptyOnClick,
} from "./ActionButton";


interface TxnResponseData {
    response?: SendTransactionResponse,
    status:    TransactionStatus,
}

function onClick({
    setButtonProps,
    setApproved,
    setDisabled,
    synapseBridge,
    ethereum,
   selectedTokenFrom,
   amountFrom,
}) {
    return async () => {
        setButtonProps({
            text:     "Waiting for approval transaction...",
        });
        setDisabled(true);

        try {
            const txn = await synapseBridge.executeApproveTransaction({
                token:  selectedTokenFrom,
                // amount: amountFrom,
            }, getSigner(ethereum));
            // setTxnStatus({
            //     response: txn,
            //     status:   txn.error ? TransactionStatus.ERROR : TransactionStatus.COMPLETE,
            // });

            setApproved(!txn.error);
            setButtonProps({
                text: "waiting for transaction to confirm..."
            });
            setDisabled(true);

            let confirmed = await txn.wait(1);

            setButtonProps({
                text:     confirmed.error ? `error: ${confirmed.error.message}` : "Approved!",
            });
            setDisabled(true);
        } catch (e) {
            // setTxnStatus({
            //     response: {
            //         error: (e instanceof Error ? e : new Error(e))
            //     },
            //     status: TransactionStatus.ERROR,
            // });

            setButtonProps({
                text:     "Error sending approval transaction",
            });
            setDisabled(true);
        }

        return
    }
}

export default function ApproveButon(props: {amountFrom: BigNumber, approved: boolean, setApproved: SetStateFunction<boolean>}) {
    const {status, ethereum} = useMetaMask();

    const {amountFrom, approved, setApproved} = props;

    const {selectedNetworkFrom} = useContext(NetworkMenuContext);
    const {selectedTokenFrom}   = useContext(TokenMenuContext);

    const [synapseBridge] = useSynapseBridge({chainId: selectedNetworkFrom.chainId});

    // const [txnStatus, setTxnStatus] = useState<TxnResponseData>({
    //     response: null,
    //     status:   TransactionStatus.NOT_SENT,
    // });

    const [disabled, setDisabled] = useState<boolean>(true);

    const APPROVE_TEXT = "Approve token";

    const [buttonProps, setButtonProps] = useState<ButtonProps>({
        text:    APPROVE_TEXT,
        onClick:  emptyOnClick,
    });

    useEffect(() => {
        if (buttonProps.text === APPROVE_TEXT) {
            if (disabled && status === MetamaskStatus.CONNECTED) {
                setDisabled(false);
                setButtonProps({
                    text:    APPROVE_TEXT,
                    onClick: onClick({
                        setButtonProps,
                        setDisabled,
                        setApproved,
                        synapseBridge,
                        ethereum,
                        amountFrom,
                        selectedTokenFrom,
                    })
                });
            }
        }
    }, [status, disabled]);

    useEffect(() => {
        if (buttonProps.text === APPROVE_TEXT) {
            setButtonProps({
                text: APPROVE_TEXT,
                onClick: onClick({
                    setButtonProps,
                    setDisabled,
                    setApproved,
                    synapseBridge,
                    ethereum,
                    amountFrom,
                    selectedTokenFrom,
                }),
            });
        }
    }, [amountFrom, selectedTokenFrom])

    return (
        <div>
            <ActionButton {...buttonProps} disabled={disabled}/>
        </div>
    )
}