import os
import json
import argparse
from pprint import pprint


BASE_PATH_REPLACE_KEY = "[BASE_PATH]"

SOLC_TEMPLATE = {
    "language": "Solidity",
    "sources": {},
    "settings": {
        "remappings": [
            f"@openzeppelin/contracts/={BASE_PATH_REPLACE_KEY}/node_modules/@openzeppelin/contracts/",
            f"@openzeppelin/contracts-upgradeable/={BASE_PATH_REPLACE_KEY}/node_modules/@openzeppelin/contracts-upgradeable/"
        ],
        "optimizer": {
            "enabled": True,
            "runs": 200
        },
        "metadata": {
            "useLiteralContent": True
        },
        "outputSelection": {}
    }
}

DEFAULT_CONTRACT_OUTPUTS  = ["abi", "devdoc", "userdoc"]

SOLC_CONTRACTS_KEY    = "contracts"
SOLC_SOURCES_KEY      = "sources"
SOLC_SOURCES_URLS_KEY = "urls"
SOLC_SETTINGS_KEY     = "settings"
SOLC_REMAPPINGS_KEY   = "remappings"
SOLC_OUTPUTS_KEY      = "outputSelection"

JSON_TEMPLATE_PATH  = os.path.realpath("./scripts/solc-input.json")
BUILT_JSON_PATH     = os.path.realpath("./temp_input.json")


def make_solc_input(args):
    base_path     = args.base_path
    contract_path = args.contract_path
    contract_name = args.contract_name

    data = json.loads(json.dumps(SOLC_TEMPLATE))

    data[SOLC_SOURCES_KEY] = {
        f"{contract_path}": {
            SOLC_SOURCES_URLS_KEY: [
                os.path.realpath(base_path+"/"+contract_path)
            ]
        }
    }

    for i, remapping in enumerate(data[SOLC_SETTINGS_KEY][SOLC_REMAPPINGS_KEY]):
        data[SOLC_SETTINGS_KEY][SOLC_REMAPPINGS_KEY][i] = remapping.replace(BASE_PATH_REPLACE_KEY, base_path)

    data[SOLC_SETTINGS_KEY][SOLC_OUTPUTS_KEY] = {
        f"{contract_path}": {
            f"{contract_name}": DEFAULT_CONTRACT_OUTPUTS
        }
    }

    with open(BUILT_JSON_PATH, "w") as t:
        json.dump(data, t)

    print(BUILT_JSON_PATH)


def parse_sol_output(args):
    with open(args.path, "r") as j:
        data = json.load(j)

    useful_data = data[SOLC_CONTRACTS_KEY][args.contract_path][args.contract_name]

    print(json.dumps(useful_data))


parser = argparse.ArgumentParser(prog="py_helpers")
subparsers = parser.add_subparsers()

solc_parser = subparsers.add_parser("make_solc_input")
solc_parser.add_argument("base_path", type=str)
solc_parser.add_argument("contract_path", type=str)
solc_parser.add_argument("contract_name", type=str)
solc_parser.set_defaults(func=make_solc_input)

sol_output_parser = subparsers.add_parser("sol_output")
sol_output_parser.add_argument("path", type=str)
sol_output_parser.add_argument("contract_path", type=str)
sol_output_parser.add_argument("contract_name", type=str)
sol_output_parser.set_defaults(func=parse_sol_output)

if __name__ in '__main__':
    args = parser.parse_args()

    args.func(args)