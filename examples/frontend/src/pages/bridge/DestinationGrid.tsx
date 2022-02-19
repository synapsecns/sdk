import {useContext} from "react";

import {useNetworkMenu} from "./hooks/useNetworkMenu";
import {useDestinationTokenMenu} from "./hooks/useTokenMenu";

import {BigNumber} from "ethers";

import {supportedNetworks} from "@synapseprotocol/sdk";

import {BridgeDirections} from "./Directions";

import {NetworkMenuContext} from "./contexts/NetworkMenuContext";
import {TokenMenuContext} from "./contexts/TokenMenuContext";

import BridgeEstimateSection from "./components/BridgeEstimateSection";

interface DestinationGridProps {
    className?: string,
    amountIn:   BigNumber,
}

export default function DestinationGrid(props: DestinationGridProps) {
    const
        {selectedNetworkFrom, selectedNetworkTo} = useContext(NetworkMenuContext),
        {selectedTokenFrom,   selectedTokenTo}   = useContext(TokenMenuContext);

    const {
        NetworkMenu,
        networkMenuProps
    } = useNetworkMenu({
        networks:      supportedNetworks(),
        direction:     BridgeDirections.TO,
        disabledChain: selectedNetworkFrom.chainId,
        startIdx:      1
    });

    const {
        TokenMenu,
        tokenMenuProps
    } = useDestinationTokenMenu();

    return (
        <div>
            <NetworkMenu {...networkMenuProps} />
            <TokenMenu {...tokenMenuProps} />
            <BridgeEstimateSection
                tokenFrom={selectedTokenFrom}
                tokenTo={selectedTokenTo}
                chainFrom={selectedNetworkFrom.chainId}
                chainTo={selectedNetworkTo.chainId}
                amountIn={props.amountIn}
            />
        </div>
    )
}