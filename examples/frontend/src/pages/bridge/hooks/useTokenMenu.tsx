import {useContext, useEffect, useState} from "react";

import TokenDropdown, {TokenDropdownItem} from "../components/TokenDropdown";

import {TokenMenuContext} from "../contexts/TokenMenuContext";

import {TokenSwap}  from "@synapseprotocol/sdk";
import type {Token} from "@synapseprotocol/sdk";

import {BridgeDirections}   from "../Directions";
import {NetworkMenuContext} from "../contexts/NetworkMenuContext";
import {isNullOrUndefined, SetStateFunction} from "@utils";

function TokenMenu({dropdownItems, direction, selected, setSelected}) {
    return (
        <TokenDropdown
            tokens={dropdownItems}
            selected={selected}
            setSelected={setSelected}
            direction={direction}
        />
    )
}

function isDisabled(t: Token, selected?: Token): boolean {
    if (!isNullOrUndefined(selected)) {
        return t.isEqual(selected)
    }

    return false
}

function makeDropdownItems(tokens: Token[], selected?: Token): TokenDropdownItem[] {
    return tokens.map((t) => ({
        label:     t.name,
        key:       String(t.id),
        disabled:  isDisabled(t, selected),
        token:     t,
    }));
}

function updateContextSelection(
    dropdownSelection: TokenDropdownItem,
    contextSelection:  Token,
    setContextSelection: SetStateFunction<Token>
) {
    let newSelection = dropdownSelection.token;
    if (isNullOrUndefined(newSelection)) {
        return
    }

    if (!isNullOrUndefined(contextSelection)) {
        if (!contextSelection.isEqual(newSelection)) {
            setContextSelection(newSelection);
        }
    } else {
        setContextSelection(newSelection);
    }
}

export function useSourceTokenMenu() {
    const
        {selectedNetworkFrom: network}            = useContext(NetworkMenuContext),
        {selectedTokenFrom, setSelectedTokenFrom} = useContext(TokenMenuContext),
        tokens = network?.tokens || [];

    const
        [dropdownItems, setDropdownItems] = useState<TokenDropdownItem[]>(makeDropdownItems(tokens, selectedTokenFrom)),
        [selected,      setSelected]      = useState<TokenDropdownItem>(dropdownItems[0] ?? null);

    useEffect(() => {
        setDropdownItems(makeDropdownItems(tokens, selectedTokenFrom));
        setSelected(dropdownItems[0]);
    }, [tokens])

    useEffect(() => {
        updateContextSelection(selected, selectedTokenFrom, setSelectedTokenFrom);
    }, [selected, selectedTokenFrom]);

    const tokenMenuProps = {
        selected,
        setSelected,
        dropdownItems,
        direction: BridgeDirections.FROM
    };

    return {
        TokenMenu,
        tokenMenuProps
    }
}

const NO_SUPPORTED_TOKENS: TokenDropdownItem = {
    label:     "no supported output tokens",
    key:       "NO_SUPPORTED_TOKENS",
    disabled:  true,
    token:     null,
}

function getDestinationChainTokens({sourceChain, destChain, sourceToken}: {
    sourceChain: number,
    destChain:   number,
    sourceToken: Token,
}): Token[] {
    const swapMap = TokenSwap.detailedTokenSwapMap()[sourceChain].find(({token}) => sourceToken.isEqual(token));
    return swapMap[destChain] ?? [];
}

export function useDestinationTokenMenu() {
    const
        {selectedNetworkFrom, selectedNetworkTo}                 = useContext(NetworkMenuContext),
        {selectedTokenFrom, selectedTokenTo, setSelectedTokenTo} = useContext(TokenMenuContext);

    function getDestTokens(t: Token, chainFrom: number, chainTo: number) {
        return getDestinationChainTokens({
            sourceChain: chainFrom,
            destChain:   chainTo,
            sourceToken: t,
        });
    }

    const [tokens, setTokens] = useState<Token[]>(getDestTokens(selectedTokenFrom, selectedNetworkFrom.chainId, selectedNetworkTo.chainId));

    useEffect(() => {
        let newTokens = getDestTokens(selectedTokenFrom, selectedNetworkFrom.chainId, selectedNetworkTo.chainId);
        setTokens(newTokens);
    }, [selectedNetworkTo])

    const
        [dropdownItems, setDropdownItems] = useState<TokenDropdownItem[]>(makeDropdownItems(tokens, selectedTokenTo)),
        [selected,      setSelected]      = useState<TokenDropdownItem>(
            dropdownItems.length > 0 ? dropdownItems[0] : NO_SUPPORTED_TOKENS
        );

    useEffect(() => {
        let newTokens = getDestTokens(selectedTokenFrom, selectedNetworkFrom.chainId, selectedNetworkTo.chainId);
        setTokens(newTokens);
    }, [selectedTokenFrom])

    useEffect(() => {
        let newDropdownItems = makeDropdownItems(tokens, selectedTokenTo);
        let newSelected = newDropdownItems.length > 0 ? newDropdownItems[0] : NO_SUPPORTED_TOKENS;
        setDropdownItems(newDropdownItems);
        setSelected(newSelected);
    }, [tokens])

    useEffect(() => {
        if (!isNullOrUndefined(selected)) {
            updateContextSelection(selected, selectedTokenTo, setSelectedTokenTo);
        }
    }, [selected, selectedTokenTo]);

    const menuProps = {
        selected,
        setSelected,
        dropdownItems,
        direction: BridgeDirections.TO
    };

    return {
        TokenMenu,
        tokenMenuProps: menuProps
    }
}