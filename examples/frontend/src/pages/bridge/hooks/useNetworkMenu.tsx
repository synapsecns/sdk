import {useContext, useEffect, useState} from "react";

import {Networks} from "@synapseprotocol/sdk";

import {NetworkMenuContext} from "../contexts/NetworkMenuContext";

import NetworkDropdown from "../components/NetworkDropdown";
import {BridgeDirections} from "../Directions";

import type {DropdownItem} from "@components/DropdownMenu";

import {isNullOrUndefined} from "@utils";


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
        selectedNetworkFrom,
        setSelectedNetworkFrom,
        selectedNetworkTo,
        setSelectedNetworkTo,
    } = useContext(NetworkMenuContext);


    const [selectedNetwork, setSelectedNetwork] = (() => {
        switch (direction) {
            case BridgeDirections.FROM:
                return [selectedNetworkFrom, setSelectedNetworkFrom] as const
            case BridgeDirections.TO:
                return [selectedNetworkTo, setSelectedNetworkTo] as const
        }
    })()

    function isDisabled(chainId: number, disabledChainId?: number): boolean {
        if (!isNullOrUndefined(disabledChainId)) {
            return chainId === disabledChainId;
        }

        if (!isNullOrUndefined(selectedNetwork)) {
            return chainId === selectedNetwork.chainId
        }

        return false
    }

    function makeDropdownItems(disabledChainId?: number): NetworkDropdownItem[] {
        return networks.map((n) => ({
            label:    n.name,
            key:      n.name,
            disabled: isDisabled(n.chainId, disabledChainId),
            chainId:  n.chainId,
            network:  n,
        }));
    }

    const [dropdownItems, setDropdownItems] = useState<NetworkDropdownItem[]>(makeDropdownItems(disabledChain));
    const [selected, setSelected] = useState<NetworkDropdownItem>(dropdownItems[startIdx]);

    useEffect(() => {
        setDropdownItems(makeDropdownItems(disabledChain));
    }, [disabledChain])

    useEffect(() => {
        switch (direction) {
            case BridgeDirections.TO:
                if (selectedNetworkTo.chainId === selectedNetworkFrom.chainId) {
                    const idx = dropdownItems.findIndex(n => n.chainId === selected.network.chainId);
                    if (idx === dropdownItems.length - 1) {
                        setSelected(dropdownItems[idx-1]);
                    } else {
                        setSelected(dropdownItems[idx+1]);
                    }
                }
        }
    }, [selected, selectedNetworkFrom, selectedNetworkTo])

    useEffect(() => {
        let newSelection = selected.network;
        if (selectedNetwork) {
            if (newSelection.chainId !== selectedNetwork.chainId) {
                setSelectedNetwork(newSelection);
            }
        } else {
            setSelectedNetwork(newSelection);
        }
    }, [selected, selectedNetwork])

    const networkMenuProps = {selected, setSelected, dropdownItems, direction};

    return {
        NetworkMenu,
        networkMenuProps
    }
}