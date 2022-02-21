import {useMetaMask} from "metamask-react";
import {useContext, useEffect, useState} from "react";
import {BigNumber, ethers} from "ethers";
import {
    MetamaskStatus,
    getSigner,
    SetStateFunction,
} from "../../../utils";
import {NetworkMenuContext} from "../contexts/NetworkMenuContext";
import {TokenMenuContext} from "../contexts/TokenMenuContext";
import {useSynapseBridge} from "../../../hooks";

import Button, {
    ButtonProps,
    emptyOnClick,
} from "../../../components/Button";

import {useActionButtonOnClick} from "../hooks/useActionButtonOnClick";

export default function ApproveButon(props: {amountFrom: BigNumber, approved: boolean, setApproved: SetStateFunction<boolean>}) {
    const {status, ethereum} = useMetaMask();

    const {amountFrom, setApproved} = props;

    const {selectedNetworkFrom} = useContext(NetworkMenuContext);
    const {selectedTokenFrom}   = useContext(TokenMenuContext);

    const [synapseBridge] = useSynapseBridge({chainId: selectedNetworkFrom.chainId});

    const [disabled, setDisabled] = useState<boolean>(true);

    const APPROVE_TEXT = "Approve token";

    const [buttonProps, setButtonProps] = useState<ButtonProps>({
        text:    APPROVE_TEXT,
        onClick:  emptyOnClick,
    });

    const [executeTxn] = useActionButtonOnClick(setDisabled, setButtonProps);

    useEffect(() => {
        if (buttonProps.text === APPROVE_TEXT) {
            if (disabled && status === MetamaskStatus.CONNECTED) {
                setDisabled(false);
                setButtonProps({
                    text:    APPROVE_TEXT,
                    onClick: executeTxn((): Promise<ethers.providers.TransactionResponse> => {
                        return synapseBridge.executeApproveTransaction({
                            token:  selectedTokenFrom,
                            // amount: amountFrom,
                        }, getSigner(ethereum));
                    })
                });
            }
        }
    }, [status, disabled]);

    useEffect(() => {
        if (buttonProps.text === APPROVE_TEXT) {
            setButtonProps({
                text: APPROVE_TEXT,
                onClick: executeTxn((): Promise<ethers.providers.TransactionResponse> =>
                    synapseBridge.executeApproveTransaction({
                        token:  selectedTokenFrom,
                        // amount: amountFrom,
                    }, getSigner(ethereum))
                ),
            });
        }
    }, [amountFrom, selectedTokenFrom])

    return (
        <div>
            <Button {...buttonProps} disabled={disabled}/>
        </div>
    )
}