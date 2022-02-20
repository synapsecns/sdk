import {useMetaMask} from "metamask-react";
import {useContext, useEffect, useState} from "react";
import {BigNumber} from "ethers";
import {
    MetamaskStatus,
    sendTransaction,
    SendTransactionResponse,
    SetStateFunction,
    TransactionStatus
} from "../../../utils";
import {NetworkMenuContext} from "../contexts/NetworkMenuContext";
import {TokenMenuContext} from "../contexts/TokenMenuContext";
import {useSynapseBridge} from "../../../hooks";

const ButtonStates = {
    INIT:           "Loading...",
    CONNECT_WALLET: "Connect Wallet",
    APPROVE:        "Approve",
    BRIDGE:         "Execute bridge transaction"
};

type OnClickFunction = (...args: any[]) => (void | any);

interface ButtonProps {
    text:      string,
    onClick?:  OnClickFunction,
    disabled:  boolean,
}

const emptyOnClick: OnClickFunction = () => {}

const ActionButton = ({text, onClick, disabled}: ButtonProps) => (
    <div>
        <button
            className={"w-full bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-full"}
            onClick={onClick ?? emptyOnClick}
            disabled={disabled}
        >
            {text}
        </button>
    </div>
)

interface TxnResponseData {
    response?: SendTransactionResponse,
    status:    TransactionStatus,
}

export default function ApproveButon(props: {amountFrom: BigNumber, approved: boolean, setApproved: SetStateFunction<boolean>}) {
    const { status, ethereum } = useMetaMask();

    const {amountFrom} = props;

    const {selectedNetworkFrom} = useContext(NetworkMenuContext);
    const {selectedTokenFrom}   = useContext(TokenMenuContext);

    const [synapseBridge] = useSynapseBridge({chainId: selectedNetworkFrom.chainId});

    const buildTxn = (amountFrom: BigNumber) =>
        synapseBridge.buildApproveTransaction({
            token:  selectedTokenFrom,
            amount: amountFrom,
        })

    const [txnStatus, setTxnStatus] = useState<TxnResponseData>({
        response: null,
        status:   TransactionStatus.NOT_SENT,
    });

    const initialButtonProps: ButtonProps = {
        text:    "Approve token",
        onClick:  async () => {
            setButtonProps({
                text:     "Waiting for approval transaction...",
                disabled: true,
            });

            try {
                const txn = await sendTransaction(buildTxn(amountFrom), ethereum);
                setTxnStatus({
                    response: txn,
                    status:   txn.error ? TransactionStatus.ERROR : TransactionStatus.COMPLETE,
                });

                props.setApproved(true);

                setButtonProps({
                    text:     "Approved!",
                    disabled: true,
                });
            } catch (e) {
                setTxnStatus({
                    response: {
                        error: (e instanceof Error ? e : new Error(e))
                    },
                    status: TransactionStatus.ERROR,
                });

                setButtonProps({
                    text:     "Error sending approval transaction",
                    disabled: true,
                });
            }

            return
        },
        disabled: false,
    }

    const [buttonProps, setButtonProps] = useState<ButtonProps>(initialButtonProps);

    return (
        <div>
            <ActionButton {...buttonProps}/>
        </div>
    )
}