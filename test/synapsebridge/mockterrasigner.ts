import {GenericSigner, Resolveable} from "@sdk/common/types";
import {BlockTxBroadcastResult, isTxError, MsgExecuteContract, Tx, TxError, Wallet} from "@terra-money/terra.js";
import {terraRpcProvider} from "@internal";
import {rejectPromise} from "@common/utils";

export class MockTerraSignerWrapper implements GenericSigner {
    private _terraWallet: Wallet;
    private readonly _wantFail: boolean;

    constructor(terraWallet: Wallet, wantSuccess: boolean) {
        this._terraWallet = terraWallet;
        this._wantFail = !wantSuccess;
    }

    getAddress(): Promise<string> {
        return Promise.resolve(this._terraWallet.key.accAddress)
    }

    async sendTransaction(msg: Resolveable<MsgExecuteContract>): Promise<BlockTxBroadcastResult> {
        let resolvedMsg = await msg;
        let signedTx = await this.makeSignedTransaction(resolvedMsg);

        return terraRpcProvider().tx.broadcast(signedTx)
            .then(res => {
                if (isTxError(res)) {
                    return this._wantFail ? rejectPromise((res as TxError)) : res
                }

                return res
            })
            .catch((err): Promise<BlockTxBroadcastResult> =>
                this._wantFail ? rejectPromise(err) : null
            )
    }

    private async makeSignedTransaction(...messages: MsgExecuteContract[]): Promise<Tx> {
        let msgs: MsgExecuteContract[] = messages.map(msg => {
            if (!msg.sender) {
                msg.sender = this._terraWallet.key.accAddress;
            }

            return msg
        })

        return this._terraWallet.createTx({msgs})
    }
}