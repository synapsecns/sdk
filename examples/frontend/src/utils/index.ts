export * from "./react_utils";

export * from "./amounts";

export * from "./types";

export * from "./transactions";

export type {
    EventFunction,
    SetStateFunction,
    DeferredPopulatedTransaction,
    OnClickFunction,
} from "./types";

export const asError = (e: any): Error => e instanceof Error ? e : new Error(e)

export const isNullOrUndefined = (value: any): boolean => typeof value === "undefined" || value === null