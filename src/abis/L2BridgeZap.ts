const ABI = {
  "abi": [
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "_wethAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_swapOne",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tokenOne",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_swapTwo",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tokenTwo",
          "type": "address"
        },
        {
          "internalType": "contract ISynapseBridge",
          "name": "_synapseBridge",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "WETH_ADDRESS",
      "outputs": [
        {
          "internalType": "address payable",
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
          "internalType": "contract IERC20",
          "name": "token",
          "type": "address"
        },
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
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
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
        }
      ],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "depositETH",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
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
        }
      ],
      "name": "redeem",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
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
          "internalType": "uint8",
          "name": "liqTokenIndex",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "liqMinAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "liqDeadline",
          "type": "uint256"
        }
      ],
      "name": "redeemAndRemove",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
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
          "name": "minDy",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "redeemAndSwap",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "internalType": "contract IERC20",
          "name": "token",
          "type": "address"
        },
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
      "name": "swapAndRedeem",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "internalType": "contract IERC20",
          "name": "token",
          "type": "address"
        },
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
        },
        {
          "internalType": "uint8",
          "name": "liqTokenIndex",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "liqMinAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "liqDeadline",
          "type": "uint256"
        }
      ],
      "name": "swapAndRedeemAndRemove",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "internalType": "contract IERC20",
          "name": "token",
          "type": "address"
        },
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
        },
        {
          "internalType": "uint8",
          "name": "swapTokenIndexFrom",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "swapTokenIndexTo",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "swapMinDy",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "swapDeadline",
          "type": "uint256"
        }
      ],
      "name": "swapAndRedeemAndSwap",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "internalType": "contract IERC20",
          "name": "token",
          "type": "address"
        },
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
      "name": "swapETHAndRedeem",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "internalType": "contract IERC20",
          "name": "token",
          "type": "address"
        },
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
        },
        {
          "internalType": "uint8",
          "name": "swapTokenIndexFrom",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "swapTokenIndexTo",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "swapMinDy",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "swapDeadline",
          "type": "uint256"
        }
      ],
      "name": "swapETHAndRedeemAndSwap",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "swapMap",
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
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "swapTokensMap",
      "outputs": [
        {
          "internalType": "contract IERC20",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  "devdoc": {
    "kind": "dev",
    "methods": {
      "calculateSwap(address,uint8,uint8,uint256)": {
        "params": {
          "dx": "the amount of tokens the user wants to sell. If the token charges a fee on transfers, use the amount that gets transferred after the fee.",
          "tokenIndexFrom": "the token the user wants to sell",
          "tokenIndexTo": "the token the user wants to buy"
        },
        "returns": {
          "_0": "amount of tokens the user will receive"
        }
      },
      "deposit(address,uint256,address,uint256)": {
        "params": {
          "amount": "Amount in native token decimals to transfer cross-chain pre-fees*",
          "chainId": "which underlying chain to bridge assets onto",
          "to": "address on other chain to redeem underlying assets to",
          "token": "ERC20 compatible token to deposit into the bridge"
        }
      },
      "depositETH(address,uint256,uint256)": {
        "params": {
          "amount": "Amount in native token decimals to transfer cross-chain pre-fees*",
          "chainId": "which chain to bridge assets onto",
          "to": "address on other chain to bridge assets to"
        }
      },
      "redeem(address,uint256,address,uint256)": {
        "params": {
          "amount": "Amount in native token decimals to transfer cross-chain pre-fees*",
          "chainId": "which underlying chain to bridge assets onto",
          "to": "address on other chain to redeem underlying assets to",
          "token": "ERC20 compatible token to deposit into the bridge"
        }
      },
      "redeemAndRemove(address,uint256,address,uint256,uint8,uint256,uint256)": {
        "params": {
          "amount": "Amount of (typically) LP token to pass to the nodes to attempt to removeLiquidity() with to redeem for the underlying assets of the LP token",
          "chainId": "which underlying chain to bridge assets onto",
          "liqDeadline": "Specificies the deadline that the nodes are allowed to try to redeem/swap the LP token*",
          "liqMinAmount": "Specifies the minimum amount of the underlying asset needed for the nodes to execute the redeem/swap",
          "liqTokenIndex": "Specifies which of the underlying LP assets the nodes should attempt to redeem for",
          "to": "address on other chain to redeem underlying assets to",
          "token": "ERC20 compatible token to deposit into the bridge"
        }
      },
      "redeemAndSwap(address,uint256,address,uint256,uint8,uint8,uint256,uint256)": {
        "params": {
          "amount": "Amount in native token decimals to transfer cross-chain pre-fees",
          "chainId": "which underlying chain to bridge assets onto",
          "deadline": "latest timestamp to accept this transaction*",
          "minDy": "the min amount the user would like to receive, or revert to only minting the SynERC20 token crosschain.",
          "to": "address on other chain to redeem underlying assets to",
          "token": "ERC20 compatible token to deposit into the bridge",
          "tokenIndexFrom": "the token the user wants to swap from",
          "tokenIndexTo": "the token the user wants to swap to"
        }
      }
    },
    "version": 1
  },
  "userdoc": {
    "kind": "user",
    "methods": {
      "calculateSwap(address,uint8,uint8,uint256)": {
        "notice": "Calculate amount of tokens you receive on swap"
      },
      "deposit(address,uint256,address,uint256)": {
        "notice": "wraps SynapseBridge redeem()"
      },
      "depositETH(address,uint256,uint256)": {
        "notice": "Wraps SynapseBridge deposit() function to make it compatible w/ ETH -> WETH conversions"
      },
      "redeem(address,uint256,address,uint256)": {
        "notice": "wraps SynapseBridge redeem()"
      },
      "redeemAndRemove(address,uint256,address,uint256,uint8,uint256,uint256)": {
        "notice": "Wraps redeemAndRemove on SynapseBridge Relays to nodes that (typically) a wrapped synAsset ERC20 token has been burned and the underlying needs to be redeeemed on the native chain. This function indicates to the nodes that they should attempt to redeem the LP token for the underlying assets (E.g \"swap\" out of the LP token)"
      },
      "redeemAndSwap(address,uint256,address,uint256,uint8,uint8,uint256,uint256)": {
        "notice": "Wraps redeemAndSwap on SynapseBridge.sol Relays to nodes that (typically) a wrapped synAsset ERC20 token has been burned and the underlying needs to be redeeemed on the native chain. This function indicates to the nodes that they should attempt to redeem the LP token for the underlying assets (E.g \"swap\" out of the LP token)"
      }
    },
    "version": 1
  }
}

export default ABI
