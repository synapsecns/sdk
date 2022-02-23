import {Signer} from "@ethersproject/abstract-signer";
import {Provider} from "@ethersproject/providers";
import {
    BigNumber,
    BigNumberish,
} from "@ethersproject/bignumber";
import type {
    PopulatedTransaction,
    ContractTransaction,
} from "@ethersproject/contracts";

import {
    ERC20Factory,
    ERC20Contract,
} from "@contracts";

import {rpcProviderForNetwork} from "@internal/rpcproviders";

import {
    executePopulatedTransaction,
    rejectPromise,
} from "@common/utils";

import {GasUtils} from "./gasutils";

export const MAX_APPROVAL_AMOUNT = BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");


export namespace ERC20 {
    export interface ApproveArgs {
        spender: string,
        amount?: BigNumberish
    }

    export interface ERC20TokenParams {
        tokenAddress: string,
        chainId:      number,
    }

    class ERC20 {
        readonly address: string;
        readonly chainId: number;
        private readonly provider: Provider;
        private readonly instance: ERC20Contract;

        constructor(args: ERC20TokenParams) {
            this.address = args.tokenAddress;
            this.chainId = args.chainId;

            this.provider = rpcProviderForNetwork(this.chainId);
            this.instance = ERC20Factory.connect(this.address, this.provider);
        }

        approve = async (
            args:    ApproveArgs,
            signer:  Signer,
            dryRun:  boolean=false
        ): Promise<boolean|ContractTransaction> =>
            dryRun
                ? this.instance.callStatic.approve(
                    args.spender,
                    args.amount ?? MAX_APPROVAL_AMOUNT,
                    {from: signer.getAddress()}
                )
                : executePopulatedTransaction(this.buildApproveTransaction(args), signer)

        buildApproveTransaction = async ({spender, amount=MAX_APPROVAL_AMOUNT}: ApproveArgs): Promise<PopulatedTransaction> =>
            this.instance.populateTransaction.approve(spender, amount)
                .then((txn) => GasUtils.populateGasParams(this.chainId, txn, "approve"))
                .catch(rejectPromise)

        balanceOf = async (
            address: string
        ): Promise<BigNumber> => this.instance.balanceOf(address)

        allowanceOf = async (
            owner: string,
            spender: string
        ): Promise<BigNumber> => this.instance.allowance(owner, spender)
    }

    export const approve = async (
        approveArgs: ApproveArgs,
        tokenParams: ERC20TokenParams,
        signer:      Signer,
        dryRun?:     boolean,
    ): Promise<boolean|ContractTransaction> => new ERC20(tokenParams).approve(approveArgs, signer, dryRun)

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