import {useEffect} from "react";

import type {Token} from "@synapseprotocol/sdk";

import {BigNumber} from "ethers";

import {useGetBridgeEstimate} from "../../../hooks";

import {classNames} from "../../../utils";

import {DarkRoundedItem} from "../../../components/DarkRoundedItem";

interface BridgeEstimateSectionProps {
    amountIn:   BigNumber,
}

const LabeledItem = ({title, value}) => (
    <div>
        <label className={"block text-sm font-medium"}>{title}</label>
        <span className={"block text-md"}>{value}</span>
    </div>
)

function formatEstimate(estimate: string): string {
    let split = estimate.split(".");

    let places = split[1].substring(0, 2);

    return `${split[0]}.${places}`
}

function makeSymbolValueStr(t: Token, value: string): string {
    return `${value} ${t.symbol}`
}

export default function BridgeEstimateSection(props: BridgeEstimateSectionProps) {
    const [estimate, fee, tokenTo] = useGetBridgeEstimate(props);

    return (
        <DarkRoundedItem>
            {estimate && <LabeledItem title={"Estimated output"} value={makeSymbolValueStr(tokenTo, formatEstimate(estimate))}/>}
            {fee && <LabeledItem title={"Bridge fee"} value={makeSymbolValueStr(tokenTo, fee.toString())}/>}
        </DarkRoundedItem>
    )
}