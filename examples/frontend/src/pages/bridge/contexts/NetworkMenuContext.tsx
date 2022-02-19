import React, {useState, createContext, useContext} from "react";

import {Networks} from "@synapseprotocol/sdk";

import type {SetStateFunction} from "../../../utils";
import {isNullOrUndefined} from "../../../utils";

type Context = {
    selectedNetworkFrom:     Networks.Network,
    setSelectedNetworkFrom:  SetStateFunction<Networks.Network>,
    selectedNetworkTo:       Networks.Network,
    setSelectedNetworkTo:    SetStateFunction<Networks.Network>,
}

export const NetworkMenuContext = createContext<Context>({
    selectedNetworkFrom:    Networks.ETH,
    setSelectedNetworkFrom: null,
    selectedNetworkTo:      Networks.BSC,
    setSelectedNetworkTo:   null,
})

export const NetworkMenuContextProvider = ({children}) => {
    const
        [selectedNetworkFrom, setSelectedNetworkFrom] = useState<Networks.Network>(Networks.ETH),
        [selectedNetworkTo,   setSelectedNetworkTo]   = useState<Networks.Network>(Networks.BSC);

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