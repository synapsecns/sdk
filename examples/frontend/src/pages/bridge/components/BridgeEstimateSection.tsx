import {useEffect, useContext} from "react";

import type {Token} from "@synapseprotocol/sdk";

import {BigNumber} from "ethers";

import {useGetBridgeEstimate} from "@hooks";

import {SetStateFunction, valueEther} from "@utils";

import DarkRoundedItem from "@components/DarkRoundedItem";
import {NetworkMenuContext} from "@pages/bridge/contexts/NetworkMenuContext";
import {Networks} from "@synapseprotocol/sdk";

interface BridgeEstimateSectionProps {
    amountIn:   BigNumber,
    setAmountOut: SetStateFunction<BigNumber>
}

const LabeledItem = ({title, value}) => (
    <div>
        <label className={"block text-sm font-medium"}>{title}</label>
        <span className={"block text-2xl"}>{value}</span>
    </div>
)

function formatValue(t: Token, networkTo: Networks.Network | number, value: string): string {
    const chainIdTo = networkTo instanceof Networks.Network
        ? networkTo.chainId
        : networkTo;

    const tokenDecimals: number = t.decimals(chainIdTo);

    const ether: string = valueEther(value, {round: true, tokenDecimals});
    return `${ether} ${t.symbol}`
}

export default function BridgeEstimateSection(props: BridgeEstimateSectionProps) {
    const {selectedNetworkTo} = useContext(NetworkMenuContext);
    const {setAmountOut} = props;

    const [estimate, fee, tokenFrom, tokenTo] = useGetBridgeEstimate(props);

    useEffect(() => {
        setAmountOut(estimate);
    }, [estimate])

    return (
        <DarkRoundedItem>
            {estimate &&
                <LabeledItem
                    title={"Estimated output"}
                    value={formatValue(tokenTo, selectedNetworkTo, estimate.toString())}
                />
            }
            {fee &&
                <LabeledItem
                    title={"Bridge fee"}
                    value={formatValue(tokenFrom, selectedNetworkTo, fee.toString())}
                />
            }
        </DarkRoundedItem>
    )
}