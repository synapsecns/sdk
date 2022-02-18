import React, {useState, createContext} from "react";

import {Networks} from "@synapseprotocol/sdk";

import type {SetStateFunction} from "../../../utils";

type Context = {
    selectedNetwork:     Networks.Network,
    setSelectedNetwork:  SetStateFunction<Networks.Network>,
}

export const NetworkMenuContext = createContext<Context>({
    selectedNetwork:    null,
    setSelectedNetwork: null,
})

export const NetworkMenuContextProvider = ({children}) => {
    const [selectedNetwork, setSelectedNetwork] = useState<Networks.Network>(null);

    return (
        <NetworkMenuContext.Provider
            value={{
                selectedNetwork,
                setSelectedNetwork
            }}
        >
            {children}
        </NetworkMenuContext.Provider>
    )
}