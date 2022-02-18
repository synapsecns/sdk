import {useEffect} from "react";

import {classNames} from "../../utils";

import {DropdownMenu, DropdownItem} from "../../components/DropdownMenu";

import {BridgeDirections} from "./Directions";

import {
    Token
} from "@synapseprotocol/sdk";

interface TokenDropdownProps {
    tokens:      DropdownItem[],
    selected:    DropdownItem,
    setSelected: any,
    direction:   BridgeDirections,
}

export function TokenDropdown({tokens, direction, selected, setSelected}: TokenDropdownProps) {
    const title = direction === BridgeDirections.FROM ? "Source token" : "Destination token";

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
            items={tokens}
        />
    </div>)
}