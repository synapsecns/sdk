import {Signer} from "@ethersproject/abstract-signer";
import type {TransactionResponse} from "@ethersproject/abstract-provider";
import {
    BigNumber,
    type BigNumberish,
} from "@ethersproject/bignumber";
import type {
    PopulatedTransaction,
    ContractTransaction,
} from "@ethersproject/contracts";

import {
    ERC20Factory,
    ERC20Contract,
} from "@contracts";

import {rpcProviderForChain} from "@internal/rpcproviders";

import {
    executePopulatedTransaction,
    rejectPromise
} from "@common/utils";

import {StaticCallResult} from "@common/types";
import type {SignerOrProvider} from "@common/types";

import {GasUtils} from "./gasutils";

export const MAX_APPROVAL_AMOUNT = BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");


export namespace ERC20 {
    export type ApproveArgs = {
        spender: string,
        amount?: BigNumberish
    }

    export type ERC20TokenParams = {
        tokenAddress: string,
        chainId:      number,
    }

    class ERC20 {
        readonly address: string;
        readonly chainId: number;
        // private readonly provider: Provider;
        private readonly instance: ERC20Contract;

        constructor(args: ERC20TokenParams) {
            this.address = args.tokenAddress;
            this.chainId = args.chainId;

            this.instance = ERC20Factory.connect(this.address, null);
        }

        private connectContract(provider?: SignerOrProvider): ERC20Contract {
            provider = provider ? provider : rpcProviderForChain(this.chainId);

            return this.instance.connect(provider);
        }

        async approve(
            args:       ApproveArgs,
            signer:     Signer,
            callStatic: boolean=false
        ): Promise<ContractTransaction|StaticCallResult> {
            const contract = this.connectContract(signer);

            if (callStatic) {
                return contract
                    .callStatic
                    .approve(args.spender, args.amount ?? MAX_APPROVAL_AMOUNT)
                    .then(res => res ? StaticCallResult.Success : StaticCallResult.Failure)
                    .catch(() => StaticCallResult.Failure)
            }

            let approveTxn = await this._buildApproveTransaction(args, contract);

            return executePopulatedTransaction(approveTxn, signer)
        }

        async buildApproveTransaction(
            args:      ApproveArgs,
            provider?: SignerOrProvider
        ): Promise<PopulatedTransaction> {
            const contract = this.connectContract(provider);

            return this._buildApproveTransaction(args, contract)
        }

        private async _buildApproveTransaction(
            args:     ApproveArgs,
            contract: ERC20Contract
        ): Promise<PopulatedTransaction> {
            const {spender, amount=MAX_APPROVAL_AMOUNT} = args;

            return contract
                .populateTransaction
                .approve(spender, amount)
                .then(txn => {
                    return GasUtils.populateGasParams(
                        this.chainId,
                        txn,
                        "approve"
                    )
                })
                .catch(rejectPromise)
        }

        balanceOf = async (
            address: string
        ): Promise<BigNumber> => this.connectContract().balanceOf(address)

        allowanceOf = async (
            owner: string,
            spender: string
        ): Promise<BigNumber> => this.connectContract().allowance(owner, spender)
    }

    export async function approve(
        approveArgs: ApproveArgs,
        tokenParams: ERC20TokenParams,
        signer:      Signer,
        callStatic?: boolean,
    ): Promise<TransactionResponse|StaticCallResult> {
        let erc20 = new ERC20(tokenParams);

        return erc20.approve(approveArgs, signer, callStatic)
    }

    export const buildApproveTransaction = async (
        approveArgs: ApproveArgs,
        tokenParams: ERC20TokenParams
    ): Promise<PopulatedTransaction> => new ERC20(tokenParams).buildApproveTransaction(approveArgs)

    export const balanceOf = async (
        address:     string,
        tokenParams: ERC20TokenParams
    ): Promise<BigNumber> => new ERC20(tokenParams).balanceOf(address)

    export const allowanceOf = async (
        owner:       string,
        spender:     string,
        tokenParams: ERC20TokenParams
    ): Promise<BigNumber> => new ERC20(tokenParams).allowanceOf(owner, spender)
}