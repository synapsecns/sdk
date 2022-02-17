import "../helpers/chaisetup";

import {expect} from "chai";

import {Context, Done} from "mocha";

import _ from "lodash";

import {
    Tokens,
    ChainId,
} from "../../src";

import {SynapseContracts} from "../../src/common/synapse_contracts";

import {ERC20} from "../../src/bridge/erc20";

import {makeWalletSignerWithProvider} from "../helpers";

import {PopulatedTransaction} from "@ethersproject/contracts";
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";

const bridgeTestPrivkey: string = "53354287e3023f0629b7a5e187aa1ca3458c4b7ff9d66a6e3f4b2e821aafded7";

describe("ERC20 tests", function(this: Mocha.Suite) {
    const testAddr: string = "0xe972647539816442e0987817DF777a9fd9878650";

    const tokenParams = (c: number): ERC20.ERC20TokenParams => ({
        chainId:      c,
        tokenAddress: Tokens.NUSD.address(c),
    })

    describe("Approval tests", function(this: Mocha.Suite) {
        interface TestCase {
            chainId: number,
            address: string,
            amount?: BigNumberish
        }

        const testAmounts: string[] = [
            "420", "1337", "31337",
            "669", "250",  "555",
        ]

        let testCases: TestCase[] = [
            { chainId: ChainId.BSC,       address: SynapseContracts.BSC.bridge_zap.address       },
            { chainId: ChainId.ETH,       address: SynapseContracts.Ethereum.bridge_zap.address  },
            { chainId: ChainId.AVALANCHE, address: SynapseContracts.Avalanche.bridge_zap.address },
            { chainId: ChainId.BSC,       address: SynapseContracts.BSC.bridge_zap.address,       amount: _.shuffle(testAmounts)[0] },
            { chainId: ChainId.ETH,       address: SynapseContracts.Ethereum.bridge_zap.address,  amount: _.shuffle(testAmounts)[0] },
            { chainId: ChainId.AVALANCHE, address: SynapseContracts.Avalanche.bridge_zap.address, amount: _.shuffle(testAmounts)[0] },
        ]

        testCases.forEach(({chainId, address: spender, amount}) => {
            const wallet = makeWalletSignerWithProvider(chainId, bridgeTestPrivkey)
            const args: ERC20.ApproveArgs = {spender, amount};

            it("should build a transaction successfully", function(this: Context, done: Done) {
                this.timeout(5*1000);

                let prom: Promise<PopulatedTransaction> = ERC20.buildApproveTransaction(args, tokenParams(chainId));

                expect(prom).to
                    .eventually.be.fulfilled
                    .and.to.eventually.not.be.null
                    .notify(done);
            })

            it("should do an approve successfully", function(this: Context, done: Done) {
                this.timeout(5*1000);

                let prom: Promise<boolean> = Promise.resolve(
                    ERC20.approve(args, tokenParams(chainId), wallet, true).then((res: boolean) => res)
                );

                expect(prom).to
                    .eventually.be.true
                    .notify(done);
            })
        })
    })

    describe("Balance of test", function(this: Mocha.Suite) {
        it("should have an nUSD balance greater than zero", function(this: Context, done: Done) {
            this.timeout(5*1000);

            let prom: Promise<BigNumber> = ERC20.balanceOf(testAddr, tokenParams(ChainId.BSC))

            expect(prom).to.eventually.be.gt(0).notify(done);
        })
    })

    describe("allowanceOf test", function(this: Mocha.Suite) {
        it("synapsebridgezap should have an nUSD allowance gte zero", function(this: Context, done: Done) {
            this.timeout(5*1000);

            let prom: Promise<BigNumber> = ERC20.balanceOf(testAddr, tokenParams(ChainId.BSC))

            expect(prom).to.eventually.be.gte(0).notify(done);
        })
    })
})