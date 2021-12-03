import {expect} from "chai";
import {before, Done} from "mocha";

import {
    ChainId,
    Networks,
} from "../../src";

describe("Basic tests", function(this: Mocha.Suite) {
    describe("Check networks", function(this: Mocha.Suite) {
        const
            supportedChains   = ChainId.supportedChainIds(),
            supportedNetworks = Networks.supportedNetworks();

        it("supportedChainIds should return 9 chains", () => expect(supportedChains).to.have.a.lengthOf(9))

        it("supportedNetworks should return 9 networks", () => expect(supportedNetworks).to.have.a.lengthOf(9))
    })
})