import {BridgeDirections} from "./Directions";
import {NetworkDropdown} from "./NetworkDropdown";
import {TokenDropdown} from "./TokenDropdown";

import type {Token} from "@synapseprotocol/sdk";
import {
    Bridge,
    Networks,
    detailedTokenSwapMap,
    supportedNetworks,
} from "@synapseprotocol/sdk";

import {useEffect, useState} from "react";
import {Grid} from "../../components/Grid";

import {BigNumber} from "ethers";
import {DropdownItem, DropdownMenu} from "../../components/DropdownMenu";
import {classNames} from "../../utils";

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

interface AmountDropdownItem extends DropdownItem {
    amount: BigNumber,
}


interface AmountDropdownProps {
    selected:    AmountDropdownItem,
    setSelected: any,
    items:       AmountDropdownItem[]
}

function AmountFromDropdown({selected, setSelected, items}: AmountDropdownProps) {
    return(<div
        className={classNames(
            "rounded-md border",
            "shadow-md",
            "dark:bg-gray-800 dark:border-gray-600",
        )}>
        <DropdownMenu
            title={"Select amount from"}
            selectedItem={selected}
            setSelectedItem={setSelected}
            items={items}
        />
    </div>)
}

function useGetAmountOutEstimate({synapseBridge, amountIn, chainTo, tokenFrom, tokenTo}: {
    synapseBridge: Bridge.SynapseBridge,
    amountIn:      BigNumber,
    chainTo:       number,
    tokenFrom:     Token,
    tokenTo:       Token
}): [BigNumber, () => void] {
    let [amountOut, setAmountOut] = useState(BigNumber.from(0));

    function getEstimate(): void {
        console.log({amountIn, chainTo, tokenFrom, tokenTo});
        synapseBridge.estimateBridgeTokenOutput({
            tokenFrom,
            tokenTo,
            amountFrom: amountIn,
            chainIdTo: chainTo,
        }).then((res) =>
            setAmountOut(res.amountToReceive)
        ).catch((err) => console.error(err))

        return
    }

    // getEstimate();

    // useEffect(() => {
    //     getEstimate();
    // }, [amountIn, chainTo, tokenFrom, tokenTo])

    return [amountOut, getEstimate]
}

export function BridgePage(props: {className?: string}) {
    const networkDropdownItems = supportedNetworks().map(({name, chainId}) => ({
        label:    name,
        key:      chainId.toString(),
        disabled: false,
        chainId,
    }));

    const allowedAmountsFrom: AmountDropdownItem[] = [10, 50, 100, 500, 1000].map((n) => {
        let amount = BigNumber.from(n);

        return {
            amount,
            label:    amount.toString(),
            disabled: false,
            key:      amount.toString(),
        }
    })

    let
        [selectedChainFrom, setSelectedChainFrom] = useState(networkDropdownItems[0]),
        [selectedChainTo,   setSelectedChainTo]   = useState(networkDropdownItems[1]),
        [amountFrom,        setAmountFrom]        = useState(allowedAmountsFrom[0]);

    let
        sourceNetwork = Networks.fromChainId(selectedChainFrom.chainId),
        destNetwork   = Networks.fromChainId(selectedChainTo.chainId);

    let synapseBridge = new Bridge.SynapseBridge({network: selectedChainFrom.chainId});

    useEffect(() => {
        synapseBridge = new Bridge.SynapseBridge({network: selectedChainFrom.chainId});
    }, [selectedChainFrom])

    let sourceTokenItems = makeTokenDropdownItems(sourceNetwork.tokens);

    let [sourceToken, setSourceToken] = useState(sourceTokenItems[0]);

    let [allowedDestTokens, setAllowedDestTokens] = useState(getDestinationChainTokens({
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

    let [amountOutEstimate, getEstimate] = useGetAmountOutEstimate({
        synapseBridge,
        tokenFrom: sourceToken.token,
        tokenTo:   destToken.token,
        chainTo:   selectedChainTo.chainId,
        amountIn:  amountFrom.amount,
    });

    getEstimate();

    useEffect(() => {
        console.log(amountOutEstimate.toString());
    }, [amountOutEstimate])

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
                <div
                    className={classNames(
                        "rounded-md border",
                        "shadow-md",
                        "dark:bg-gray-800 dark:border-gray-600",
                    )}>
                    <span>{amountOutEstimate && amountOutEstimate.toString()}</span>
                </div>
            </div>
        </Grid>
    )
}