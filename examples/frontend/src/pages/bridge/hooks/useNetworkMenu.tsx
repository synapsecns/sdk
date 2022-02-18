import {useContext, useEffect, useState} from "react";

import {
    Networks,
    supportedNetworks
} from "@synapseprotocol/sdk";

import {NetworkMenuContext} from "../contexts/NetworkMenuContext";

import NetworkDropdown from "../components/NetworkDropdown";
import {BridgeDirections} from "../Directions";

import type {DropdownItem} from "../../../components/DropdownMenu";

import {isNullOrUndefined, SetStateFunction} from "../../../utils";


interface NetworkDropdownItem extends DropdownItem {
    network: Networks.Network,
    chainId: number,
}

interface UseNetworkMenu {
    networks:       Networks.Network[],
    direction:      BridgeDirections,
    startIdx?:      number,
    disabledChain?: number,
}

function NetworkMenu({dropdownItems, direction, selected, setSelected}) {
    return (
        <NetworkDropdown
            networks={dropdownItems}
            direction={direction}
            selected={selected}
            setSelected={setSelected}
        />
    )
}

export const useNetworkMenu = ({networks, direction, disabledChain, startIdx=0}: UseNetworkMenu) => {
    const {
        selectedNetwork,
        setSelectedNetwork
    } = useContext(NetworkMenuContext);

    const makeDropdownItems = (disabledChainId?: number): NetworkDropdownItem[] => networks.map((n) => ({
        label:    n.name,
        key:      n.name,
        disabled: isNullOrUndefined(disabledChainId) ? false : n.chainId === disabledChain,
        chainId:  n.chainId,
        network:  n,
    }));

    const
        [dropdownItems, setDropdownItems] = useState<NetworkDropdownItem[]>(makeDropdownItems(disabledChain)),
        [selected,      setSelected]      = useState<NetworkDropdownItem>(dropdownItems[startIdx]);

    useEffect(() => {
        setDropdownItems(makeDropdownItems(disabledChain));
    }, [disabledChain])

    useEffect(() => {
        let newSelection = selected.network;
        if (newSelection.chainId !== selectedNetwork.chainId) {
            setSelectedNetwork(newSelection);
        }
    }, [selected, selectedNetwork])

    const networkMenuProps = {selected, setSelected, dropdownItems, direction};

    return {
        NetworkMenu,
        networkMenuProps,
        selectedNetwork,
        setSelectedNetwork
    }
}