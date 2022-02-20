import React from "react";

import type {MouseEventHandler} from "react";

export type EventFunction = MouseEventHandler<HTMLButtonElement>;

export type SetStateFunction<T> = React.Dispatch<React.SetStateAction<T>>

export enum TransactionStatus {
    NOT_SENT,
    SENT,
    COMPLETE,
    ERROR,
}

export enum MetamaskStatus {
    INIT          = "initializing",
    UNAVAILABLE   = "unavailable",
    NOT_CONNECTED = "notConnected",
    CONNECTING    = "connecting",
    CONNECTED     = "connected"
}