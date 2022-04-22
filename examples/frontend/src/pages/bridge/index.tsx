import {useMetaMask, useConnectedMetaMask} from "metamask-react";
import {MetamaskStatus} from "@utils";

import BridgeSwap from "./components/BridgeSwap";
import AddLiquiditySingleToken from "./components/AddLiquiditySingleToken";

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
        </div>
    )
}

export default function BridgePage(props) {
    return (
        <BridgePageContent {...props}/>
    )
}