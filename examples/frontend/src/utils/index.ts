export * from "./react_utils";

export * from "./amounts";

export type {
    EventFunction,
    SetStateFunction
} from "./types";

export const asError = (e: any): Error => e instanceof Error ? e : new Error(e)

export const isNullOrUndefined = (value: any): boolean => typeof value === "undefined" || value === null