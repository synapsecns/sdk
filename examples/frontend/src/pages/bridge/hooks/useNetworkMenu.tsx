import {useContext} from "react";

import {
    Networks,
    supportedNetworks
} from "@synapseprotocol/sdk";

import {NetworkMenuContext} from "../contexts/NetworkMenuContext";

import NetworkDropdown from "../components/NetworkDropdown";
import {BridgeDirections} from "../Directions";

import type {DropdownItem} from "../../../components/DropdownMenu";

// function NetworkMenu

interface NetworkDropdownItem extends DropdownItem {
    network: Networks.Network,
}

interface UseNetworkMenu {
    networks:       Networks.Network[],
    direction:      BridgeDirections,
    startIdx?:      number,
    disabledChain?: number,
}

export const useNetworkMenu = ({networks, direction, disabledChain, startIdx=0}: UseNetworkMenu) => {
    const {
        selectedNetwork,
        setSelectedNetwork
    } = useContext(NetworkMenuContext);

    const dropdownItems: NetworkDropdownItem[] = networks.map((n) => {

    })
}