import {useEffect} from "react";

import type {Token} from "@synapseprotocol/sdk";

import {BigNumber} from "ethers";

import {useGetBridgeEstimate} from "../../../hooks";

import {classNames, valueEther} from "../../../utils";

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

function formatValue(t: Token, value: string): string {
    const ether: string = valueEther(value, {round: true});
    return `${ether} ${t.symbol}`
}

export default function BridgeEstimateSection(props: BridgeEstimateSectionProps) {
    const [estimate, fee, tokenFrom, tokenTo] = useGetBridgeEstimate(props);

    return (
        <DarkRoundedItem>
            {estimate &&
                <LabeledItem
                    title={"Estimated output"}
                    value={formatValue(tokenTo, estimate.toString())}
                />
            }
            {fee &&
                <LabeledItem
                    title={"Bridge fee"}
                    value={formatValue(tokenFrom, fee.toString())}
                />
            }
        </DarkRoundedItem>
    )
}