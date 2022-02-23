const ABI = {
  "abi": [
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
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "previousAdminRole",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "newAdminRole",
          "type": "bytes32"
        }
      ],
      "name": "RoleAdminChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleGranted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleRevoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "contract IERC20",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TokenDeposit",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "contract IERC20",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "tokenIndexFrom",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "tokenIndexTo",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "minDy",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "TokenDepositAndSwap",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "contract IERC20Mintable",
          "name": "token",
          "type": "address"
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
          "name": "fee",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "kappa",
          "type": "bytes32"
        }
      ],
      "name": "TokenMint",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "contract IERC20Mintable",
          "name": "token",
          "type": "address"
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
          "name": "fee",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "tokenIndexFrom",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "tokenIndexTo",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "minDy",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "swapSuccess",
          "type": "bool"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "kappa",
          "type": "bytes32"
        }
      ],
      "name": "TokenMintAndSwap",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "contract IERC20",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TokenRedeem",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "contract IERC20",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "swapTokenIndex",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "swapMinAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "swapDeadline",
          "type": "uint256"
        }
      ],
      "name": "TokenRedeemAndRemove",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "contract IERC20",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "tokenIndexFrom",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "tokenIndexTo",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "minDy",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "TokenRedeemAndSwap",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "to",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "contract IERC20",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TokenRedeemV2",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "contract IERC20",
          "name": "token",
          "type": "address"
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
          "name": "fee",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "kappa",
          "type": "bytes32"
        }
      ],
      "name": "TokenWithdraw",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "contract IERC20",
          "name": "token",
          "type": "address"
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
          "name": "fee",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "swapTokenIndex",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "swapMinAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "swapDeadline",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "swapSuccess",
          "type": "bool"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "kappa",
          "type": "bytes32"
        }
      ],
      "name": "TokenWithdrawAndRemove",
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
      "name": "DEFAULT_ADMIN_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "GOVERNANCE_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "NODEGROUP_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
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
          "internalType": "bytes32[]",
          "name": "kappas",
          "type": "bytes32[]"
        }
      ],
      "name": "addKappas",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "bridgeVersion",
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
      "name": "chainGasAmount",
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
      "name": "depositAndSwap",
      "outputs": [],
      "stateMutability": "nonpayable",
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
      "name": "getFeeBalance",
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
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        }
      ],
      "name": "getRoleAdmin",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getRoleMember",
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
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        }
      ],
      "name": "getRoleMemberCount",
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
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "grantRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "hasRole",
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
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "kappa",
          "type": "bytes32"
        }
      ],
      "name": "kappaExists",
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
      "inputs": [
        {
          "internalType": "address payable",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "contract IERC20Mintable",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "fee",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "kappa",
          "type": "bytes32"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "contract IERC20Mintable",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "fee",
          "type": "uint256"
        },
        {
          "internalType": "contract ISwap",
          "name": "pool",
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
          "name": "minDy",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "kappa",
          "type": "bytes32"
        }
      ],
      "name": "mintAndSwap",
      "outputs": [],
      "stateMutability": "nonpayable",
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
          "internalType": "contract ERC20Burnable",
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
          "internalType": "contract ERC20Burnable",
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
          "name": "swapTokenIndex",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "swapMinAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "swapDeadline",
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
          "internalType": "contract ERC20Burnable",
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
          "internalType": "bytes32",
          "name": "to",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "internalType": "contract ERC20Burnable",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "redeemV2",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "renounceRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "revokeRole",
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
        }
      ],
      "name": "setChainGasAmount",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "_wethAddress",
          "type": "address"
        }
      ],
      "name": "setWethAddress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "startBlockNumber",
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
      "name": "unpause",
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
          "internalType": "uint256",
          "name": "fee",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "kappa",
          "type": "bytes32"
        }
      ],
      "name": "withdraw",
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
          "internalType": "uint256",
          "name": "fee",
          "type": "uint256"
        },
        {
          "internalType": "contract ISwap",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "uint8",
          "name": "swapTokenIndex",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "swapMinAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "swapDeadline",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "kappa",
          "type": "bytes32"
        }
      ],
      "name": "withdrawAndRemove",
      "outputs": [],
      "stateMutability": "nonpayable",
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
          "internalType": "address",
          "name": "to",
          "type": "address"
        }
      ],
      "name": "withdrawFees",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ],
  "devdoc": {
    "kind": "dev",
    "methods": {
      "deposit(address,uint256,address,uint256)": {
        "params": {
          "amount": "Amount in native token decimals to transfer cross-chain pre-fees*",
          "chainId": "which chain to bridge assets onto",
          "to": "address on other chain to bridge assets to",
          "token": "ERC20 compatible token to deposit into the bridge"
        }
      },
      "depositAndSwap(address,uint256,address,uint256,uint8,uint8,uint256,uint256)": {
        "params": {
          "amount": "Amount in native token decimals to transfer cross-chain pre-fees",
          "chainId": "which chain to bridge assets onto",
          "deadline": "latest timestamp to accept this transaction*",
          "minDy": "the min amount the user would like to receive, or revert to only minting the SynERC20 token crosschain.",
          "to": "address on other chain to bridge assets to",
          "token": "ERC20 compatible token to deposit into the bridge",
          "tokenIndexFrom": "the token the user wants to swap from",
          "tokenIndexTo": "the token the user wants to swap to"
        }
      },
      "getRoleAdmin(bytes32)": {
        "details": "Returns the admin role that controls `role`. See {grantRole} and {revokeRole}. To change a role's admin, use {_setRoleAdmin}."
      },
      "getRoleMember(bytes32,uint256)": {
        "details": "Returns one of the accounts that have `role`. `index` must be a value between 0 and {getRoleMemberCount}, non-inclusive. Role bearers are not sorted in any particular way, and their ordering may change at any point. WARNING: When using {getRoleMember} and {getRoleMemberCount}, make sure you perform all queries on the same block. See the following https://forum.openzeppelin.com/t/iterating-over-elements-on-enumerableset-in-openzeppelin-contracts/2296[forum post] for more information."
      },
      "getRoleMemberCount(bytes32)": {
        "details": "Returns the number of accounts that have `role`. Can be used together with {getRoleMember} to enumerate all bearers of a role."
      },
      "grantRole(bytes32,address)": {
        "details": "Grants `role` to `account`. If `account` had not been already granted `role`, emits a {RoleGranted} event. Requirements: - the caller must have ``role``'s admin role."
      },
      "hasRole(bytes32,address)": {
        "details": "Returns `true` if `account` has been granted `role`."
      },
      "mint(address,address,uint256,uint256,bytes32)": {
        "details": "This means the SynapseBridge.sol contract must have minter access to the token attempting to be minted",
        "params": {
          "amount": "Amount in native token decimals to transfer cross-chain post-fees",
          "fee": "Amount in native token decimals to save to the contract as fees",
          "kappa": "kappa*",
          "to": "address on other chain to redeem underlying assets to",
          "token": "ERC20 compatible token to deposit into the bridge"
        }
      },
      "mintAndSwap(address,address,uint256,uint256,address,uint8,uint8,uint256,uint256,bytes32)": {
        "details": "This means the BridgeDeposit.sol contract must have minter access to the token attempting to be minted",
        "params": {
          "amount": "Amount in native token decimals to transfer cross-chain post-fees",
          "deadline": "Epoch time of the deadline that the swap is allowed to be executed.",
          "fee": "Amount in native token decimals to save to the contract as fees",
          "kappa": "kappa*",
          "minDy": "Minumum amount (in final asset decimals) that must be swapped for, otherwise the user will receive the SynERC20.",
          "pool": "Destination chain's pool to use to swap SynERC20 -> Asset. The nodes determine this by using PoolConfig.sol.",
          "to": "address on other chain to redeem underlying assets to",
          "token": "ERC20 compatible token to deposit into the bridge",
          "tokenIndexFrom": "Index of the SynERC20 asset in the pool",
          "tokenIndexTo": "Index of the desired final asset"
        }
      },
      "paused()": {
        "details": "Returns true if the contract is paused, and false otherwise."
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
          "amount": "Amount in native token decimals to transfer cross-chain pre-fees",
          "chainId": "which underlying chain to bridge assets onto",
          "swapDeadline": "Specificies the deadline that the nodes are allowed to try to redeem/swap the LP token*",
          "swapMinAmount": "Specifies the minimum amount of the underlying asset needed for the nodes to execute the redeem/swap",
          "swapTokenIndex": "Specifies which of the underlying LP assets the nodes should attempt to redeem for",
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
      },
      "redeemV2(bytes32,uint256,address,uint256)": {
        "params": {
          "amount": "Amount in native token decimals to transfer cross-chain pre-fees*",
          "chainId": "which underlying chain to bridge assets onto",
          "to": "address on other chain to redeem underlying assets to",
          "token": "ERC20 compatible token to deposit into the bridge"
        }
      },
      "renounceRole(bytes32,address)": {
        "details": "Revokes `role` from the calling account. Roles are often managed via {grantRole} and {revokeRole}: this function's purpose is to provide a mechanism for accounts to lose their privileges if they are compromised (such as when a trusted device is misplaced). If the calling account had been granted `role`, emits a {RoleRevoked} event. Requirements: - the caller must be `account`."
      },
      "revokeRole(bytes32,address)": {
        "details": "Revokes `role` from `account`. If `account` had been granted `role`, emits a {RoleRevoked} event. Requirements: - the caller must have ``role``'s admin role."
      },
      "withdraw(address,address,uint256,uint256,bytes32)": {
        "params": {
          "amount": "Amount in native token decimals to withdraw",
          "fee": "Amount in native token decimals to save to the contract as fees",
          "kappa": "kappa*",
          "to": "address on chain to send underlying assets to",
          "token": "ERC20 compatible token to withdraw from the bridge"
        }
      },
      "withdrawAndRemove(address,address,uint256,uint256,address,uint8,uint256,uint256,bytes32)": {
        "params": {
          "amount": "Amount in native token decimals to withdraw",
          "fee": "Amount in native token decimals to save to the contract as fees",
          "kappa": "kappa*",
          "pool": "Destination chain's pool to use to swap SynERC20 -> Asset. The nodes determine this by using PoolConfig.sol.",
          "swapDeadline": "Specificies the deadline that the nodes are allowed to try to redeem/swap the LP token",
          "swapMinAmount": "Specifies the minimum amount of the underlying asset needed for the nodes to execute the redeem/swap",
          "swapTokenIndex": "Specifies which of the underlying LP assets the nodes should attempt to redeem for",
          "to": "address on chain to send underlying assets to",
          "token": "ERC20 compatible token to withdraw from the bridge"
        }
      },
      "withdrawFees(address,address)": {
        "params": {
          "to": "Address to send the fees to",
          "token": "ERC20 token in which fees acccumulated to transfer"
        }
      }
    },
    "version": 1
  },
  "userdoc": {
    "kind": "user",
    "methods": {
      "deposit(address,uint256,address,uint256)": {
        "notice": "Relays to nodes to transfers an ERC20 token cross-chain"
      },
      "depositAndSwap(address,uint256,address,uint256,uint8,uint8,uint256,uint256)": {
        "notice": "Relays to nodes to both transfer an ERC20 token cross-chain, and then have the nodes execute a swap through a liquidity pool on behalf of the user."
      },
      "mint(address,address,uint256,uint256,bytes32)": {
        "notice": "Nodes call this function to mint a SynERC20 (or any asset that the bridge is given minter access to). This is called by the nodes after a TokenDeposit event is emitted."
      },
      "mintAndSwap(address,address,uint256,uint256,address,uint8,uint8,uint256,uint256,bytes32)": {
        "notice": "Nodes call this function to mint a SynERC20 (or any asset that the bridge is given minter access to), and then attempt to swap the SynERC20 into the desired destination asset. This is called by the nodes after a TokenDepositAndSwap event is emitted."
      },
      "redeem(address,uint256,address,uint256)": {
        "notice": "Relays to nodes that (typically) a wrapped synAsset ERC20 token has been burned and the underlying needs to be redeeemed on the native chain"
      },
      "redeemAndRemove(address,uint256,address,uint256,uint8,uint256,uint256)": {
        "notice": "Relays to nodes that (typically) a wrapped synAsset ERC20 token has been burned and the underlying needs to be redeeemed on the native chain. This function indicates to the nodes that they should attempt to redeem the LP token for the underlying assets (E.g \"swap\" out of the LP token)"
      },
      "redeemAndSwap(address,uint256,address,uint256,uint8,uint8,uint256,uint256)": {
        "notice": "Relays to nodes that (typically) a wrapped synAsset ERC20 token has been burned and the underlying needs to be redeeemed on the native chain. This function indicates to the nodes that they should attempt to redeem the LP token for the underlying assets (E.g \"swap\" out of the LP token)"
      },
      "redeemV2(bytes32,uint256,address,uint256)": {
        "notice": "Relays to nodes that (typically) a wrapped synAsset ERC20 token has been burned and the underlying needs to be redeeemed on the native chain"
      },
      "withdraw(address,address,uint256,uint256,bytes32)": {
        "notice": "Function to be called by the node group to withdraw the underlying assets from the contract"
      },
      "withdrawAndRemove(address,address,uint256,uint256,address,uint8,uint256,uint256,bytes32)": {
        "notice": "Function to be called by the node group to withdraw the underlying assets from the contract"
      },
      "withdrawFees(address,address)": {
        "notice": "withdraw specified ERC20 token fees to a given address"
      }
    },
    "version": 1
  }
}

export default ABI
