import { QUERY_EXPECTED_OUTPUTS } from "./expected_outputs.js";
import { expect } from "chai";
import { getBridgeTxnInfo } from "@sdk/explorer/index.js";

describe("Explorer tests", function (this: Mocha.Suite) {
  it("Query tests", async () => {
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
        kappa:
          "0x5f102aacb2bb0f900df542e7d736c186de3838c762eb0a953e6f0a834243da5b",
      },
      {
        index: 1,
        chainId: 42161,
        kappa:
          "0x5f102aacb2bb0f900df542e7d736c186de3838c762eb0a953e6f0a834243da5b",
      },
      {
        index: 2,
        chainId: 10,
        kappa:
          "0x5f102aacb2bb0f900df542e7d736c186de3838c762eb0a953e6f0a834243da5b",
      },
      {
        index: 3,
        chainId: 1,
        txnHash:
          "0x44bc91e3cb5d6694a169b661a714cef9dc9ae0e6973ad4371d22701de20592fc",
        kappa:
          "0x5f102aacb2bb0f900df542e7d736c186de3838c762eb0a953e6f0a834243da5b",
      },
      {
        index: 4,
        chainId: 1,
        txnHash: "0xabcdefghijklmnopqrstuvwxyz1234567890",
        kappa:
          "0x5f102aacb2bb0f900df542e7d736c186de3838c762eb0a953e6f0a834243da5b",
      },
    ];

    testCases.forEach(async (tc: TestCase) => {
      const query_result = await getBridgeTxnInfo(tc);
      it("Query test case " + tc.index, function (this: Mocha.Context) {
        expect(query_result).to.equal(QUERY_EXPECTED_OUTPUTS[tc.index]);
      });
    });
  });
});

