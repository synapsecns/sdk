import {Bridge} from "@synapseprotocol/sdk";
import {useEffect, useState} from "react";

function newBridgeInstance(chainId: number): Bridge.SynapseBridge {
    return new Bridge.SynapseBridge({network:chainId})
}

interface UseSynapseBridgeArgs {
    chainId: number;
}

export function useSynapseBridge(chainId: number) {
    const [instance, setInstance] = useState(newBridgeInstance(chainId));
    useEffect(() => {
        setInstance(newBridgeInstance(chainId))
    }, [chainId])

    function resetInstance(cid: number) {
        setInstance(newBridgeInstance(cid));
    }

    return [instance, resetInstance] as const
}