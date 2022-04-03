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

import type {SignerOrProvider} from "@common/types";

import {GasUtils} from "./gasutils";

export const MAX_APPROVAL_AMOUNT = BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");


export namespace ERC20 {
    export type ApproveArgs = {
        spender: string;
        amount?: BigNumberish;
    }

    export type ERC20TokenParams = {
        tokenAddress: string;
        chainId:      number;
    }

    class ERC20 {
        readonly address: string;
        readonly chainId: number;
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

        async approve(args: ApproveArgs, signer: Signer,
        ): Promise<ContractTransaction> {
            const
                contract   = this.connectContract(signer),
                approveTxn = this._buildApproveTransaction(args, contract);

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

        async balanceOf(
            address: string
        ): Promise<BigNumber> {
            return this.connectContract().balanceOf(address)
        }

        async allowanceOf(
            owner: string,
            spender: string
        ): Promise<BigNumber> {
            return this.connectContract().allowance(owner, spender)
        }
    }

    export async function approve(
        approveArgs: ApproveArgs,
        tokenParams: ERC20TokenParams,
        signer:      Signer
    ): Promise<TransactionResponse> {
        return new ERC20(tokenParams).approve(approveArgs, signer)
    }

    export async function buildApproveTransaction(
        approveArgs: ApproveArgs,
        tokenParams: ERC20TokenParams
    ): Promise<PopulatedTransaction> {
        return new ERC20(tokenParams).buildApproveTransaction(approveArgs)
    }

    export async function balanceOf(
        address:     string,
        tokenParams: ERC20TokenParams
    ): Promise<BigNumber> {
        return new ERC20(tokenParams).balanceOf(address)
    }

    export async function allowanceOf(
        owner:       string,
        spender:     string,
        tokenParams: ERC20TokenParams
    ): Promise<BigNumber> {
        return new ERC20(tokenParams).allowanceOf(owner, spender)
    }
}