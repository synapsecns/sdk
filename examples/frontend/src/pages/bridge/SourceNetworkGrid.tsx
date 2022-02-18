import {useNetworkMenu} from "./hooks/useNetworkMenu";

import {NetworkMenuContextProvider} from "./contexts/NetworkMenuContext";

import TokenDropdown from "./components/TokenDropdown";
import NetworkDropdown from "./components/NetworkDropdown";
import AmountFromDropdown from "./components/AmountFromDropdown";
import type {AmountDropdownItem} from "./components/AmountFromDropdown";

import {BigNumber} from "ethers";

import {Networks, Token} from "@synapseprotocol/sdk";
import {SetStateFunction} from "../../utils";

export const AMOUNTS_FROM_OPTIONS: AmountDropdownItem[] = [10, 50, 100, 500, 1000].map((n) => {
    let amount = BigNumber.from(n);

    return {
        amount,
        label:    amount.toString(),
        disabled: false,
        key:      amount.toString(),
    }
})

interface SourceNetworkGridProps {
    selectedNetwork:       Networks.Network,
    selectedToken:         Token,
    selectedAmountFrom:    AmountDropdownItem,
    setSelectedAmountFrom: SetStateFunction<AmountDropdownItem>
}

export default function SourceNetworkGrid(props: SourceNetworkGridProps) {
    const {
        selectedNetwork,
        selectedToken,
        selectedAmountFrom,
        setSelectedAmountFrom
    } = props;

    const {
        NetworkMenu,

    }
}