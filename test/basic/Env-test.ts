import path from "path";

import {expect} from "chai";
import {before, Done, test} from "mocha";

import dotenv from "dotenv";
import {ChainId} from "../../src";
import * as fs from "fs";

const TEST_ENV_PATH: string = path.join("./", "test", "basic", "test_env.env");

describe('Test ENV values', function(this: Mocha.Suite) {
    describe("Test RPC URIs from ENV", function(this: Mocha.Suite) {
        describe("Test setting URIs from ENV", function(this: Mocha.Suite) {
            const valPrefix: string = "carl_";

            type testCase = [number, string, string];
            const testCases: testCase[] = [
                [ChainId.AVALANCHE, "AVALANCHE", "AVALANCHE_RPC_URI"],
                [ChainId.MOONRIVER, "MOONRIVER", "MOONRIVER_RPC_URI"],
                [ChainId.ETH,       "ETH",       "ETH_RPC_URI"],
            ];

            let envBackup: {[s: string]: string} = {}

            before("backup env", function(this: Mocha.Context) {
                testCases.forEach((tc: testCase) => envBackup[tc[2]] = process.env[tc[2]])

                let testEnvConfig = dotenv.parse(fs.readFileSync(TEST_ENV_PATH));
                Object.keys(testEnvConfig).forEach((k: string) => {
                    process.env[k] = testEnvConfig[k];
                })
            })

            after(function(this: Mocha.Context) {
                testCases.forEach((tc: testCase) => process.env[tc[2]] = envBackup[tc[2]])
            })

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