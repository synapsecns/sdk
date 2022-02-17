import {useEffect, useState} from "react";

import {classNames} from "../../utils";

import {Grid} from "../../components/Grid";
import {DropdownMenu} from "../../components/DropdownMenu";

import {supportedNetworks} from "@synapseprotocol/sdk"

const BridgeDirections = {
    FROM: "from",
    TO:   "to"
}

function NetworksDropdown({direction, selected, setSelected, networkDropdownItems}: {
    direction,
    selected,
    setSelected,
    networkDropdownItems,
}) {
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
                items={networkDropdownItems}
            />
    </div>)
}

export function BridgeNetworkCard(props: { className?: any }) {
    const networkDropdownItems = supportedNetworks().map(({name, chainId}) => ({
        label:   name,
        key:     chainId.toString(),
        chainId,
    }));

    let [
        selectedChainFrom,
        setSelectedChainFrom
    ] = useState(networkDropdownItems[0]);

    let [
        selectedChainTo,
        setSelectedChainTo
    ] = useState(networkDropdownItems[1]);

    return(
        <Grid className={"grid-flow-col"} rows={4} cols={2} gapX={4} gapY={4}>
            <NetworksDropdown
                direction={BridgeDirections.FROM}
                selected={selectedChainFrom}
                setSelected={setSelectedChainFrom}
                networkDropdownItems={networkDropdownItems}
            />

            <NetworksDropdown
                direction={BridgeDirections.TO}
                selected={selectedChainTo}
                setSelected={setSelectedChainTo}
                networkDropdownItems={networkDropdownItems}
            />
        </Grid>
    )
}