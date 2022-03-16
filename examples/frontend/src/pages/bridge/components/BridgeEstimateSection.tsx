import {useEffect, useContext, useState} from "react";

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

function fixWeiValue(wei: BigNumber, tokenDecimals: number): BigNumber {
    const mul = BigNumber.from(10).pow(18 - tokenDecimals);
    return wei.mul(mul);
}

function formatValue(
    t:              Token,
    networkTo:      Networks.Network | number,
    value:          string,
    roundingPlaces: number = 3,
    fixWei:         boolean = false
): string {
    const chainIdTo = networkTo instanceof Networks.Network
        ? networkTo.chainId
        : networkTo;

    const
        tokenDecimals: number = t.decimals(chainIdTo),
        valueBn = BigNumber.from(value);

    const weiValue: BigNumber = fixWei
        ? fixWeiValue(valueBn, tokenDecimals)
        : valueBn;

    // if a token has a .decimals() value of 6,
    // rounding the resultant value to 6 decimal places will
    // cause `valueEther()` to return 0.
    roundingPlaces = fixWei
        ? (tokenDecimals <= roundingPlaces ? roundingPlaces / 2 : roundingPlaces)
        : roundingPlaces;

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

    const [formattedEstimate, setFormattedEstimate] = useState<string>(BigNumber.from(0).toString());
    const [formattedFee,      setFormattedFee]      = useState<string>(BigNumber.from(0).toString());

    useEffect(() => {
        if (!estimate) {
            return
        }
        // pass `true` here so that `formatValue()` will "fix" the Wei value
        // passed to `valueEther()` if the passed token has a .decimals() value on the passed network
        // which isn't 18.
        setFormattedEstimate(formatValue(
            tokenTo,
            selectedNetworkTo,
            estimate.toString(),
            4,
            true
        ));
    }, [estimate]);

    useEffect(() => {
        if (!fee) {
            return
        }
        // no need to pass a boolean value here, since
        // bridge fees are -- usually... -- based in denominations
        // of tokens with a .decimals() value of 18.
        setFormattedFee(formatValue(
            tokenFrom,
            selectedNetworkTo,
            fee.toString(),
            4
        ));
    }, [fee]);

    return (
        <DarkRoundedItem>
            {estimate &&
                <LabeledItem
                    title={"Estimated output"}
                    value={formattedEstimate}
                />
            }
            {fee &&
                <LabeledItem
                    title={"Bridge fee"}
                    value={formattedFee}
                />
            }
        </DarkRoundedItem>
    )
}