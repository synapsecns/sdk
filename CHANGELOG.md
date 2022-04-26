# Changelog and Release notes (v0.95.1)

## What's new?

### Liquidity Pools

- Optimism Stableswap pool ([9f2b8fe](https://github.com/synapsecns/sdk/commits/9f2b8fe0486838080e51cb5c83b99c144bd7ad5f), [99bcd8a](https://github.com/synapsecns/sdk/commits/99bcd8a14f4781d5aa01fe86904040a44e24b193))
- Harmony AVAX swap pool ([70a91b0](https://github.com/synapsecns/sdk/commits/70a91b0aa3ab672caa368a791bf2cf7bab5b3dd6))
- Harmony JEWEL swap pool ([84c1418](https://github.com/synapsecns/sdk/commits/84c1418f652b80562b993663b0d9a3464569f736))
- Cronos nUSD swap pool ([5101623](https://github.com/synapsecns/sdk/commits/5101623f52770651fa729a328ea7a84ccca64221))

### Chains

- DeFi Kingdoms (first implemented in #99)

### Tokens

- synAVAX, synJEWEL, Gas JEWEL, xJEWEL, Wrapped JEWEL ([808373a](https://github.com/synapsecns/sdk/commits/808373aaee2fbb916abfd29c698b3d9d5fdfa9de), [b5be8ba](https://github.com/synapsecns/sdk/commits/b5be8bae7b1bea6cbc9eb257b9003b16410ca461))
- USDC on DeFi Kingdoms mainnet ([ec92185](https://github.com/synapsecns/sdk/commits/ec92185afe6201bd45060c2f872494661228cb83))
- MultiChain AVAX ([ce38787](https://github.com/synapsecns/sdk/commits/ce3878760cec74c7d64655fc775945c89f8fde12))
- MultiChain JEWEL ([b75aa73](https://github.com/synapsecns/sdk/commits/b75aa75a84842a2626103ce00355b8fd046f98c3))
- USD Balance (USDB) ([8354607](https://github.com/synapsecns/sdk/commits/835460717f9934fceea8bfc6277d61d2d31946b1))
- Vesta (VSTA) ([5101623](https://github.com/synapsecns/sdk/commits/5101623f52770651fa729a328ea7a84ccca64221))

### New addresses for existing tokens

- Cronos
  - nUSD, DAI, USDC, USDT ([5101623](https://github.com/synapsecns/sdk/commits/5101623f52770651fa729a328ea7a84ccca64221))
- Optimism
  -  nUSD, USDC ([99bcd8a](https://github.com/synapsecns/sdk/commits/99bcd8a14f4781d5aa01fe86904040a44e24b193))

### Features, functions, fixes, and more

- ci
  - GPG-signing of release tarballs for GitHub releases ([be124af](https://github.com/synapsecns/sdk/commits/be124af66cbb4b59f47402171a92f08765310896))
  - Implement GitHub actions workflow for developement/alpha/beta release publishing ([c3e864c](https://github.com/synapsecns/sdk/commits/c3e864cfce2a04f1975f123b5be2475c8cabecc1))
  - Change `"target"` field of `tsconfig.json` to `"ES5"`, enabling greater backwards-compatibility with older NodeJS versions and various build systems ([2ac1627](https://github.com/synapsecns/sdk/commits/2ac162786504680bdd0d284397b01945bd0553be))
- bridge
  - Implement `checkBridgeTransactionComplete` in `SynapseBridge` namespace, enabling basic checking of bridge transaction status ([b444b15](https://github.com/synapsecns/sdk/commits/b444b1589f49f09ea4f7379f2f59d48839538b55))
  - Implement AvaxJewelMigration contract and "bridging" ([11b3834](https://github.com/synapsecns/sdk/commits/11b38347237a2098ec7360ec034b61ce58b1f644))
  - Implement class wrapper for BridgeConfigV3. It makes life easier ([d2d2003](https://github.com/synapsecns/sdk/commits/d2d200389c53d8928dbd852afd1705423231870e))
- common/networks
  - Add `bridgeableTokens` getter function to `Network` class ([179d702](https://github.com/synapsecns/sdk/commits/179d702df7633cebdfe31205ca8e8207b9673fc4))
- tokenswap
  - Implement functions for adding and removing liquidity from Liquidity Pools -- `addLiquidity`, `calculateAddLiquidity`, `removeLiquidity`, `calculateRemoveLiquidity`, `removeLiquidityOneToken`, `calculateRemoveLiquidityOneToken` ([6e230fd](https://github.com/synapsecns/sdk/commits/6e230fdce84ed039b5a1ee228c28f5125fd0473c), [57e6fdb](https://github.com/synapsecns/sdk/commits/57e6fdb68783f9c2cb186b5050268f6e7101637d), [caa4b5d](https://github.com/synapsecns/sdk/commits/caa4b5d6f05638cf711757155e0f68fadbb665a6))
  - Filter out wrapped gas tokens from `detailedTokenSwapMap()` result ([8b9c696](https://github.com/synapsecns/sdk/commits/8b9c696f6f7900d223485a0d33c856b7a9b6546f))
  - Refactor `UnsupportedSwapError` type into an extension of inbuilt `Error` type ([cc645f5](https://github.com/synapsecns/sdk/commits/cc645f56de62fa5cb56c8bfd8b38955d91887588))
- entities
  - implement connection "cacheing" (more like reuse) for connections to contracts such as `SynapseBridge`, `L2BridgeZap`, etc. ([7359c56](https://github.com/synapsecns/sdk/commits/7359c56e63822942ee1d4dfafc22d8373ddf9f10))
- tokens
  - Add `gasTokenForChain` function to `Tokens` namespace, which returns the native currency token object for the passed Chain ID -- if it exists. ([7d9b47d](https://github.com/synapsecns/sdk/commits/7d9b47d6f5f1c02ed4b2dd59529c77115228ff44))

- chainid
  - Implement function for checking if a (known) Chain ID supports EIP-1559 ([5aa1535](https://github.com/synapsecns/sdk/commits/5aa1535e0221e28662306a7e6440a49a82ec152d))

- common/gasoptions
  - Implement setup enabling SDK consumers to provide their own gas limits/fees/prices to various transaction builders/executors ([83377e8](https://github.com/synapsecns/sdk/commits/83377e8d74d78a07ce473edc54296d90006c1915))

### Refactors

- common/chainid, internal/swaptype
  - Refactor type of `ChainId` and `SwapType` from enum to `const object` using `as const` syntax, enabling better control of inputs, parameters, and types. ([3094359](https://github.com/synapsecns/sdk/commits/30943592bf29f1d9d790cd80b3a7c5a14ce8f8d4), [2afa767](https://github.com/synapsecns/sdk/commits/2afa767fce5c76e072973b43d21906f9cdf382a2)) 
