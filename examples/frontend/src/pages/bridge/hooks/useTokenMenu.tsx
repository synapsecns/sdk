import {useContext, useEffect, useState} from "react";

import _ from "lodash";

import TokenDropdown, {TokenDropdownItem} from "../components/TokenDropdown";

import {TokenMenuContext} from "../contexts/TokenMenuContext";

import {detailedTokenSwapMap, Networks} from "@synapseprotocol/sdk";

import type {Token} from "@synapseprotocol/sdk";
import {BridgeDirections} from "../Directions";
import {NetworkMenuContext} from "../contexts/NetworkMenuContext";
import {isNullOrUndefined, SetStateFunction} from "../../../utils";

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
        key:       String(t.hash),
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

function getDestinationChainTokens({sourceChain, destChain, sourceToken}: {
    sourceChain: number,
    destChain:   number,
    sourceToken: Token,
}): Token[] {
    const swapMap = detailedTokenSwapMap()[sourceChain].find(({token}) => sourceToken.isEqual(token));
    return swapMap[destChain] ?? [];
}

export function useDestinationTokenMenu() {
    const
        {selectedNetworkFrom, selectedNetworkTo}                 = useContext(NetworkMenuContext),
        {selectedTokenFrom, selectedTokenTo, setSelectedTokenTo} = useContext(TokenMenuContext);

    function getDestTokens(t: Token) {
        return getDestinationChainTokens({
            sourceChain: selectedNetworkFrom.chainId,
            destChain:   selectedNetworkTo.chainId,
            sourceToken: t,
        });
    }

    const [tokens, setTokens] = useState<Token[]>(getDestTokens(selectedTokenFrom));

    const
        [dropdownItems, setDropdownItems] = useState<TokenDropdownItem[]>(makeDropdownItems(tokens, selectedTokenTo)),
        [selected,      setSelected]      = useState<TokenDropdownItem>(dropdownItems[0] ?? null);

    useEffect(() => {
        console.log(selectedTokenFrom);
        let newTokens = getDestTokens(selectedTokenFrom);

        setTokens(newTokens);

        let newDropdownItems = makeDropdownItems(newTokens, selectedTokenTo);
        let newSelected = newDropdownItems[0];
        setSelected(newSelected);
        setDropdownItems(newDropdownItems);
    }, [selectedTokenFrom])

    useEffect(() => {
        if (!isNullOrUndefined(selected)) {
            updateContextSelection(selected, selectedTokenTo, setSelectedTokenTo);
        }
    }, [selected]);

    const [menuProps, setMenuProps] = useState({
        selected,
        setSelected,
        dropdownItems,
        direction: BridgeDirections.TO
    });

    useEffect(() => {
        if (!_.isEqual(menuProps.dropdownItems, dropdownItems)) {
            let newProps = {...menuProps, selected, dropdownItems}
            setMenuProps(newProps);
        }
    }, [dropdownItems, menuProps])

    return {
        TokenMenu,
        tokenMenuProps: menuProps
    }
}