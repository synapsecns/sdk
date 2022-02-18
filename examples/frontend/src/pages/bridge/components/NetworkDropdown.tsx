import {useEffect} from "react";

import {classNames} from "../../../utils";

import type {SetStateFunction} from "../../../utils";

import {DropdownMenu} from "../../../components/DropdownMenu";
import type {DropdownItem} from "../../../components/DropdownMenu";

import {BridgeDirections} from "../Directions";

import {Networks} from "@synapseprotocol/sdk";

export interface NetworkDropdownItem extends DropdownItem {
    network: Networks.Network,
}

interface NetworkDropdownProps {
    direction:        BridgeDirections,
    selected:         NetworkDropdownItem,
    setSelected:      SetStateFunction<NetworkDropdownItem>,
    networks:         NetworkDropdownItem[],
}

export default function NetworkDropdown({direction, selected, setSelected, networks}: NetworkDropdownProps) {
    const title = direction === BridgeDirections.FROM ? "Source chain" : "Destination chain";

    useEffect(() => {
        console.log(selected);
    }, [selected])

    return(<div
        className={classNames(
            "rounded-md border",
            "shadow-md",
            "dark:bg-gray-800 dark:border-gray-600",
        )}>
            <DropdownMenu
                title={title}
                selectedItem={selected}
                setSelectedItem={setSelected}
                items={networks}
            />
    </div>)
}