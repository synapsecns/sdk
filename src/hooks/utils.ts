import { BigNumber } from "ethers"

export function getTimeMinutesFromNow(minutesFromNow) {
    const currentTimeSeconds = new Date().getTime() / 1000

    return Math.round(
    currentTimeSeconds + 60 * minutesFromNow
    )
}

export function uiToNative(amount: number, decimals: number): BigNumber {
    return BigNumber.from(Math.round(amount * Math.pow(10, decimals)));
}

export function nativeToUi(amount: number, decimals: number): number {
    return amount / Math.pow(10, decimals);
}