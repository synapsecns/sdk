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
    selectedTokenFrom:    Tokens.USDT,
    setSelectedTokenFrom: null,
    selectedTokenTo:      Tokens.USDT,
    setSelectedTokenTo:   null,
})

export const TokenMenuContextProvider = ({children}) => {
    const
        [selectedTokenFrom, setSelectedTokenFrom] = useState<Token>(Tokens.USDT),
        [selectedTokenTo,   setSelectedTokenTo]   = useState<Token>(Tokens.USDT);

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