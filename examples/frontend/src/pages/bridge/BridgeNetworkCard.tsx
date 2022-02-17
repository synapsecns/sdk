import {useEffect, useState} from "react";

import {classNames} from "../../utils";

import {DropdownMenu, useDropdownMenu} from "../../components/dropdown";

import {supportedNetworks} from "@synapseprotocol/sdk"

const BridgeDirections = {
    FROM: "from",
    TO:   "to"
}

function NetworksDropdown(props: {
    direction,
    setSelected
}) {
    let {direction, setSelected} = props;

    const title = direction === BridgeDirections.FROM ? "Source chain" : "Destination chain";
    const opts = supportedNetworks().map(({name, chainId}) => ({
        label:   name,
        key:     chainId,
        chainId,
    }))

    let [selectedItem, setSelectedItem, Menu] = useDropdownMenu({title, items: opts})

    useEffect(() => {
        console.log(selectedItem);
    }, [selectedItem])

    return (<Menu />)
}

export function BridgeNetworkCard(props: { className?: any }) {
    let [
        selectedChainFrom,
        setSelectedChainFrom
    ] = useState("");

    let [
        selectedChainTo,
        setSelectedChainTo
    ] = useState("");

    return(
        <div
            className={classNames(
                "max-w-md rounded-lg border",
                "shadow-md dark:bg-gray-800 dark:border-gray-700",
                props.className ?? ""
            )}
        >
            <div className={"flex justify-center px-4 pt-4"}>
                <NetworksDropdown direction={BridgeDirections.FROM} setSelected={setSelectedChainFrom} />
            </div>
        </div>
    )
}