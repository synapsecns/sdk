import {useMetaMask} from "metamask-react";
import {useContext, useEffect, useState} from "react";
import {BigNumber} from "ethers";
import {
    MetamaskStatus,
    sendTransaction,
    SendTransactionResponse,
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
    setDisabled,
    selectedNetworkTo,
    selectedTokenFrom,
    selectedTokenTo,
    synapseBridge,
    amountFrom, amountTo,
    addressTo,
    ethereum,
}) {
    return async () => {
        setButtonProps({
            text:     "Waiting for bridge transaction...",
        });
        setDisabled(true);

        try {
            const populated = await synapseBridge.buildBridgeTokenTransaction({
                tokenFrom:  selectedTokenFrom,
                tokenTo:    selectedTokenTo,
                amountFrom,
                amountTo,
                chainIdTo:   selectedNetworkTo.chainId,
                addressTo,
            });

            const txn = await sendTransaction(populated, ethereum);
            // setTxnStatus({
            //     response: txn,
            //     status:   txn.error ? TransactionStatus.ERROR : TransactionStatus.COMPLETE,
            // });

            setButtonProps({
                text:     "Success!",
            });
            setDisabled(true);
        } catch (e) {
            // setTxnStatus({
            //     response: {
            //         error: (e instanceof Error ? e : new Error(e))
            //     },
            //     status: TransactionStatus.ERROR,
            // });

            console.error(e);

            setButtonProps({
                text:     "Error sending bridge transaction",
            });
            setDisabled(true);
        }

        return
    }
}

export default function BridgeButton(props: {approved: boolean, amountFrom: BigNumber, amountOut: BigNumber}) {
    const {account, status, ethereum} = useMetaMask();

    const {amountFrom, amountOut: amountTo, approved} = props;

    const {selectedNetworkFrom, selectedNetworkTo} = useContext(NetworkMenuContext);
    const {selectedTokenFrom, selectedTokenTo}     = useContext(TokenMenuContext);

    const [synapseBridge] = useSynapseBridge({chainId: selectedNetworkFrom.chainId});

    // const [txnStatus, setTxnStatus] = useState<TxnResponseData>({
    //     status: TransactionStatus.NOT_SENT,
    // });

    const [disabled, setDisabled] = useState<boolean>(true);

    const BRIDGE_TEXT = "Bridge token";

    const [buttonProps, setButtonProps] = useState<ButtonProps>({
        text:    BRIDGE_TEXT,
        onClick:  emptyOnClick,
    });

    useEffect(() => {
        if (approved && disabled) {
            if (status === MetamaskStatus.CONNECTED && buttonProps.text === BRIDGE_TEXT) {
                setDisabled(false);
                setButtonProps({
                    text: BRIDGE_TEXT,
                    onClick: onClick({
                        setButtonProps,
                        setDisabled,
                        synapseBridge,
                        ethereum,
                        selectedTokenFrom,
                        amountFrom,
                        amountTo,
                        selectedNetworkTo,
                        selectedTokenTo,
                        addressTo: account,
                    })
                });
            }
        }
    }, [status, approved, disabled, buttonProps])

    useEffect(() => {
        if (buttonProps.text === BRIDGE_TEXT) {
            setButtonProps({
                text: BRIDGE_TEXT,
                onClick: onClick({
                    setButtonProps,
                    setDisabled,
                    synapseBridge,
                    ethereum,
                    selectedTokenFrom,
                    amountFrom,
                    amountTo,
                    selectedNetworkTo,
                    selectedTokenTo,
                    addressTo: account,
                }),
            });
        }
    }, [amountFrom, selectedTokenFrom, selectedTokenTo, selectedNetworkTo, amountTo, account])

    return (
        <div>
            <ActionButton {...buttonProps}/>
        </div>
    )
}