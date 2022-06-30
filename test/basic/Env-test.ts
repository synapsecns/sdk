import path from "path";

import dotenv from "dotenv";
import * as fs from "fs";

import {expectEqual} from "@tests/helpers";

import {ChainId} from "@sdk";

const
    BASE_ENV_PATH: string = path.resolve(path.join("./", ".env")),
    TEST_ENV_PATH: string = path.resolve(path.join("./", "test", "basic", "test_env.env"));

describe('Test ENV values', function(this: Mocha.Suite) {
    this.afterAll("reset env", function(this: Mocha.Context) {
        dotenv.config({path: BASE_ENV_PATH});
    })


    describe("Test setting URIs from ENV", function(this: Mocha.Suite) {
        const valPrefix: string = "carl_";

        function loadTestEnv(): void {
            let envData = fs.readFileSync(TEST_ENV_PATH);
            let parsedEnv = dotenv.parse(envData);
            for (const [k, v] of Object.entries(parsedEnv)) {
                process.env[`${k}`] = `${v}`;
            }
        }

        type testCase = [number, string, string];
        const testCases: testCase[] = [
            [ChainId.AVALANCHE, "AVALANCHE", "AVALANCHE_RPC_URI"],
            [ChainId.MOONRIVER, "MOONRIVER", "MOONRIVER_RPC_URI"],
            [ChainId.ETH,       "ETH",       "ETH_RPC_URI"],
        ];

        testCases.forEach((tc: testCase) => {
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
            );
        });
    });
});