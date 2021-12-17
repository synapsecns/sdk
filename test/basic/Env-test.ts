import path from "path";

import {expect} from "chai";
import {before, Done} from "mocha";

import dotenv from "dotenv";
import {ChainId} from "../../src";

const TEST_ENV_PATH: string = path.join("./", "test", "basic", "test_env.env");

describe('Test ENV values', function(this: Mocha.Suite) {
    describe("Test RPC URIs from ENV", function(this: Mocha.Suite) {
        describe("Test setting URIs from ENV", function(this: Mocha.Suite) {
            const valPrefix: string = "carl_";

            dotenv.config({path: TEST_ENV_PATH});

            type testCase = [number, string, string];
            const testCases: testCase[] = [
                [ChainId.AVALANCHE, "AVALANCHE", "AVALANCHE_RPC_URI"],
                [ChainId.MOONRIVER, "MOONRIVER", "MOONRIVER_RPC_URI"],
                [ChainId.ETH, "ETH", "ETH_RPC_URI"],
            ];

            testCases.forEach((tc) => {
                let [chainId, name, envKey] = tc;
                let expectedVal = `${valPrefix}${name}`
                it(`rpc uri for chainId ${chainId} should be ${expectedVal}`, () => {
                    expect(process.env[envKey]).to.equal(expectedVal);
                })
            })
        })
    })
})