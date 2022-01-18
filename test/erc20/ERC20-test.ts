import "../helpers/chaisetup";

import {expect} from "chai";

import {Context, Done} from "mocha";

import {
    Tokens,
    ChainId,
} from "../../src";

import {SynapseContracts} from "../../src/common";

import {ERC20} from "../../src/bridge/erc20";

import {PopulatedTransaction} from "@ethersproject/contracts";
import {BigNumber} from "ethers";


describe("ERC20 tests", function(this: Mocha.Suite) {
    const testAddr: string = "0xe972647539816442e0987817DF777a9fd9878650";

    const tokenParams = (c: number): ERC20.ERC20TokenParams => ({
        chainId:      c,
        tokenAddress: Tokens.NUSD.address(c),
    })

    describe("Build approve transaction", function(this: Mocha.Suite) {
        interface TestCase {
            chainId: number,
            address: string
        }

        let testCases: TestCase[] = [
            { chainId: ChainId.BSC,       address: SynapseContracts.BSC.bridge_zap.address },
            { chainId: ChainId.ETH,       address: SynapseContracts.Ethereum.bridge_zap.address },
            { chainId: ChainId.AVALANCHE, address: SynapseContracts.Avalanche.bridge_zap.address },
        ]

        testCases.forEach(({chainId, address}) => {
            const args: ERC20.ApproveArgs = {
                spender: address,
            }

            it("should build a transaction successfully", function(this: Context, done: Done) {
                let prom: Promise<PopulatedTransaction> = ERC20.buildApproveTransaction(args, tokenParams(chainId));

                expect(prom).to
                    .eventually.be.fulfilled
                    .and.to.eventually.not.be.null
                    .notify(done);
            })
        })
    })

    describe("Balance of test", function(this: Mocha.Suite) {
        it("should have an nUSD balance greater than zero", function(this: Context, done: Done) {
            let prom: Promise<BigNumber> = ERC20.balanceOf(testAddr, tokenParams(ChainId.BSC))

            expect(prom).to.eventually.be.gt(0).notify(done);
        })
    })

    describe("allowanceOf test", function(this: Mocha.Suite) {
        it("synapsebridgezap should have an nUSD allowance gte zero", function(this: Context, done: Done) {
            let prom: Promise<BigNumber> = ERC20.balanceOf(testAddr, tokenParams(ChainId.BSC))

            expect(prom).to.eventually.be.gte(0).notify(done);
        })
    })
})