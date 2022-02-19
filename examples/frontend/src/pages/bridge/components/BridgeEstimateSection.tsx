import {useEffect} from "react";

import type {Token} from "@synapseprotocol/sdk";

import {BigNumber} from "ethers";

import {useGetBridgeEstimate} from "../../../hooks";

import {classNames} from "../../../utils";

import {DarkRoundedItem} from "../../../components/DarkRoundedItem";

interface BridgeEstimateSectionProps {
    chainFrom:  number,
    chainTo:    number,
    tokenFrom:  Token,
    tokenTo:    Token,
    amountIn:   BigNumber,
}

export default function BridgeEstimateSection(props: BridgeEstimateSectionProps) {
    const [amountOutEstimate, bridgeFee] = useGetBridgeEstimate(props);

    // useEffect(() => {
    //     console.log(amountOutEstimate.toString());
    // }, [amountOutEstimate])

    return (
        <DarkRoundedItem>
            <span>{amountOutEstimate && amountOutEstimate.toString()}</span>
        </DarkRoundedItem>
    )
}