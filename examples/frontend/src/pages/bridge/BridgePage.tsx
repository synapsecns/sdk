import {useEffect, useState} from "react";

import {BridgeDirections} from "./Directions";

import NetworkDropdown from "./components/NetworkDropdown";
import TokenDropdown from "./components/TokenDropdown";
import BridgeEstimateSection from "./components/BridgeEstimateSection";
import AmountFromDropdown, {AmountDropdownItem} from "./components/AmountFromDropdown";

import type {Token} from "@synapseprotocol/sdk";
import {
    Networks,
    detailedTokenSwapMap,
    supportedNetworks,
} from "@synapseprotocol/sdk";

import {Grid} from "../../components/Grid";

import {BigNumber} from "ethers";

import {DropdownItem} from "../../components/DropdownMenu";

function getDestinationChainTokens({sourceChain, destChain, sourceToken}: {
    sourceChain: number,
    destChain:   number,
    sourceToken: Token,
}): Token[] {
    const swapMap = detailedTokenSwapMap()[sourceChain].find(({token}) => sourceToken.isEqual(token));
    return swapMap[destChain] ?? [];
}

interface TokenDropdownItem extends DropdownItem {
    token: Token,
}

function makeTokenDropdownItems(tokens: Token[]): TokenDropdownItem[] {
    return tokens.map((t) => ({
        label:    t.name,
        key:      String(t.hash),
        token:    t,
        disabled: false,
    }))
}

export function BridgePage(props: {className?: string}) {
    const networkDropdownItems = supportedNetworks().map(({name, chainId}) => ({
        label:    name,
        key:      chainId.toString(),
        disabled: false,
        chainId,
    }));



    const
        [selectedChainFrom, setSelectedChainFrom] = useState(networkDropdownItems[0]),
        [selectedChainTo,   setSelectedChainTo]   = useState(networkDropdownItems[1]),
        [amountFrom,        setAmountFrom]        = useState(allowedAmountsFrom[0]);

    const
        sourceNetwork = Networks.fromChainId(selectedChainFrom.chainId),
        destNetwork   = Networks.fromChainId(selectedChainTo.chainId);

    let sourceTokenItems = makeTokenDropdownItems(sourceNetwork.tokens);

    const [sourceToken, setSourceToken] = useState(sourceTokenItems[0]);

    const [allowedDestTokens, setAllowedDestTokens] = useState(getDestinationChainTokens({
        sourceChain: sourceNetwork.chainId,
        destChain:   destNetwork.chainId,
        sourceToken: sourceToken.token,
    }));

    let destTokenItems = makeTokenDropdownItems(allowedDestTokens)
    let [destToken, setDestToken] = useState(destTokenItems[0]);

    useEffect(() => {
        setAllowedDestTokens(getDestinationChainTokens({
            sourceChain: sourceNetwork.chainId,
            destChain:   destNetwork.chainId,
            sourceToken: sourceToken.token,
        }));
    }, [sourceToken])

    useEffect(() => {
        if (selectedChainFrom.chainId === selectedChainTo.chainId) {
            // disable the network on the other side?
        }
    }, [selectedChainFrom, selectedChainTo]);

    useEffect(() => {
        console.log(`amountFrom changed to ${amountFrom.amount}`);
    }, [amountFrom])

    return(
        <Grid className={"grid-flow-col"} rows={4} cols={2} gapX={4} gapY={4}>
            <div>
                <NetworkDropdown
                    direction={BridgeDirections.FROM}
                    selected={selectedChainFrom}
                    setSelected={setSelectedChainFrom}
                    networks={networkDropdownItems}
                />
                <TokenDropdown
                    direction={BridgeDirections.FROM}
                    selected={sourceToken}
                    setSelected={setSourceToken}
                    tokens={sourceTokenItems}
                />
                <AmountFromDropdown
                    selected={amountFrom}
                    setSelected={setAmountFrom}
                    items={allowedAmountsFrom}
                />
            </div>
            <div>
                <NetworkDropdown
                    direction={BridgeDirections.TO}
                    selected={selectedChainTo}
                    setSelected={setSelectedChainTo}
                    networks={networkDropdownItems}
                />
                <TokenDropdown
                    direction={BridgeDirections.TO}
                    selected={destToken}
                    setSelected={setDestToken}
                    tokens={destTokenItems}
                />
                <BridgeEstimateSection
                    tokenFrom={sourceToken.token}
                    tokenTo={destToken.token}
                    chainFrom={selectedChainFrom.chainId}
                    chainTo={selectedChainTo.chainId}
                    amountIn={amountFrom.amount}
                />
            </div>
        </Grid>
    )
}