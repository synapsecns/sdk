export * from "./react_utils";

export type {
    EventFunction,
    SetStateFunction
} from "./types";

export const asError = (e: any): Error => e instanceof Error ? e : new Error(e)