import {expect} from "chai";

import {
    Tokens,
    ChainId,
} from "@sdk";

import {
    balanceOf,
    allowanceOf,
    buildApproveTransaction, approve
} from "@sdk/bridge/erc20";

import type {
    TokenParams,
    ApproveArgs
} from "@sdk/bridge/erc20";

import {SynapseContracts} from "@sdk/common/synapse_contracts";

import {
    DEFAULT_TEST_TIMEOUT,
    getTestAmount,
    expectFulfilled,
    expectGteZero,
    expectNotZero,
    expectNull,
} from "@tests/helpers";

import type {BigNumberish}         from "@ethersproject/bignumber";
import type {ContractTransaction, PopulatedTransaction} from "@ethersproject/contracts";
import {Wallet} from "@ethersproject/wallet";
import {rpcProviderForChain} from "@internal/rpcproviders";

describe("ERC20 tests", function(this: Mocha.Suite) {
    const testAddr: string = "0xe972647539816442e0987817DF777a9fd9878650";
    const fakePrivateKey: string = "0x8ab0e165c2ea461b01cdd49aec882d179dccdbdb5c85c3f9c94c448aa65c5ace"

    const tokenParams = (c: number): TokenParams => ({
        chainId:      c,
        tokenAddress: Tokens.NUSD.address(c),
    });

    describe("Approval tests", function(this: Mocha.Suite) {
        interface TestCase {
            chainId: number;
            address: string;
            amount?: BigNumberish;
        }

        function makeTestCase(chainId: ChainId, amount?: BigNumberish): TestCase {
            return {
                chainId,
                amount,
                address: SynapseContracts.contractsForChainId(chainId).bridgeZapAddress,
            }
        }

        let testCases: TestCase[] = [
            makeTestCase(ChainId.BSC),
            makeTestCase(ChainId.ETH),
            makeTestCase(ChainId.AVALANCHE),
            makeTestCase(ChainId.BSC,       getTestAmount(Tokens.NUSD, ChainId.BSC)),
            makeTestCase(ChainId.ETH,       getTestAmount(Tokens.NUSD, ChainId.ETH)),
            makeTestCase(ChainId.AVALANCHE, getTestAmount(Tokens.NUSD, ChainId.AVALANCHE)),
        ];

        testCases.forEach(tc => {
            let {chainId, address: spender, amount} = tc;

            const args: ApproveArgs = {spender, amount};

            it("should build a transaction successfully", async function(this: Mocha.Context) {
                this.timeout(DEFAULT_TEST_TIMEOUT);

                let prom: Promise<PopulatedTransaction> = buildApproveTransaction(args, tokenParams(chainId));

                try {
                    return expectNull(await prom, false)
                } catch (e) {
                    return (await expectFulfilled(prom))
                }
            });

            function makeWallet(chainId: number): Wallet {
                return new Wallet(fakePrivateKey, rpcProviderForChain(chainId))
            }

            it("Should fail to fire approve() successfully", async function(this: Mocha.Context) {
                this.timeout(DEFAULT_TEST_TIMEOUT);

                const fakeWallet = makeWallet(chainId);

                let prom: Promise<ContractTransaction> = approve(args, tokenParams(chainId), fakeWallet);

                return (await expect(prom).to.eventually.be.rejected)
            });
        });
    });

    describe("Balance of test", function(this: Mocha.Suite) {
        it("should have an nUSD balance greater than zero", async function(this: Mocha.Context) {
            this.timeout(DEFAULT_TEST_TIMEOUT);

            return expectNotZero(await balanceOf(testAddr, tokenParams(ChainId.BSC)))
        });
    });

    describe("allowanceOf test", function(this: Mocha.Suite) {
        it("synapsebridgezap should have an nUSD allowance gte zero", async function(this: Mocha.Context) {
            this.timeout(DEFAULT_TEST_TIMEOUT);

            return expectGteZero(await allowanceOf(
                testAddr,
                SynapseContracts.contractsForChainId(ChainId.BSC).bridgeZapAddress,
                tokenParams(ChainId.BSC)
            ))
        });
    });
});