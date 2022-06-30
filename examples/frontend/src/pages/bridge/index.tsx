import {useMetaMask, useConnectedMetaMask} from "metamask-react";
import {MetamaskStatus} from "@utils";

import BridgeSwap from "./components/BridgeSwap";
import AddLiquiditySingleToken from "./components/AddLiquidity";
import RemoveLiquidity from "./components/RemoveLiquidity";

function BridgePageContent(props) {
    const {status} = useMetaMask();

    if (status !== MetamaskStatus.CONNECTED) {
        return (
            <div className={"w-1/4"}>
                Loading...
            </div>
        )
    }

    return(
        <div className={"w-1/4"}>
            {/*<BridgeSwap />*/}
            <AddLiquiditySingleToken />
            {/*<RemoveLiquidity />*/}
        </div>
    )
}

export default function BridgePage(props) {
    return (
        <BridgePageContent {...props}/>
    )
}