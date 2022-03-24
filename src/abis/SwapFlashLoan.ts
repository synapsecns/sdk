const ABI = {
  "abi": [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "provider",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "tokenAmounts",
          "type": "uint256[]"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "fees",
          "type": "uint256[]"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "invariant",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "lpTokenSupply",
          "type": "uint256"
        }
      ],
      "name": "AddLiquidity",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "tokenIndex",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountFee",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "protocolFee",
          "type": "uint256"
        }
      ],
      "name": "FlashLoan",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newAdminFee",
          "type": "uint256"
        }
      ],
      "name": "NewAdminFee",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newSwapFee",
          "type": "uint256"
        }
      ],
      "name": "NewSwapFee",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Paused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldA",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newA",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "initialTime",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "futureTime",
          "type": "uint256"
        }
      ],
      "name": "RampA",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "provider",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "tokenAmounts",
          "type": "uint256[]"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "lpTokenSupply",
          "type": "uint256"
        }
      ],
      "name": "RemoveLiquidity",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "provider",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "tokenAmounts",
          "type": "uint256[]"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "fees",
          "type": "uint256[]"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "invariant",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "lpTokenSupply",
          "type": "uint256"
        }
      ],
      "name": "RemoveLiquidityImbalance",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "provider",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "lpTokenAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "lpTokenSupply",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "boughtId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "tokensBought",
          "type": "uint256"
        }
      ],
      "name": "RemoveLiquidityOne",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "currentA",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "time",
          "type": "uint256"
        }
      ],
      "name": "StopRampA",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "tokensSold",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "tokensBought",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint128",
          "name": "soldId",
          "type": "uint128"
        },
        {
          "indexed": false,
          "internalType": "uint128",
          "name": "boughtId",
          "type": "uint128"
        }
      ],
      "name": "TokenSwap",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Unpaused",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "MAX_BPS",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "minToMint",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "addLiquidity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "calculateRemoveLiquidity",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "tokenIndex",
          "type": "uint8"
        }
      ],
      "name": "calculateRemoveLiquidityOneToken",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "availableTokenAmount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "tokenIndexFrom",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "tokenIndexTo",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "dx",
          "type": "uint256"
        }
      ],
      "name": "calculateSwap",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        },
        {
          "internalType": "bool",
          "name": "deposit",
          "type": "bool"
        }
      ],
      "name": "calculateTokenAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        },
        {
          "internalType": "contract IERC20",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "params",
          "type": "bytes"
        }
      ],
      "name": "flashLoan",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "flashLoanFeeBPS",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getA",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAPrecise",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getAdminBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "index",
          "type": "uint8"
        }
      ],
      "name": "getToken",
      "outputs": [
        {
          "internalType": "contract IERC20",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "index",
          "type": "uint8"
        }
      ],
      "name": "getTokenBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "tokenAddress",
          "type": "address"
        }
      ],
      "name": "getTokenIndex",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getVirtualPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract IERC20[]",
          "name": "_pooledTokens",
          "type": "address[]"
        },
        {
          "internalType": "uint8[]",
          "name": "decimals",
          "type": "uint8[]"
        },
        {
          "internalType": "string",
          "name": "lpTokenName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "lpTokenSymbol",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_a",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_fee",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_adminFee",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "lpTokenTargetAddress",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "protocolFeeShareBPS",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "futureA",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "futureTime",
          "type": "uint256"
        }
      ],
      "name": "rampA",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "minAmounts",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "removeLiquidity",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "maxBurnAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "removeLiquidityImbalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "tokenIndex",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "minAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "removeLiquidityOneToken",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newAdminFee",
          "type": "uint256"
        }
      ],
      "name": "setAdminFee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newFlashLoanFeeBPS",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "newProtocolFeeShareBPS",
          "type": "uint256"
        }
      ],
      "name": "setFlashLoanFees",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newSwapFee",
          "type": "uint256"
        }
      ],
      "name": "setSwapFee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "stopRampA",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "tokenIndexFrom",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "tokenIndexTo",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "dx",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minDy",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "swap",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "swapStorage",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "initialA",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "futureA",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "initialATime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "futureATime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "swapFee",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "adminFee",
          "type": "uint256"
        },
        {
          "internalType": "contract LPToken",
          "name": "lpToken",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unpause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdrawAdminFees",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  "devdoc": {
    "details": "Most of the logic is stored as a library `SwapUtils` for the sake of reducing contract's deployment size.",
    "kind": "dev",
    "methods": {
      "addLiquidity(uint256[],uint256,uint256)": {
        "params": {
          "amounts": "the amounts of each token to add, in their native precision",
          "deadline": "latest timestamp to accept this transaction",
          "minToMint": "the minimum LP tokens adding this amount of liquidity should mint, otherwise revert. Handy for front-running mitigation"
        },
        "returns": {
          "_0": "amount of LP token user minted and received"
        }
      },
      "calculateRemoveLiquidity(uint256)": {
        "params": {
          "amount": "the amount of LP tokens that would be burned on withdrawal"
        },
        "returns": {
          "_0": "array of token balances that the user will receive"
        }
      },
      "calculateRemoveLiquidityOneToken(uint256,uint8)": {
        "params": {
          "tokenAmount": "the amount of LP token to burn",
          "tokenIndex": "index of which token will be withdrawn"
        },
        "returns": {
          "availableTokenAmount": "calculated amount of underlying token available to withdraw"
        }
      },
      "calculateSwap(uint8,uint8,uint256)": {
        "params": {
          "dx": "the amount of tokens the user wants to sell. If the token charges a fee on transfers, use the amount that gets transferred after the fee.",
          "tokenIndexFrom": "the token the user wants to sell",
          "tokenIndexTo": "the token the user wants to buy"
        },
        "returns": {
          "_0": "amount of tokens the user will receive"
        }
      },
      "calculateTokenAmount(uint256[],bool)": {
        "details": "This shouldn't be used outside frontends for user estimates.",
        "params": {
          "amounts": "an array of token amounts to deposit or withdrawal, corresponding to pooledTokens. The amount should be in each pooled token's native precision. If a token charges a fee on transfers, use the amount that gets transferred after the fee.",
          "deposit": "whether this is a deposit or a withdrawal"
        },
        "returns": {
          "_0": "token amount the user will receive"
        }
      },
      "flashLoan(address,address,uint256,bytes)": {
        "params": {
          "amount": "the total amount to borrow in this transaction",
          "params": "optional data to pass along to the callback function",
          "receiver": "the address of the receiver of the token. This address must implement the IFlashLoanReceiver interface and the callback function `executeOperation`.",
          "token": "the protocol fee in bps to be applied on the total flash loan fee"
        }
      },
      "getA()": {
        "details": "See the StableSwap paper for details",
        "returns": {
          "_0": "A parameter"
        }
      },
      "getAPrecise()": {
        "details": "See the StableSwap paper for details",
        "returns": {
          "_0": "A parameter in its raw precision form"
        }
      },
      "getAdminBalance(uint256)": {
        "params": {
          "index": "Index of the pooled token"
        },
        "returns": {
          "_0": "admin's token balance in the token's precision"
        }
      },
      "getToken(uint8)": {
        "params": {
          "index": "the index of the token"
        },
        "returns": {
          "_0": "address of the token at given index"
        }
      },
      "getTokenBalance(uint8)": {
        "params": {
          "index": "the index of the token"
        },
        "returns": {
          "_0": "current balance of the pooled token at given index with token's native precision"
        }
      },
      "getTokenIndex(address)": {
        "params": {
          "tokenAddress": "address of the token"
        },
        "returns": {
          "_0": "the index of the given token address"
        }
      },
      "getVirtualPrice()": {
        "returns": {
          "_0": "the virtual price, scaled to the POOL_PRECISION_DECIMALS"
        }
      },
      "initialize(address[],uint8[],string,string,uint256,uint256,uint256,address)": {
        "params": {
          "_a": "the amplification coefficient * n * (n - 1). See the StableSwap paper for details",
          "_adminFee": "default adminFee to be initialized with",
          "_fee": "default swap fee to be initialized with",
          "_pooledTokens": "an array of ERC20s this pool will accept",
          "decimals": "the decimals to use for each pooled token, eg 8 for WBTC. Cannot be larger than POOL_PRECISION_DECIMALS",
          "lpTokenName": "the long-form name of the token to be deployed",
          "lpTokenSymbol": "the short symbol for the token to be deployed",
          "lpTokenTargetAddress": "the address of an existing LPToken contract to use as a target"
        }
      },
      "owner()": {
        "details": "Returns the address of the current owner."
      },
      "paused()": {
        "details": "Returns true if the contract is paused, and false otherwise."
      },
      "rampA(uint256,uint256)": {
        "params": {
          "futureA": "the new A to ramp towards",
          "futureTime": "timestamp when the new A should be reached"
        }
      },
      "removeLiquidity(uint256,uint256[],uint256)": {
        "details": "Liquidity can always be removed, even when the pool is paused.",
        "params": {
          "amount": "the amount of LP tokens to burn",
          "deadline": "latest timestamp to accept this transaction",
          "minAmounts": "the minimum amounts of each token in the pool acceptable for this burn. Useful as a front-running mitigation"
        },
        "returns": {
          "_0": "amounts of tokens user received"
        }
      },
      "removeLiquidityImbalance(uint256[],uint256,uint256)": {
        "params": {
          "amounts": "how much of each token to withdraw",
          "deadline": "latest timestamp to accept this transaction",
          "maxBurnAmount": "the max LP token provider is willing to pay to remove liquidity. Useful as a front-running mitigation."
        },
        "returns": {
          "_0": "amount of LP tokens burned"
        }
      },
      "removeLiquidityOneToken(uint256,uint8,uint256,uint256)": {
        "params": {
          "deadline": "latest timestamp to accept this transaction",
          "minAmount": "the minimum amount to withdraw, otherwise revert",
          "tokenAmount": "the amount of the token you want to receive",
          "tokenIndex": "the index of the token you want to receive"
        },
        "returns": {
          "_0": "amount of chosen token user received"
        }
      },
      "renounceOwnership()": {
        "details": "Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner."
      },
      "setAdminFee(uint256)": {
        "params": {
          "newAdminFee": "new admin fee to be applied on future transactions"
        }
      },
      "setFlashLoanFees(uint256,uint256)": {
        "params": {
          "newFlashLoanFeeBPS": "the total fee in bps to be applied on future flash loans",
          "newProtocolFeeShareBPS": "the protocol fee in bps to be applied on the total flash loan fee"
        }
      },
      "setSwapFee(uint256)": {
        "params": {
          "newSwapFee": "new swap fee to be applied on future transactions"
        }
      },
      "swap(uint8,uint8,uint256,uint256,uint256)": {
        "params": {
          "deadline": "latest timestamp to accept this transaction",
          "dx": "the amount of tokens the user wants to swap from",
          "minDy": "the min amount the user would like to receive, or revert.",
          "tokenIndexFrom": "the token the user wants to swap from",
          "tokenIndexTo": "the token the user wants to swap to"
        }
      },
      "transferOwnership(address)": {
        "details": "Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner."
      }
    },
    "title": "Swap - A StableSwap implementation in solidity.",
    "version": 1
  },
  "userdoc": {
    "kind": "user",
    "methods": {
      "addLiquidity(uint256[],uint256,uint256)": {
        "notice": "Add liquidity to the pool with the given amounts of tokens"
      },
      "calculateRemoveLiquidity(uint256)": {
        "notice": "A simple method to calculate amount of each underlying tokens that is returned upon burning given amount of LP tokens"
      },
      "calculateRemoveLiquidityOneToken(uint256,uint8)": {
        "notice": "Calculate the amount of underlying token available to withdraw when withdrawing via only single token"
      },
      "calculateSwap(uint8,uint8,uint256)": {
        "notice": "Calculate amount of tokens you receive on swap"
      },
      "calculateTokenAmount(uint256[],bool)": {
        "notice": "A simple method to calculate prices from deposits or withdrawals, excluding fees but including slippage. This is helpful as an input into the various \"min\" parameters on calls to fight front-running"
      },
      "flashLoan(address,address,uint256,bytes)": {
        "notice": "Borrow the specified token from this pool for this transaction only. This function will call `IFlashLoanReceiver(receiver).executeOperation` and the `receiver` must return the full amount of the token and the associated fee by the end of the callback transaction. If the conditions are not met, this call is reverted."
      },
      "getA()": {
        "notice": "Return A, the amplification coefficient * n * (n - 1)"
      },
      "getAPrecise()": {
        "notice": "Return A in its raw precision form"
      },
      "getAdminBalance(uint256)": {
        "notice": "This function reads the accumulated amount of admin fees of the token with given index"
      },
      "getToken(uint8)": {
        "notice": "Return address of the pooled token at given index. Reverts if tokenIndex is out of range."
      },
      "getTokenBalance(uint8)": {
        "notice": "Return current balance of the pooled token at given index"
      },
      "getTokenIndex(address)": {
        "notice": "Return the index of the given token address. Reverts if no matching token is found."
      },
      "getVirtualPrice()": {
        "notice": "Get the virtual price, to help calculate profit"
      },
      "initialize(address[],uint8[],string,string,uint256,uint256,uint256,address)": {
        "notice": "Initializes this Swap contract with the given parameters. This will also clone a LPToken contract that represents users' LP positions. The owner of LPToken will be this contract - which means only this contract is allowed to mint/burn tokens."
      },
      "pause()": {
        "notice": "Pause the contract. Revert if already paused."
      },
      "rampA(uint256,uint256)": {
        "notice": "Start ramping up or down A parameter towards given futureA and futureTime Checks if the change is too rapid, and commits the new A value only when it falls under the limit range."
      },
      "removeLiquidity(uint256,uint256[],uint256)": {
        "notice": "Burn LP tokens to remove liquidity from the pool. Withdraw fee that decays linearly over period of 4 weeks since last deposit will apply."
      },
      "removeLiquidityImbalance(uint256[],uint256,uint256)": {
        "notice": "Remove liquidity from the pool, weighted differently than the pool's current balances. Withdraw fee that decays linearly over period of 4 weeks since last deposit will apply."
      },
      "removeLiquidityOneToken(uint256,uint8,uint256,uint256)": {
        "notice": "Remove liquidity from the pool all in one token. Withdraw fee that decays linearly over period of 4 weeks since last deposit will apply."
      },
      "setAdminFee(uint256)": {
        "notice": "Update the admin fee. Admin fee takes portion of the swap fee."
      },
      "setFlashLoanFees(uint256,uint256)": {
        "notice": "Updates the flash loan fee parameters. This function can only be called by the owner."
      },
      "setSwapFee(uint256)": {
        "notice": "Update the swap fee to be applied on swaps"
      },
      "stopRampA()": {
        "notice": "Stop ramping A immediately. Reverts if ramp A is already stopped."
      },
      "swap(uint8,uint8,uint256,uint256,uint256)": {
        "notice": "Swap two tokens using this pool"
      },
      "unpause()": {
        "notice": "Unpause the contract. Revert if already unpaused."
      },
      "withdrawAdminFees()": {
        "notice": "Withdraw all admin fees to the contract owner"
      }
    },
    "notice": "This contract is responsible for custody of closely pegged assets (eg. group of stablecoins) and automatic market making system. Users become an LP (Liquidity Provider) by depositing their tokens in desired ratios for an exchange of the pool token that represents their share of the pool. Users can burn pool tokens and withdraw their share of token(s). Each time a swap between the pooled tokens happens, a set fee incurs which effectively gets distributed to the LPs. In case of emergencies, admin can pause additional deposits, swaps, or single-asset withdraws - which stops the ratio of the tokens in the pool from changing. Users can always withdraw their tokens via multi-asset withdraws.",
    "version": 1
  }
}

export default ABI
