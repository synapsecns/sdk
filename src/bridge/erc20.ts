import {Signer} from "@ethersproject/abstract-signer";
import {Provider} from "@ethersproject/providers";
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import {PopulatedTransaction, ContractTransaction} from "@ethersproject/contracts";

import {ERC20Factory, ERC20Contract} from "../contracts";
import {newProviderForNetwork} from "../rpcproviders";

import {
    executePopulatedTransaction,
    rejectPromise,
} from "../common/utils";

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

            this.provider = newProviderForNetwork(this.chainId);
            this.instance = ERC20Factory.connect(this.address, this.provider);
        }

        approve = async (
            args:    ApproveArgs,
            signer:  Signer,
            dryRun?: boolean
        ): Promise<boolean|ContractTransaction> => {
            dryRun = dryRun ?? false;

            return dryRun
                ? this.instance.callStatic.approve(
                    args.spender,
                    args.amount ?? MAX_APPROVAL_AMOUNT,
                    {from: signer.getAddress()}
                )
                : executePopulatedTransaction(this.buildApproveTransaction(args), signer)
        }

        buildApproveTransaction = async (args: ApproveArgs): Promise<PopulatedTransaction> => {
            let {spender, amount} = args;
            amount = amount ?? MAX_APPROVAL_AMOUNT;

            return this.instance.populateTransaction.approve(spender, amount)
                .then((txn) => {
                    let {maxPriorityFee, gasPrice, approveGasLimit} = GasUtils.makeGasParams(this.chainId);

                    if (maxPriorityFee) {
                        txn.maxPriorityFeePerGas = maxPriorityFee;
                    }

                    if (gasPrice) {
                        txn.gasPrice = gasPrice;
                    }

                    if (approveGasLimit) {
                        txn.gasLimit = approveGasLimit;
                    }

                    return txn
                })
                .catch(rejectPromise)
        }

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