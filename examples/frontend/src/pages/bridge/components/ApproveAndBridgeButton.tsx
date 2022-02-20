import {useMetaMask} from "metamask-react";
import {useContext, useEffect, useState} from "react";
import {BigNumber, ethers} from "ethers";
import {useApprove} from "../hooks/useApprove";
import {TransactionStatus, MetamaskStatus} from "../../../utils";
import {NetworkMenuContext} from "../contexts/NetworkMenuContext";
import {TokenMenuContext} from "../contexts/TokenMenuContext";
import {useWeb3Signer} from "../../../hooks/useWeb3Signer";

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

function getSigner(ethereum: any) {
    return (new ethers.providers.Web3Provider(ethereum)).getSigner()
}

export default function ApproveAndBridgeButton(props: {amountFrom: BigNumber, amountTo: BigNumber}) {
    const { status, connect, ethereum } = useMetaMask();

    const {selectedNetworkFrom, selectedNetworkTo} = useContext(NetworkMenuContext);
    const {selectedTokenFrom, selectedTokenTo} = useContext(TokenMenuContext);

    const [needsApprove, setNeedsApprove] = useState<boolean>(true);

    const ButtonStatesProps = {
        [ButtonStates.INIT]:           {text: ButtonStates.INIT, disabled: true},
        [ButtonStates.CONNECT_WALLET]: {text: ButtonStates.CONNECT_WALLET, onClick: connect, disabled: false},
    };

    const [sendApproveTxn, approveTxnStatus] = useApprove({
        token:   selectedTokenFrom,
        chainId: selectedNetworkFrom.chainId,
        amount:  props.amountFrom,
    });

    const [buttonProps, setButtonProps] = useState<ButtonProps>(ButtonStatesProps[ButtonStates.INIT]);

    useEffect(() => {
        if (buttonProps.text === ButtonStates.INIT) {
            if (status === MetamaskStatus.NOT_CONNECTED) {
                setButtonProps(ButtonStatesProps[ButtonStates.CONNECT_WALLET]);
            }
        }
    }, [status])

    useEffect(() => {
        if (status !== MetamaskStatus.CONNECTED) {
            return
        }

        if (needsApprove) {
            switch (approveTxnStatus) {
                case TransactionStatus.NOT_SENT:
                    setButtonProps({
                        text:    "Approve token",
                        onClick:  () => sendApproveTxn(getSigner(ethereum)),
                        disabled: false,
                    });
                    break;
                case TransactionStatus.SENT:
                    setButtonProps({
                        text:     "Waiting for approval transaction...",
                        disabled: true,
                    });
                    break;
                case TransactionStatus.COMPLETE:
                    setNeedsApprove(false);
                    break;
                case TransactionStatus.ERROR:
                    setButtonProps({
                        text:     "Error sending approval transaction",
                        disabled: true,
                    });
                    break;
            }
        }
    }, [status, needsApprove, approveTxnStatus])


    return (
        <div>
            <ActionButton {...buttonProps}/>
        </div>
    )
}