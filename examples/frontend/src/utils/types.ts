import React from "react";

import type {MouseEventHandler} from "react";

export type EventFunction = MouseEventHandler<HTMLButtonElement>;

export type SetStateFunction<T> = React.Dispatch<React.SetStateAction<T>>