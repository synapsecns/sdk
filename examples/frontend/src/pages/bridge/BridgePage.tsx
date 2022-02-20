import {useContext, useEffect, useState} from "react";

import {BridgeDirections} from "./Directions";

import NetworkDropdown from "./components/NetworkDropdown";
import TokenDropdown from "./components/TokenDropdown";
import BridgeEstimateSection from "./components/BridgeEstimateSection";
import AmountFromDropdown, {AmountDropdownItem} from "./components/AmountFromDropdown";
import ApproveButon from "./components/ApproveButon";

import {TokenMenuContext,   TokenMenuContextProvider}   from "./contexts/TokenMenuContext";
import {NetworkMenuContext, NetworkMenuContextProvider} from "./contexts/NetworkMenuContext";

import type {Token} from "@synapseprotocol/sdk";
import {
    Networks,
    detailedTokenSwapMap,
    supportedNetworks,
} from "@synapseprotocol/sdk";

import {Grid} from "../../components/Grid";

import {BigNumber} from "ethers";

import {DropdownItem} from "../../components/DropdownMenu";

import SourceGrid, {AMOUNTS_FROM_OPTIONS} from "./SourceGrid";
import DestinationGrid from "./DestinationGrid";
import BridgeButton from "./components/BridgeButton";

function BridgePageContent(props: {className?: string}) {
    const {
        selectedNetworkFrom,
        selectedNetworkTo
    } = useContext(NetworkMenuContext);

    const {
        selectedTokenFrom,
        selectedTokenTo
    } = useContext(TokenMenuContext);

    // useEffect(() => {
    //     console.log({selectedNetworkFrom});
    // }, [selectedNetworkFrom])

    const [amountFrom, setAmountFrom] = useState(AMOUNTS_FROM_OPTIONS[0]);

    // useEffect(() => {
    //     if (selectedChainFrom.chainId === selectedChainTo.chainId) {
    //         // disable the network on the other side?
    //     }
    // }, [selectedChainFrom, selectedChainTo]);

    // useEffect(() => {
    //     console.log(`amountFrom changed to ${amountFrom.amount}`);
    // }, [amountFrom])

    const [approved, setApproved] = useState<boolean>(true);
    const [amountOut, setAmountOut] = useState<BigNumber>(BigNumber.from(0));

    return(
        <div>
            <Grid className={"grid-flow-col"} rows={4} cols={2} gapX={4} gapY={4}>
                <SourceGrid
                    selectedAmountFrom={amountFrom}
                    setSelectedAmountFrom={setAmountFrom}
                />
                {amountFrom && <DestinationGrid
                    amountIn={amountFrom?.amount || BigNumber.from(0)}
                    amountOut={amountOut}
                    setAmountOut={setAmountOut}
                />}
            </Grid>
            <ApproveButon
                amountFrom={amountFrom?.amount || BigNumber.from(0)}
                approved={approved}
                setApproved={setApproved}
            />
            <BridgeButton
                amountFrom={amountFrom?.amount || BigNumber.from(0)}
                approved={approved}
                amountOut={amountOut}
            />
        </div>
    )
}

export function BridgePage(props: {className?: string}) {
    return (
        <NetworkMenuContextProvider>
            <TokenMenuContextProvider>
                <BridgePageContent className={props.className}/>
            </TokenMenuContextProvider>
        </NetworkMenuContextProvider>
    )
}