import {useEffect} from "react";

import type {Token} from "@synapseprotocol/sdk";

import {BigNumber} from "ethers";

import {useGetBridgeEstimate} from "../../hooks";

import {classNames} from "../../utils";

interface BridgeEstimateSectionProps {
    chainFrom:  number,
    chainTo:    number,
    tokenFrom:  Token,
    tokenTo:    Token,
    amountIn:   BigNumber,
}

export default function BridgeEstimateSection(props: BridgeEstimateSectionProps) {
    const [amountOutEstimate, bridgeFee] = useGetBridgeEstimate(props);

    useEffect(() => {
        console.log(amountOutEstimate.toString());
    }, [amountOutEstimate])

    return(<div
            className={classNames(
            "rounded-md border",
            "shadow-md",
            "dark:bg-gray-800 dark:border-gray-600",
    )}>
    <span>{amountOutEstimate && amountOutEstimate.toString()}</span>
    </div>)
}