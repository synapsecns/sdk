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
- MultiChain JEWEL ([b75aa75](https://github.com/synapsecns/sdk/commits/b75aa75a84842a2626103ce00355b8fd046f98c3))
- USD Balance (USDB) ([8354607](https://github.com/synapsecns/sdk/commits/835460717f9934fceea8bfc6277d61d2d31946b1))
- Vesta (VSTA) ([5101623](https://github.com/synapsecns/sdk/commits/5101623f52770651fa729a328ea7a84ccca64221))
- Gaia's Tears ([4d30ee5](https://github.com/synapsecns/sdk/commits/4d30ee5b7f8c967d6b368176d4d859c55ef19a8c))
- H20 ([7575ae7](https://github.com/synapsecns/sdk/commits/7575ae7faf0375d706cd7adfa76e490a2b0c6455))

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
  - Coverage now ignores typegen code in `internal/gen` ([5af24cc](https://github.com/synapsecns/sdk/commits/5af24cca8b4d8c2ee745e0c30b92d038055d2126))
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
- token
  - Add `hash` property to `Token` interface. `hash` is unique to an individual Token instance and can be used for uniqueness checks. Closes #111 ([28846fc](https://github.com/synapsecns/sdk/commits/28846fc6db39bb0cba1a0009d7f9cbac880261f5))
  - Add `coingeckoId` property to `Token` interface. `coingeckoId` is an optional property which contains the CoinGecko ID of a token, if it is known. Closes #120 ([2e1c976](https://github.com/synapsecns/sdk/commits/2e1c976965dace74f1dd9c74090acdc2581c0bee))

- chainid
  - Implement function for checking if a (known) Chain ID supports EIP-1559 ([5aa1535](https://github.com/synapsecns/sdk/commits/5aa1535e0221e28662306a7e6440a49a82ec152d))

- networks
  - Add `supportsEIP1559` property to `Networks` class. This property is a boolean reflecting whether a network supports EIP-1559 ([067b75d](https://github.com/synapsecns/sdk/commits/067b75de765265f435507512a58a0b57792df8e4))
  - Add `chainCurrencyCoingeckoId` property to `Network` class. For chains whose chain currencies have CoinGecko ids, this property provides that id.

- common/gasoptions
  - Implement setup enabling SDK consumers to provide their own gas limits/fees/prices to various transaction builders/executors ([83377e8](https://github.com/synapsecns/sdk/commits/83377e8d74d78a07ce473edc54296d90006c1915))

### Refactors

- common/chainid, internal/swaptype
  - Refactor type of `ChainId` and `SwapType` from enum to `const object` using `as const` syntax, enabling better control of inputs, parameters, and types. ([3094359](https://github.com/synapsecns/sdk/commits/30943592bf29f1d9d790cd80b3a7c5a14ce8f8d4), [2afa767](https://github.com/synapsecns/sdk/commits/2afa767fce5c76e072973b43d21906f9cdf382a2)) 

### Testing improvements

Thank you @BlazeWasHere for adding several new test cases to the test suites:
  - Better random value generation ([37cd132](https://github.com/synapsecns/sdk/commits/37cd1322fe4f5b6e7fb3ee78690086885e1c4dd9))
  - Improved valueToWei testing ([00ab02e](https://github.com/synapsecns/sdk/commits/00ab02e516f90363a214f721ba8c125f5eb5e00b))
  - Extra testing for Cronos ([4ae4cba](https://github.com/synapsecns/sdk/commits/4ae4cba6ee02176f338cf8b3657e8129019b7fa4))
  - `Tokens.TokenFromSymbol` test cases ([82d395d](https://github.com/synapsecns/sdk/commits/82d395df7f19286bbcc5c05e054a1338997ef1b8))
  - Liquidity amounts map tests ([7da69b7](https://github.com/synapsecns/sdk/commits/7da69b71fd6a1ca88a2f816e3d281d16b1fbdc02))

Additionally, more test cases for various smaller parts have been implemented.
