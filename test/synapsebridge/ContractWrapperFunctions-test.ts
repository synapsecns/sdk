import dotenv from "dotenv";

import {expect} from "chai";
import {step}   from "mocha-steps";

import {
    Tokens,
    Bridge,
    ChainId,
    Networks,
    supportedChainIds,
    type Token
} from "@sdk";

import {ERC20}               from "@sdk/bridge/erc20";
import {contractAddressFor}  from "@sdk/common/utils";
import {rpcProviderForChain} from "@sdk/internal/rpcproviders";

import {
    DEFAULT_TEST_TIMEOUT,
    EXECUTORS_TEST_TIMEOUT,
    expectBnEqual,
    expectEqual,
    expectFulfilled,
    getActualWei,
    wrapExpectAsync
} from "@tests/helpers";

import {infiniteApprovalsPrivkey} from "./bridge_test_utils";

import {parseUnits}               from "@ethersproject/units";
import {Wallet}                   from "@ethersproject/wallet";
import {BigNumber}                from "@ethersproject/bignumber";
import type {Provider}            from "@ethersproject/providers";
import type {BigNumberish}        from "@ethersproject/bignumber";
import type {ContractTransaction} from "@ethersproject/contracts";

import {
    Zero,
    MaxUint256,
} from "@ethersproject/constants";


describe("SynapseBridge - Contract Wrapper Functions tests", function(this: Mocha.Suite) {
    const ALL_CHAIN_IDS = supportedChainIds();

    describe(".bridgeVersion()", function(this: Mocha.Suite) {
        const expected = 6;

        ALL_CHAIN_IDS.forEach(network => {
            const
                provider          = rpcProviderForChain(network),
                bridgeInstance    = new Bridge.SynapseBridge({ network, provider}),
                testTitle: string = `Should return ${expected.toString()} on Chain ID ${network}`;

            it(testTitle, async function(this: Mocha.Context) {
                this.timeout(DEFAULT_TEST_TIMEOUT);
                let prom = bridgeInstance.bridgeVersion();
                return wrapExpectAsync(expectBnEqual(await prom, expected), prom)
            });
        });
    });

    describe(".WETH_ADDRESS", function(this: Mocha.Suite) {
        ALL_CHAIN_IDS.forEach(network => {
            const
                provider = rpcProviderForChain(network),
                bridgeInstance = new Bridge.SynapseBridge({ network, provider }),
                expected: string = ((): string => {
                    switch (network) {
                        case ChainId.ETH:
                            return "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
                        case ChainId.OPTIMISM:
                            return "0x121ab82b49B2BC4c7901CA46B8277962b4350204"
                        case ChainId.BOBA:
                            return "0xd203De32170130082896b4111eDF825a4774c18E"
                        case ChainId.ARBITRUM:
                            return "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
                        case ChainId.AVALANCHE:
                            return "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"
                        case ChainId.DFK:
                            return "0xCCb93dABD71c8Dad03Fc4CE5559dC3D89F67a260"
                        default:
                            return "0x0000000000000000000000000000000000000000"
                    }})(),
                testTitle: string = `Should return ${expected} for Chain ID ${network}`;

            it(testTitle, async function(this: Mocha.Context) {
                this.timeout(DEFAULT_TEST_TIMEOUT);
                let prom = bridgeInstance.WETH_ADDRESS();
                return wrapExpectAsync(expectEqual(await prom, expected), prom)
            });
        });
    });

    describe(".getAllowanceForAddress", function(this: Mocha.Suite) {
        interface TestCase {
            provider:   Provider;
            chainId:    number;
            address:    string;
            token:      Token;
            want:       BigNumber;
            isInfinite: boolean;
        }

        const
            addr1: string = "0x7145a092158c215ff10cce4ddcb84b3a090bdd4e",
            // addr2: string = "0x41fe2231639268f01383b86cc8b64fbf24b5e156",
            addr3: string = "0x89a2a295174d899c6d68dfc03535993ee15ff72e",
            addr4: string = "0x39c46cFD4711d1B4D7141d87f057C89C9D2d7019",
            addr5: string = "0xDF681Fe10B2fb7B5605107098EA3867187851DCe",
            infiniteCheckAmt: BigNumber = MaxUint256.div(2);

        const makeTestCase = (c: number, t: Token, a: string, n: BigNumberish): TestCase => {
            return {
                provider:   rpcProviderForChain(c),
                chainId:    c,
                token:      t,
                address:    a,
                want:       BigNumber.from(n),
                isInfinite: MaxUint256.eq(n),
            }
        }

        function runTestCase(tc: TestCase) {
            const
                {provider, chainId: network} = tc,
                chainName: string = Networks.fromChainId(network).name,
                wantNum:   string = parseUnits(tc.want.toString(), tc.token.decimals(network)).toString();

            const
                spendAllowanceTitle: string = `should have a spend allowance of ${tc.isInfinite ? "unlimited" : wantNum} wei`,
                title:               string = `SynapseBridge on chain ${chainName} ${spendAllowanceTitle} for ${tc.token.name} holdings of ${tc.address}`;

            it(title, async function (this: Mocha.Context) {
                this.timeout(DEFAULT_TEST_TIMEOUT);

                let bridgeInstance = new Bridge.SynapseBridge({network, provider});

                const
                    {address, token} = tc,
                    decimals = token.decimals(network),
                    checkAmt: BigNumber = tc.isInfinite ? infiniteCheckAmt : tc.want;

                let prom = bridgeInstance
                    .getAllowanceForAddress({address, token})
                    .then(res => getActualWei(res, decimals));

                try {
                    const res = await prom;
                    return tc.isInfinite
                        ? expect(res).to.be.gte(checkAmt)
                        : expect(res).to.be.eq(checkAmt)
                } catch (err) {
                    return (await expectFulfilled(prom))
                }
            });
        }

        describe("- infinite approval", function(this: Mocha.Suite) {
            step("Ensure infinite approval test address has infinite approval", async function(this: Mocha.Context) {
                this.timeout(EXECUTORS_TEST_TIMEOUT);

                dotenv.config();

                const bscZapAddr: string = contractAddressFor(ChainId.BSC, "bridgeZapAddress");
                const tokenParams = {tokenAddress: Tokens.BUSD.address(ChainId.BSC), chainId: ChainId.BSC};

                try {
                    const allowance = await ERC20.allowanceOf(
                        infiniteApprovalsPrivkey.address,
                        bscZapAddr,
                        tokenParams
                    );

                    if (allowance.lte(infiniteCheckAmt)) {
                        const wallet = new Wallet(
                            infiniteApprovalsPrivkey.privkey,
                            rpcProviderForChain(ChainId.BSC)
                        );

                        const approveArgs = {spender: bscZapAddr};

                        let txn: ContractTransaction = (await ERC20.approve(
                            approveArgs,
                            tokenParams,
                            wallet
                        )) as ContractTransaction;

                        await txn.wait(1);

                        const newAllowance = await ERC20.allowanceOf(
                            infiniteApprovalsPrivkey.address,
                            bscZapAddr,
                            tokenParams
                        );

                        expect(newAllowance).to.be.gte(infiniteCheckAmt);
                    }

                    return
                } catch (err) {
                    const e: Error = err instanceof Error ? err : new Error(err);
                    expect(e.message).to.eq("");
                }
            });

            runTestCase(makeTestCase(
                ChainId.BSC,
                Tokens.BUSD,
                infiniteApprovalsPrivkey.address,
                MaxUint256
            ));
        });

        describe("- zero approval", function(this: Mocha.Suite) {
            [
                makeTestCase(ChainId.AURORA,    Tokens.DAI,  addr4, Zero),
                makeTestCase(ChainId.BOBA,      Tokens.NUSD, addr3, Zero),
                makeTestCase(ChainId.MOONRIVER, Tokens.SYN,  addr1, Zero),
                makeTestCase(ChainId.HARMONY,   Tokens.NUSD, addr5, Zero),
            ].forEach(runTestCase);
        });
    });

    describe("REQUIRED_CONFS tests", function(this: Mocha.Suite) {
        interface TC {
            chainId: number;
            want:    number | null;
        }

        const testCases: TC[] = [
            {chainId: ChainId.METIS,  want: 6},
            {chainId: ChainId.AURORA, want: 5},
            {chainId: 43113,          want: null}
        ];

        testCases.forEach(tc => {
           const testTitle: string = `getRequiredConfirmationsForBridge(${tc.chainId}) should return ${tc.want ? `'${tc.want}'` : 'null'}`;

           it(testTitle, function(this: Mocha.Context) {
               const got = Bridge.getRequiredConfirmationsForBridge(tc.chainId);

               if (tc.want !== null) {
                   expect(got).to.equal(tc.want);
               } else {
                   expect(got).to.be.null;
               }
           });
        });
    });

    describe("checkBridgeTransactionComplete tests", function(this: Mocha.Suite) {
       interface TestCase {
           chainIdTo:                number;
           transactionHashChainFrom: string;
           want:                     boolean;
       }

       const testCases: TestCase[] = [
           {chainIdTo: ChainId.AURORA, transactionHashChainFrom: "0x77a776395f347c313efcb660e50e3ea45846b80d90fa19f33f8b53a42cc46fb4", want: true},
           {chainIdTo: ChainId.BSC,    transactionHashChainFrom: "0x53da6395da3a7f7efba5581387466de06983be8806978416441ba8202600684e", want: false},
           {chainIdTo: ChainId.DFK,    transactionHashChainFrom: "0xeb449f8f890b20d42448fbf5b8542d7afc4e0c6a51a25e6b278475c6ad087d96", want: true}
       ];

       testCases.forEach(tc => {
          const testTitle: string = `Bridge transaction ${tc.transactionHashChainFrom} ${tc.want ? 'should' : 'should NOT'} be marked completed on Chain ID ${tc.chainIdTo}`;

          it(testTitle, async function(this: Mocha.Context) {
              this.timeout(5.5 * 1000);
              this.slow(2 * 1000);

              const got = await Bridge.checkBridgeTransactionComplete(tc);

              if (tc.want) {
                  return expect(got).to.be.true
              } else {
                  return expect(got).to.be.false
              }
          });
       });
    });
});