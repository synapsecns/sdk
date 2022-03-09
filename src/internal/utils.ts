import bech32 from "bech32";

import {find} from "lodash-es";

import type {Token} from "@token";
import {Tokens} from "@tokens";

import {
    type Tx,
    type Wallet,
    type MsgExecuteContract,
    type BlockTxBroadcastResult
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

    sendTransaction(...messages: MsgExecuteContract[]): Promise<BlockTxBroadcastResult> {
        return this.makeSignedTransaction(...messages)
            .then(tx => this._terraWallet.lcd.tx.broadcast(tx))
    }

    private async makeSignedTransaction(...messages: MsgExecuteContract[]): Promise<Tx> {
        const {accountNumber, sequence} = await this.accountData();

        let msgs: MsgExecuteContract[] = messages.map(msg => {
            if (!msg.sender) {
                msg.sender = this._terraWallet.key.accAddress;
            }

            return msg
        })

        return this._terraWallet.createAndSignTx({msgs, accountNumber, sequence})
    }

    /**
     * returns the wallet's account number and sequence
     * @private
     */
    private accountData(): Promise<{accountNumber: number, sequence: number}> {
        return this._terraWallet.accountNumberAndSequence()
            .then(({account_number, sequence}) => ({accountNumber: account_number, sequence}))
    }

    private accountNumber(): Promise<number> {
        return this._terraWallet.accountNumber()
    }
}