#!/usr/bin/env zsh

BASE_PATH=$(realpath "$1")
SOLC_PATH=$(realpath "$2")

CURRENT_DIR="$PWD"

COMBINED_OUTPUTS_DIR=$(realpath "$CURRENT_DIR/src/abis")
TEMP_INPUT=$(realpath "$CURRENT_DIR/temp_input.json")
TEMP_OUTPUT=$(realpath "$CURRENT_DIR/temp_output.json")

PYTHON_PATH=$(which python3)
PYTHON_HELPER_PATH=$(realpath ./scripts/py_helpers.py)

PY_HELPER () {
  echo $($PYTHON_PATH $PYTHON_HELPER_PATH "$@")
}

process_solc_compile () {
  solc_input_json=$(PY_HELPER make_solc_input "$BASE_PATH" "$@")
  cd "$BASE_PATH"
  $SOLC_PATH --allow-paths="*," --no-color --standard-json $solc_input_json > "$TEMP_OUTPUT"
}

process_solc_output () {
  filename="$COMBINED_OUTPUTS_DIR/$2"

  cd "$CURRENT_DIR"
  PY_HELPER sol_output "$TEMP_OUTPUT" "$@" > "$filename.json"
  rm -rf "$filename.ts"
  touch "$filename.ts"
  echo "const ABI = $(cat $filename.json | jq)\n" >> "$filename.ts"
  echo "export default ABI" >> "$filename.ts"
}

process_abi () {
  process_solc_compile "$@"
  process_solc_output "$@"

  rm -rf "$TEMP_INPUT" "$TEMP_OUTPUT"
}

process_abi "contracts/bridge/SynapseBridge.sol" "SynapseBridge"
process_abi "contracts/bridge/SynapseERC20.sol" "SynapseERC20"
process_abi "contracts/bridge/wrappers/L2BridgeZap.sol" "L2BridgeZap"
process_abi "contracts/bridge/wrappers/L1BridgeZap.sol" "L1BridgeZap"
process_abi "contracts/bridge/BridgeConfig.sol" "BridgeConfig"
process_abi "contracts/bridge/PoolConfig.sol" "PoolConfig"
process_abi "contracts/amm/SwapFlashLoan.sol" "SwapFlashLoan"