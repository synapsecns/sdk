import {useEffect, useState} from "react";

import {Bridge} from "@synapseprotocol/sdk";
import type {Token} from "@synapseprotocol/sdk";

import {BigNumber} from "ethers";

import {useSynapseBridge} from "./useSynapseBridge";

import {asError} from "../utils";

const NO_AMT_OUT: BigNumber = BigNumber.from(0);

interface UseGetBridgeEstimateArgs {
    amountIn:      BigNumber,
    chainFrom:     number,
    chainTo:       number,
    tokenFrom:     Token,
    tokenTo:       Token
}

function getBridgeEstimate(
    args: UseGetBridgeEstimateArgs,
    synapseBridge: Bridge.SynapseBridge
): Promise<Bridge.BridgeOutputEstimate> {

    let {chainTo: chainIdTo, ...rest} = args;
    const estimateArgs = {...rest, chainIdTo} as Bridge.BridgeParams;

    return synapseBridge.estimateBridgeTokenOutput(estimateArgs)
}

export function useGetBridgeEstimate(args: UseGetBridgeEstimateArgs) {
    const {chainFrom, amountIn} = args;

    const
        [synapseBridge] = useSynapseBridge({chainId: chainFrom}),
        [amountOut, setAmountOut] = useState<BigNumber>(NO_AMT_OUT),
        [bridgeFee, setBridgeFee] = useState<BigNumber>(NO_AMT_OUT);

    useEffect(() => {
        console.log(`chainFrom changed to ${chainFrom}`);
        setAmountOut(NO_AMT_OUT);
        setBridgeFee(NO_AMT_OUT);
    }, [chainFrom])

    const notFired = amountOut.eq(NO_AMT_OUT) && bridgeFee.eq(NO_AMT_OUT);

    useEffect(() => {
        if (typeof amountIn !== "undefined") {
            getBridgeEstimate(args, synapseBridge)
                .then(({amountToReceive, bridgeFee}) => {
                    setAmountOut(amountToReceive);
                    setBridgeFee(bridgeFee);
                })
                .catch((err) => {
                    console.error(asError(err));
                })
        }
    }, [amountIn, notFired]);

    return [amountOut, bridgeFee] as const;
}