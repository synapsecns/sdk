import {useMetaMask} from "metamask-react";
import {useContext, useEffect, useState} from "react";
import {BigNumber, ethers} from "ethers";
import {
    MetamaskStatus,
    getSigner,
    valueWei,
} from "@utils";

import {NetworkMenuContext} from "../contexts/NetworkMenuContext";
import {TokenMenuContext} from "../contexts/TokenMenuContext";

import {useActionButtonOnClick} from "../hooks/useActionButtonOnClick";

import {Bridge} from "@synapseprotocol/sdk";

import Button, {
    ButtonProps,
    emptyOnClick,
} from "@components/Button";

export default function BridgeButton(props: {approved: boolean, amountFrom: BigNumber, amountOut: BigNumber}) {
    const {account, status, ethereum, chainId} = useMetaMask();

    const {amountFrom, amountOut: amountTo, approved} = props;

    const {selectedNetworkTo} = useContext(NetworkMenuContext);
    const {selectedTokenFrom, selectedTokenTo}     = useContext(TokenMenuContext);

    const [disabled, setDisabled] = useState<boolean>(true);

    const BRIDGE_TEXT = "Bridge token";

    const [buttonProps, setButtonProps] = useState<ButtonProps>({
        text:    BRIDGE_TEXT,
        onClick:  emptyOnClick,
    });

    const [executeTxn] = useActionButtonOnClick(setDisabled, setButtonProps);

    useEffect(() => {
        if (approved && disabled) {
            if (status === MetamaskStatus.CONNECTED && buttonProps.text === BRIDGE_TEXT) {
                setDisabled(false);
                setButtonProps({
                    text:    BRIDGE_TEXT,
                    onClick: executeTxn((): Promise<ethers.providers.TransactionResponse> => {
                        const chainIdFrom = BigNumber.from(chainId).toNumber();
                        const synapseBridge = new Bridge.SynapseBridge({network: chainIdFrom})
                        return synapseBridge.executeBridgeTokenTransaction({
                            tokenFrom: selectedTokenFrom,
                            tokenTo: selectedTokenTo,
                            amountFrom: valueWei(amountFrom, selectedTokenFrom.decimals(chainIdFrom)),
                            amountTo,
                            chainIdTo: selectedNetworkTo.chainId,
                            addressTo: account,
                        }, getSigner(ethereum))
                    })
                });
            }
        }
    }, [status, approved, disabled, buttonProps])

    useEffect(() => {
        if (buttonProps.text === BRIDGE_TEXT) {
            setButtonProps({
                text:    BRIDGE_TEXT,
                onClick: executeTxn((): Promise<ethers.providers.TransactionResponse> => {
                    const chainIdFrom = BigNumber.from(chainId).toNumber();
                    const synapseBridge = new Bridge.SynapseBridge({network: chainIdFrom})
                    return synapseBridge.executeBridgeTokenTransaction({
                        tokenFrom: selectedTokenFrom,
                        tokenTo: selectedTokenTo,
                        amountFrom: valueWei(amountFrom, selectedTokenFrom.decimals(chainIdFrom)),
                        amountTo,
                        chainIdTo: selectedNetworkTo.chainId,
                        addressTo: account,
                    }, getSigner(ethereum))
                })
            });
        }
    }, [amountFrom, selectedTokenFrom, selectedTokenTo, selectedNetworkTo, amountTo, account])

    return (
        <div>
            <Button {...buttonProps}/>
        </div>
    )
}