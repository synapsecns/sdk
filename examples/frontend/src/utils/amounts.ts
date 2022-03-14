import {BigNumber, BigNumberish} from "@ethersproject/bignumber";

import {formatEther, parseUnits} from "@ethersproject/units";

export function valueWei(ether: BigNumberish, decimals: number): BigNumber {
    return parseUnits(
        BigNumber.from(ether).toString(),
        decimals
    )
}

interface RoundingOptions {
    round:          boolean,
    places?:        number,
}

const PLACES: number = 6;

export function valueEther(wei: BigNumberish, opts?: RoundingOptions): string {
    const weiVal = BigNumber.from(wei);
    let amtEther: string = formatEther(weiVal);

    opts = opts ?? { round: false, places: PLACES };
    const {round, places=PLACES} = opts;

    if (round) {
        let exp = 18-places;
        let pow = BigNumber.from(10).pow(exp);

        let remainder = weiVal.mod(pow);
        amtEther = formatEther(weiVal.sub(remainder));
    }

    return amtEther
}
