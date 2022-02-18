import {useEffect} from "react";

import {classNames} from "../../utils";

import {DropdownMenu} from "../../components/DropdownMenu";

import {BridgeDirections} from "./Directions";

interface NetworkDropdownProps {
    direction:  BridgeDirections,
    selected:    any,
    setSelected: any,
    networks:    any[],
}

export function NetworkDropdown({direction, selected, setSelected, networks}: NetworkDropdownProps) {
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