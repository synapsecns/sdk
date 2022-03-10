import {BigNumber}   from "@ethersproject/bignumber";
import {formatUnits} from "@ethersproject/units";

export namespace Slippages {
    export type Slippage = string;

    export const
        One:      Slippage = "ONE",
        OneTenth: Slippage = "ONE_TENTH",
        TwoTenth: Slippage = "TWO_TENTH",
        Quarter:  Slippage = "QUARTER";

    export function _applySlippage(
        inputValue:       BigNumber,
        slippageSelected: string|Slippage,
        add:              boolean = false
    ): BigNumber {
        let numerator: number, denominator: number;
        switch (slippageSelected) {
            case Slippages.OneTenth:
                denominator = 1000;
                numerator = denominator + (add ? 1 : -1);
                break;
            case Slippages.TwoTenth:
                denominator = 500;
                numerator = denominator + (add ? 1 : -1);
                break;
            case Slippages.Quarter:
                denominator = 50;
                numerator = denominator + (add ? 1 : -1);
                break;
            default: // default to 1%
                denominator = 100;
                numerator = denominator + (add ? 1 : -1);
                break;
        }

        return inputValue.mul(numerator).div(denominator);
    }

    export function addSlippage(inputValue: BigNumber, slippageSelected: string|Slippage): BigNumber {
        return _applySlippage(inputValue, slippageSelected, true);
    }

    export function subtractSlippage(inputValue: BigNumber, slippageSelected: string|Slippage): BigNumber {
        return _applySlippage(inputValue, slippageSelected, false);
    }

    export function formatSlippageToString(slippageSelected: string|Slippage): string {
        switch (slippageSelected) {
            case Slippages.One:
                return formatUnits(BigNumber.from(100), 2)
            case Slippages.OneTenth:
                return formatUnits(BigNumber.from(100), 3)
            case Slippages.TwoTenth:
                return formatUnits(BigNumber.from(200), 3)
            case Slippages.Quarter:
                return formatUnits(BigNumber.from(2000), 3)
            default:
                return "N/A"
        }
    }
}