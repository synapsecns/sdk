import {useState} from "react";

import ApproveButon from "./components/ApproveButon";

import {TokenMenuContextProvider}   from "./contexts/TokenMenuContext";
import {NetworkMenuContextProvider} from "./contexts/NetworkMenuContext";

import {Grid} from "@components/Grid";

import {BigNumber} from "ethers";

import SourceGrid, {AMOUNTS_FROM_OPTIONS} from "./SourceGrid";
import DestinationGrid from "./DestinationGrid";
import BridgeButton from "./components/BridgeButton";

function BridgePageContent(props: {className?: string}) {
    const [amountFrom, setAmountFrom] = useState(AMOUNTS_FROM_OPTIONS[3]);

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