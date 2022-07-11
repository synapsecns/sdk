import { expect } from "chai";
import { getBridgeTxnInfo } from "@sdk/explorer/index.js";

describe("Explorer tests", function (this: Mocha.Suite) {
  it("Query tests", async () => {
    interface TestCase {
      expected: JSON; // the expected JSON output
      chainId?: number;
      address?: string;
      txnHash?: string;
      kappa?: string;
    }

    const testCases: TestCase[] = [
      {
        expected: JSON.parse(
          '{"data":{"bridgeTransactions":[{"kappa":"0x5f102aacb2bb0f900df542e7d736c186de3838c762eb0a953e6f0a834243da5b","toInfo":{"txnHash":"0x90031dfcf2d5bb98d0df6c43cf0241701fd08b94c74d958168ed8aa5a5b24f4a","chainId":42161,"value":"580205100363451049","USDValue":637.59058613517,"formattedValue":0.5802051003634511,"time":1656623480},"fromInfo":{"txnHash":"0x44bc91e3cb5d6694a169b661a714cef9dc9ae0e6973ad4371d22701de20592fc","chainId":1,"value":"585000000000000000","USDValue":642.8597278021624,"formattedValue":0.585,"time":1656623433}}]}}'
        ),

        kappa:
          "0x5f102aacb2bb0f900df542e7d736c186de3838c762eb0a953e6f0a834243da5b",
      },
      {
        expected: JSON.parse(
          '{"data":{"bridgeTransactions":[{"kappa":"0x5f102aacb2bb0f900df542e7d736c186de3838c762eb0a953e6f0a834243da5b","toInfo":{"txnHash":"0x90031dfcf2d5bb98d0df6c43cf0241701fd08b94c74d958168ed8aa5a5b24f4a","chainId":42161,"value":"580205100363451049","USDValue":637.59058613517,"formattedValue":0.5802051003634511,"time":1656623480},"fromInfo":{"txnHash":"0x44bc91e3cb5d6694a169b661a714cef9dc9ae0e6973ad4371d22701de20592fc","chainId":1,"value":"585000000000000000","USDValue":642.8597278021624,"formattedValue":0.585,"time":1656623433}}]}}'
        ),

        chainId: 42161,
        kappa:
          "0x5f102aacb2bb0f900df542e7d736c186de3838c762eb0a953e6f0a834243da5b",
      },
      {
        expected: JSON.parse('{"data":{"bridgeTransactions":[]}}'),

        chainId: 10,
        kappa:
          "0x5f102aacb2bb0f900df542e7d736c186de3838c762eb0a953e6f0a834243da5b",
      },
      {
        expected: JSON.parse(
          '{"data":{"bridgeTransactions":[{"kappa":"0x5f102aacb2bb0f900df542e7d736c186de3838c762eb0a953e6f0a834243da5b","toInfo":{"txnHash":"0x90031dfcf2d5bb98d0df6c43cf0241701fd08b94c74d958168ed8aa5a5b24f4a","chainId":42161,"value":"580205100363451049","USDValue":637.59058613517,"formattedValue":0.5802051003634511,"time":1656623480},"fromInfo":{"txnHash":"0x44bc91e3cb5d6694a169b661a714cef9dc9ae0e6973ad4371d22701de20592fc","chainId":1,"value":"585000000000000000","USDValue":642.8597278021624,"formattedValue":0.585,"time":1656623433}}]}}'
        ),

        chainId: 1,
        txnHash:
          "0x44bc91e3cb5d6694a169b661a714cef9dc9ae0e6973ad4371d22701de20592fc",
        kappa:
          "0x5f102aacb2bb0f900df542e7d736c186de3838c762eb0a953e6f0a834243da5b",
      },
      {
        expected: JSON.parse('{"data":{"bridgeTransactions":[]}}'),
        
        chainId: 1,
        txnHash: "0xabcdefghijklmnopqrstuvwxyz1234567890",
        kappa:
          "0x5f102aacb2bb0f900df542e7d736c186de3838c762eb0a953e6f0a834243da5b",
      },
    ];

    testCases.forEach(async (tc: TestCase) => {
      const query_result = await getBridgeTxnInfo(tc);
      it("Query test case", function (this: Mocha.Context) {
        expect(query_result).to.equal(tc.expected);
      });
    });
  });
});
