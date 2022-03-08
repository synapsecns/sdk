import bech32 from "bech32";

import {find} from "lodash-es";

import type {Token} from "@token";
import {Tokens} from "@tokens";

function tokenReducer(check: Token): Token {
    const ret: Token = find(Tokens.AllTokens, (t => check.isEqual(t)));

    return !ret ? undefined : ret
}

export const tokenSwitch = (check: Token): Token => tokenReducer(check);


/**
 * terra address validation, it verify also the bech32 checksum
 * @param {string} address
 */
export function validateTerraAddress(address: string): boolean {
    try {
        const { prefix: decodedPrefix } = bech32.decode(address); // throw error if checksum is invalid
        // verify address prefix

        return decodedPrefix === "terra"
    } catch {
        // invalid checksum
        return false
    }
}