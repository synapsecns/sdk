import React, {useState, createContext, useEffect} from "react";

import {Networks} from "@synapseprotocol/sdk";

import {useMetaMask} from "metamask-react";

import type {SetStateFunction} from "@utils";
import {BigNumber} from "@ethersproject/bignumber";

type Context = {
    selectedNetworkFrom:     Networks.Network,
    setSelectedNetworkFrom:  SetStateFunction<Networks.Network>,
    selectedNetworkTo:       Networks.Network,
    setSelectedNetworkTo:    SetStateFunction<Networks.Network>,
}

export const NetworkMenuContext = createContext<Context>({
    selectedNetworkFrom:    Networks.AVALANCHE,
    setSelectedNetworkFrom: null,
    selectedNetworkTo:      Networks.BSC,
    setSelectedNetworkTo:   null,
})

export const NetworkMenuContextProvider = ({children}) => {
    const {status, chainId} = useMetaMask();

    const [connectedNetwork, setConnectedNetwork] = useState<Networks.Network>(null);

    useEffect(() => {
        if (status === "connected") {
            setConnectedNetwork(Networks.fromChainId(BigNumber.from(chainId).toNumber()));
        }
    }, [status, chainId])

    const
        [selectedNetworkFrom, setSelectedNetworkFrom] = useState<Networks.Network>(connectedNetwork ?? Networks.AVALANCHE),
        [selectedNetworkTo,   setSelectedNetworkTo]   = useState<Networks.Network>(Networks.BSC);

    useEffect(() => {
        if (connectedNetwork !== null) {
            setSelectedNetworkFrom(connectedNetwork);
        }
    }, [connectedNetwork])

    return (
        <NetworkMenuContext.Provider
            value={{

                selectedNetworkFrom,
                setSelectedNetworkFrom,
                selectedNetworkTo,
                setSelectedNetworkTo,
            }}
        >
            {children}
        </NetworkMenuContext.Provider>
    )
}