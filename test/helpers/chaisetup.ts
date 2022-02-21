import {waffleChai} from "@ethereum-waffle/chai"
import chaiAsPromised from "chai-as-promised";
import chaiThings from "chai-things";

import chai from "chai";

chai.should();
chai.use(chaiThings);
chai.use(waffleChai);
chai.use(chaiAsPromised);

process.on("unhandledRejection", () => {
    // Do nothing; we test these all the time.
});
process.on("rejectionHandled", () => {
    // Do nothing; we test these all the time.
});

export default chai.expect;