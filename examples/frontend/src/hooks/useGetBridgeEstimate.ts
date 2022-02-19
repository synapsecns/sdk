import {useContext, useEffect, useState} from "react";

import {Bridge} from "@synapseprotocol/sdk";
import type {Token} from "@synapseprotocol/sdk";

import {BigNumber} from "ethers";

import {useSynapseBridge} from "./useSynapseBridge";

import {asError} from "../utils";
import {NetworkMenuContext} from "../pages/bridge/contexts/NetworkMenuContext";
import {TokenMenuContext} from "../pages/bridge/contexts/TokenMenuContext";
import {formatEther} from "@ethersproject/units";

const NO_AMT_OUT: BigNumber = BigNumber.from(0);

interface UseGetBridgeEstimateArgs {
    amountIn:      BigNumber,
}

function getBridgeEstimate(
    args: {tokenFrom: Token, tokenTo: Token, chainIdTo: number, amountFrom: BigNumber},
    synapseBridge: Bridge.SynapseBridge
): Promise<Bridge.BridgeOutputEstimate> {
    return synapseBridge.estimateBridgeTokenOutput(args)
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
        [synapseBridge] = useSynapseBridge({chainId: selectedNetworkFrom.chainId}),
        [amountOut, setAmountOut] = useState<string>(null),
        [bridgeFee, setBridgeFee] = useState<string>(null);

    useEffect(() => {
        if (typeof amountIn !== "undefined" && !amountIn.eq(0)) {
            let estimateArgs = {
                chainIdTo:  selectedNetworkTo.chainId,
                tokenFrom:  selectedTokenFrom,
                tokenTo:    selectedTokenTo,
                amountFrom: selectedTokenFrom.valueToWei(amountIn, selectedNetworkFrom.chainId)
            };

            getBridgeEstimate(estimateArgs, synapseBridge)
                .then((res) => {
                    let
                        amtOut = formatEther(res.amountToReceive),
                        fee    = formatEther(res.bridgeFee);

                    setAmountOut(amtOut);
                    setBridgeFee(fee);
                })
                .catch((err) => {
                    console.error(asError(err));
                })
        }
    }, [amountIn]);

    return [amountOut, bridgeFee, selectedTokenTo] as const;
}