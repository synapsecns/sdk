import { QUERY_EXPECTED_OUTPUTS } from './expected_outputs.js';
import { expect } from "chai";
import { getBridgeTxnInfo } from '@sdk/explorer/index.js';

describe("Explorer tests", function(this: Mocha.Suite) {
    describe("Query tests", function(this: Mocha.Suite) {
        interface TestCase {
            index: number; // to keep track of which QUERY_EXPECTED_OUTPUTS we are expecting
            chainId?: number;
            address?: string;
            txnHash?: string;
            kappa?: string;
        }

        const testCases: TestCase[] = [
            {
                index: 0,
                kappa: "0x5f102aacb2bb0f900df542e7d736c186de3838c762eb0a953e6f0a834243da5b",
            }
        ];

        testCases.forEach(async (tc: TestCase) => {
            const query_result = await getBridgeTxnInfo(tc.chainId, tc.address, tc.txnHash, tc.kappa);
            it("Query test case " + tc.index, function(this: Mocha.Context) {
                if(query_result == QUERY_EXPECTED_OUTPUTS[tc.index]) {
                    console.log(`Test case ${tc.index} passed`);
                }
            });
        });
    })
})
