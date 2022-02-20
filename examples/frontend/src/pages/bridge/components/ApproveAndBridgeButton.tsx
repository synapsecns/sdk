import {useMetaMask} from "metamask-react";
import {useEffect, useState} from "react";

const ButtonStates = {
    INIT:           "Loading...",
    CONNECT_WALLET: "Connect Wallet",
    APPROVE:        "Approve",
    BRIDGE:         "Execute bridge transaction"
};

const MetamaskStatus = {
    INIT:          "initializing",
    UNAVAILABLE:   "unavailable",
    NOT_CONNECTED: "notConnected",
    CONNECTING:    "connecting",
    CONNECTED:     "connected"
}

interface ButtonProps {
    text: string,
    onClick: (...args: any[]) => (void | any),
}

function executeApprove() {}

function executeBridge() {}

export default function ApproveAndBridgeButton(props: {className?: string}) {
    const { status, connect, account, chainId, ethereum } = useMetaMask();

    const needsConnect = status === MetamaskStatus.NOT_CONNECTED;

    const [needsApprove, setNeedsApprove] = useState<boolean>(true);

    const ButtonStatesProps = {
        [ButtonStates.INIT]:           {text: ButtonStates.INIT,           onClick: () => {}},
        [ButtonStates.CONNECT_WALLET]: {text: ButtonStates.CONNECT_WALLET, onClick: connect},
        [ButtonStates.APPROVE]:        {text: ButtonStates.APPROVE,        onClick: executeApprove},
        [ButtonStates.BRIDGE]:         {text: ButtonStates.BRIDGE,         onClick: executeBridge}
    };

    const [buttonState, setButtonState] = useState<ButtonProps>(ButtonStatesProps[ButtonStates.INIT]);

    useEffect(() => {
        if (needsConnect) {
            setButtonState(ButtonStatesProps[ButtonStates.CONNECT_WALLET]);
        } else if (!needsConnect) {
            if (status === MetamaskStatus.CONNECTING) {
                setButtonState(ButtonStatesProps[ButtonStates.INIT]);
            } else {
                setButtonState(ButtonStatesProps[ButtonStates.APPROVE]);
            }
        } else if (!needsConnect && !needsApprove) {
            setButtonState(ButtonStatesProps[ButtonStates.BRIDGE]);
        }
    }, [status, needsConnect, needsApprove])

    return (
        <div>
            <button
                className={"w-full bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-full"}
                onClick={buttonState.onClick}
            >
                {buttonState.text}
            </button>
        </div>
    )
}