import {parseUnits} from "@ethersproject/units";
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

import {ChainId} from "../common";


export const
    ETH_MAX_PRIORITY_FEE   = parseUnits("1.5", "gwei"),
    BOBA_GAS_PRICE         = parseUnits("10", "gwei"),
    BOBA_APPROVE_GAS_LIMIT = BigNumber.from(60000),
    MAX_APPROVAL_AMOUNT    = BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");


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
            args: ApproveArgs,
            signer: Signer
        ): Promise<ContractTransaction> => executePopulatedTransaction(this.buildApproveTransaction(args), signer)


        buildApproveTransaction = async (args: ApproveArgs): Promise<PopulatedTransaction> => {
            let {spender, amount} = args;
            amount = amount ?? MAX_APPROVAL_AMOUNT;

            return this.instance.populateTransaction.approve(spender, amount)
                .then((txn) => {
                    switch (this.chainId) {
                        case ChainId.ETH:
                            txn.maxPriorityFeePerGas = ETH_MAX_PRIORITY_FEE;
                            break;
                        case ChainId.BOBA:
                            txn.gasLimit = BOBA_APPROVE_GAS_LIMIT;
                            txn.gasPrice = BOBA_GAS_PRICE;
                            break;
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
        signer:      Signer
    ): Promise<ContractTransaction> => new ERC20(tokenParams).approve(approveArgs, signer)

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