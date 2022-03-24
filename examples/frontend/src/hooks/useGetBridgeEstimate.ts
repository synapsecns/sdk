import {useContext, useEffect, useState} from "react";

import {Bridge} from "@synapseprotocol/sdk";
import type {Token} from "@synapseprotocol/sdk";

import {BigNumber} from "ethers";

import {useSynapseBridge} from "./useSynapseBridge";

import {asError} from "@utils";
import {NetworkMenuContext} from "@pages/bridge/contexts/NetworkMenuContext";
import {TokenMenuContext} from "@pages/bridge/contexts/TokenMenuContext";
import {parseEther, parseUnits} from "@ethersproject/units";

const unitNames = {
    wei:    0,
    kwei:   3,
    mwei:   6,
    gwei:   9,
    szabo:  12,
    finney: 15,
    ether:  18,
}

interface UseGetBridgeEstimateArgs {
    amountIn:      BigNumber,
}

function getBridgeEstimate(
    args: {tokenFrom: Token, tokenTo: Token, chainIdTo: number, amountFrom: BigNumber},
    synapseBridge: Bridge.SynapseBridge
): Promise<Bridge.BridgeOutputEstimate> {
    return synapseBridge.estimateBridgeTokenOutput(args)
}

function fixAmt(ether: BigNumber, token: Token, chainId: number): BigNumber {
    const decimals = token.decimals(chainId) ?? 18;

    if (decimals === 18) {
        return parseEther(ether.toString())
    }

    const unit = unitNames[decimals];

    return parseUnits(ether.toString(), unit)
}

export function useGetBridgeEstimate(args: UseGetBridgeEstimateArgs) {
    const {
        selectedNetworkFrom,
        selectedNetworkTo
    } = useContext(NetworkMenuContext);

    const {
        selectedTokenFrom,
        selectedTokenTo
    } = useContext(TokenMenuContext);

    const {amountIn} = args;

    const
        [synapseBridge, resetInstance] = useSynapseBridge(selectedNetworkFrom.chainId),
        [amountOut, setAmountOut] = useState<BigNumber>(null),
        [bridgeFee, setBridgeFee] = useState<BigNumber>(null);

    useEffect(() => {
        resetInstance(selectedNetworkFrom.chainId);
    }, [selectedNetworkFrom])


    useEffect(() => {
        if (typeof amountIn !== "undefined" && !amountIn.eq(0)) {

            const
                chainIdFrom = selectedNetworkFrom.chainId,
                chainIdTo = selectedNetworkTo.chainId,
                tokenFrom = selectedTokenFrom,
                tokenTo = selectedTokenTo;

            const amtFrom = tokenFrom.etherToWei(amountIn, chainIdFrom);
            let estimateArgs = {
                chainIdTo:  chainIdTo,
                tokenFrom:  tokenFrom,
                tokenTo:    tokenTo,
                amountFrom: amtFrom,
            };

            getBridgeEstimate(estimateArgs, synapseBridge)
                .then((res) => {
                    console.log(`${res.amountToReceive.toString()} ${res.bridgeFee.toString()}`);
                    let
                        amtOut = res.amountToReceive,
                        fee    = res.bridgeFee;

                    setAmountOut(amtOut);
                    setBridgeFee(fee);
                })
                .catch((err) => {
                    console.error(asError(err));
                })
        }
    }, [amountIn, selectedTokenFrom, selectedTokenTo]);

    return [amountOut, bridgeFee, selectedTokenFrom, selectedTokenTo] as const;
}