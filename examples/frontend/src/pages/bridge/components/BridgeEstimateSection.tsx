import {useEffect, useContext} from "react";

import type {Token} from "@synapseprotocol/sdk";

import {BigNumber} from "ethers";

import {useGetBridgeEstimate} from "@hooks";

import {SetStateFunction, valueEther} from "@utils";

import DarkRoundedItem from "@components/DarkRoundedItem";
import {NetworkMenuContext} from "@pages/bridge/contexts/NetworkMenuContext";
import {Networks} from "@synapseprotocol/sdk";
import {parseUnits} from "@ethersproject/units";

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

function fixWeiValue(wei: BigNumber, tokenDecimals: number): BigNumber {
    console.log("=== fixWeiValue ===");
    console.log({ wei: wei.toString(), tokenDecimals });
    const mul = BigNumber.from(10).pow(18 - tokenDecimals);
    console.log({ mul: mul.toString() });
    const ret = wei.mul(mul);
    console.log({ ret: ret.toString() });

    return ret
}

function formatValue(t: Token, networkTo: Networks.Network | number, value: string, fixWei: boolean = false): string {
    const chainIdTo = networkTo instanceof Networks.Network
        ? networkTo.chainId
        : networkTo;

    const
        tokenDecimals: number = t.decimals(chainIdTo),
        valueBn = BigNumber.from(value);

    const weiValue: BigNumber = fixWei
        ? fixWeiValue(valueBn, tokenDecimals)
        : valueBn;

    const roundingPlaces = fixWei
        ? (tokenDecimals <= 6 ? 3 : 6)
        : 6;

    const ether: string = valueEther(weiValue, {round: true, places: roundingPlaces});
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
                    value={formatValue(tokenTo, selectedNetworkTo, estimate.toString(), true)}
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