import React, {useState, createContext} from "react";

import type {Token} from "@synapseprotocol/sdk";

import type {SetStateFunction} from "../../../utils";
import {Tokens} from "@synapseprotocol/sdk";

type Context = {
    selectedTokenFrom:     Token,
    setSelectedTokenFrom:  SetStateFunction<Token>,
    selectedTokenTo:       Token,
    setSelectedTokenTo:    SetStateFunction<Token>,
}

export const TokenMenuContext = createContext<Context>({
    selectedTokenFrom:    Tokens.SYN,
    setSelectedTokenFrom: null,
    selectedTokenTo:      Tokens.SYN,
    setSelectedTokenTo:   null,
})

export const TokenMenuContextProvider = ({children}) => {
    const
        [selectedTokenFrom, setSelectedTokenFrom] = useState<Token>(Tokens.SYN),
        [selectedTokenTo,   setSelectedTokenTo]   = useState<Token>(Tokens.SYN);

    return (
        <TokenMenuContext.Provider
            value={{
                selectedTokenFrom,
                setSelectedTokenFrom,
                selectedTokenTo,
                setSelectedTokenTo,
            }}
        >
    {children}
    </TokenMenuContext.Provider>
)
}