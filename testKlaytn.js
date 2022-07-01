import {ChainId, SynapseBridge} from "./dist/index.js";
import { Tokens } from "./dist/tokens.js";
import { BigNumber } from "ethers";

let bridge = new SynapseBridge({
    network: ChainId.ETH,
});

let res = await bridge.buildBridgeTokenTransaction({
    tokenFrom: Tokens.USDC,
    tokenTo: Tokens.USDC,
    chainIdTo: ChainId.KLAYTN,
    amountFrom: BigNumber.from(1),
    amountTo: BigNumber.from(0) ,
    addressTo: "0x8190d120eff630d8E000E7526e5553fcb9EE714e"
});

console.log(res.data);