import _ from "lodash";

import type {Token} from "../token";
import {Tokens} from "../tokens";

function tokenReducer(check: Token): Token {
    const ret: Token = _.find(Tokens.AllTokens, (t => check.isEqual(t)));

    if (!ret) {
        return undefined
    }

    return ret
}

export const tokenSwitch = (check: Token): Token => tokenReducer(check);