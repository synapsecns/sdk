import "../helpers/chaisetup";
import path from "path";

import dotenv from "dotenv";
import {ChainId} from "../../src";
import * as fs from "fs";

import {
    wrapExpect,
    expectEqual,
} from "../helpers";

const
    BASE_ENV_PATH: string = path.resolve(path.join("./", ".env")),
    TEST_ENV_PATH: string = path.resolve(path.join("./", "test", "basic", "test_env.env"));

describe('Test ENV values', function(this: Mocha.Suite) {
    this.afterAll("reset env", function(this: Mocha.Context) {
        dotenv.config({path: BASE_ENV_PATH});
    })


    describe("Test setting URIs from ENV", function(this: Mocha.Suite) {
        const valPrefix: string = "carl_";

        type testCase = [number, string, string];
        const testCases: testCase[] = [
            [ChainId.AVALANCHE, "AVALANCHE", "AVALANCHE_RPC_URI"],
            [ChainId.MOONRIVER, "MOONRIVER", "MOONRIVER_RPC_URI"],
            [ChainId.ETH,       "ETH",       "ETH_RPC_URI"],
        ];

        function loadTestEnv(): void {
            let envData = fs.readFileSync(TEST_ENV_PATH);
            let parsedEnv = dotenv.parse(envData, {debug: true});
            for (const [k, v] of Object.entries(parsedEnv)) {
                process.env[`${k}`] = `${v}`;
            }
        }

        for (const tc of testCases) {
            const
                [chainId, name, envKey] = tc,
                expectedVal: string = `${valPrefix}${name}`,
                testTitle:   string = `rpc uri for chainId ${chainId} should be ${expectedVal}`;


            it(
                testTitle,
            function(this: Mocha.Context) {
                    loadTestEnv();
                    const gotVal: string = process.env[envKey];
                    expectEqual(gotVal, expectedVal);
                }
            )
        }
    })
})