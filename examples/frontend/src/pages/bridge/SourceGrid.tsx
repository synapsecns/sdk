import {useNetworkMenu} from "./hooks/useNetworkMenu";
import {useSourceTokenMenu} from "./hooks/useTokenMenu";

import type {AmountDropdownItem} from "./components/AmountFromDropdown";

import {BigNumber} from "ethers";

import {ChainId, Networks, supportedNetworks, Token} from "@synapseprotocol/sdk";
import {isNullOrUndefined, SetStateFunction} from "../../utils";
import {BridgeDirections} from "./Directions";
import TokenDropdown from "./components/TokenDropdown";
import AmountFromDropdown from "./components/AmountFromDropdown";
import {useContext, useEffect, useState} from "react";
import {NetworkMenuContext} from "./contexts/NetworkMenuContext";
import {useMetaMask} from "metamask-react";

export const AMOUNTS_FROM_OPTIONS: AmountDropdownItem[] = [50, 75, 100, 500, 1000].map((n) => {
    let amount = BigNumber.from(n);

    return {
        amount,
        label:    amount.toString(),
        disabled: false,
        key:      amount.toString(),
    }
})

interface SourceNetworkGridProps {
    selectedAmountFrom:    AmountDropdownItem,
    setSelectedAmountFrom: SetStateFunction<AmountDropdownItem>
}

export default function SourceGrid(props: SourceNetworkGridProps) {
    const {
        selectedAmountFrom,
        setSelectedAmountFrom
    } = props;

    const allNetworks = supportedNetworks();

    const {status, chainId} = useMetaMask();

    const [connectedNetwork, setConnectedNetwork] = useState<Networks.Network>(
        status === "connected" ? Networks.fromChainId(chainId) : null
    );

    const {
        NetworkMenu,
        networkMenuProps
    } = useNetworkMenu({
        networks:  allNetworks,
        direction: BridgeDirections.FROM,
        startIdx:  allNetworks.findIndex((n) => n.chainId === (connectedNetwork !== null ? connectedNetwork.chainId : ChainId.AVALANCHE))
    });

    const {
        TokenMenu,
        tokenMenuProps
    } = useSourceTokenMenu();

    return (
        <div>
            <NetworkMenu {...networkMenuProps} />
            <TokenMenu {...tokenMenuProps} />
            <AmountFromDropdown
                selected={selectedAmountFrom}
                setSelected={setSelectedAmountFrom}
                items={AMOUNTS_FROM_OPTIONS}
            />
        </div>
    )
}