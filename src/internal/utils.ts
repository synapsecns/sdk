import {find} from "lodash-es";

import type {Token} from "@token";
import {Tokens} from "@tokens";

function tokenReducer(check: Token): Token {
    const ret: Token = find(Tokens.AllTokens, (t => check.isEqual(t)));

    return !ret ? undefined : ret
}

export const tokenSwitch = (check: Token): Token => tokenReducer(check);