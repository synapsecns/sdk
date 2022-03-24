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
    if (tokenDecimals === 18) {
        return wei
    }

    const TEN = BigNumber.from(10);
    const mul = TEN.pow(18).div(TEN.pow(tokenDecimals));

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

    const ether: string = valueEther(weiValue, {round: true, places: roundingPlaces});

    return `${ether} ${t.symbol}`
}

export default function BridgeEstimateSection(props: BridgeEstimateSectionProps) {
    const {selectedNetworkTo} = useContext(NetworkMenuContext);
    const {setAmountOut} = props;

    const [estimate, fee, tokenFrom, tokenTo] = useGetBridgeEstimate(props);

    const [formattedEstimate, setFormattedEstimate] = useState<string>(BigNumber.from(0).toString());
    const [formattedFee,      setFormattedFee]      = useState<string>(BigNumber.from(0).toString());

    useEffect(() => {
        if (!estimate) {
            return
        }

        setAmountOut(estimate);

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