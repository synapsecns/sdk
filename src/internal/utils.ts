import bech32 from "bech32";

import {find} from "lodash-es";

import type {Token} from "@token";
import {Tokens} from "@tokens";

import {
    type Tx,
    type Wallet,
    type MsgExecuteContract,
    type SyncTxBroadcastResult
} from "@terra-money/terra.js";

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

export class TerraSignerWrapper {
    private _terraWallet: Wallet;

    constructor(terraWallet: Wallet) {
        this._terraWallet = terraWallet;
    }

    getAddress(): Promise<string> {
        return Promise.resolve(this._terraWallet.key.accAddress)
    }

    sendTransaction(...messages: MsgExecuteContract[]): Promise<SyncTxBroadcastResult> {
        return this.makeSignedTransaction(...messages)
            .then(tx => this._terraWallet.lcd.tx.broadcastSync(tx))
    }

    private makeSignedTransaction(...messages: MsgExecuteContract[]): Promise<Tx> {
        return this._terraWallet.createAndSignTx({msgs: messages})
    }
}