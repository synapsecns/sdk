import _ from "lodash";

import type {Token} from "@token";
import {Tokens} from "@tokens";

function tokenReducer(check: Token): Token {
    const ret: Token = _.find(Tokens.AllTokens, (t => check.isEqual(t)));

    return !ret ? undefined : ret
}

export const tokenSwitch = (check: Token): Token => tokenReducer(check);