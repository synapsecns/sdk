import {useContext} from "react";

import {useNetworkMenu} from "./hooks/useNetworkMenu";
import {useDestinationTokenMenu} from "./hooks/useTokenMenu";

import {BigNumber} from "ethers";

import {ChainId, supportedNetworks} from "@synapseprotocol/sdk";

import {BridgeDirections} from "./Directions";

import {NetworkMenuContext} from "./contexts/NetworkMenuContext";

import BridgeEstimateSection from "./components/BridgeEstimateSection";
import {SetStateFunction} from "../../utils";

interface DestinationGridProps {
    className?:   string,
    amountIn:     BigNumber,
    amountOut:    BigNumber,
    setAmountOut: SetStateFunction<BigNumber>
}

export default function DestinationGrid(props: DestinationGridProps) {
    const {selectedNetworkFrom} = useContext(NetworkMenuContext);

    const {
        NetworkMenu,
        networkMenuProps
    } = useNetworkMenu({
        networks:      supportedNetworks(),
        direction:     BridgeDirections.TO,
        disabledChain: selectedNetworkFrom.chainId,
        startIdx:      supportedNetworks().findIndex((n) => n.chainId === ChainId.BSC)
    });

    const {
        TokenMenu,
        tokenMenuProps
    } = useDestinationTokenMenu();

    return (
        <div>
            <NetworkMenu {...networkMenuProps} />
            <TokenMenu {...tokenMenuProps} />
            <BridgeEstimateSection {...props} />
        </div>
    )
}