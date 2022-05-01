export {
    SynapseBridgeContractInstance,
    L1BridgeZapContractInstance,
    L2BridgeZapContractInstance
} from "@entities";

export {
    Bridge,
    SynapseBridge,
    getRequiredConfirmationsForBridge,
    bridgeSwapSupported,
    checkBridgeTransactionComplete
} from "@bridge/bridge";

export type {
    CanBridgeResult,
    BridgeOutputEstimate,
    BridgeParams,
    BridgeTransactionParams
} from "@bridge/bridge";

export {Slippages} from "@bridge/slippages";

export {
    ChainId,
    supportedChainIds,
    EIP1559Chains,
    chainSupportsEIP1559
} from "@common/chainid";

export type {ChainGasPrices} from "./gasprice";
export {fetchChainGasPrices} from "./gasprice";

export type {GasOptions} from "@common/gasoptions";
export {populateGasOptions, makeTransactionGasOverrides} from "@common/gasoptions";

export {
    Networks,
    supportedNetworks
} from "@common/networks";

export {
    type Token,
    BaseToken,
    WrapperToken
} from "@token";

export {Tokens} from "@tokens";

export * from "@swappools";

export * from "@tokenswap";

export {
    type RPCEndpointsConfig,
    configureRPCEndpoints
} from "@internal/rpcproviders";

export type {
    SynapseBridgeContract,
    GenericZapBridgeContract,
    L1BridgeZapContract,
    L2BridgeZapContract,
    SynapseERC20Contract,
    BridgeConfigV3Contract
} from "@contracts";

export {
    TokenSwap,
    SwapPools
} from "@namespaces/index";

import {
    useApproveBridgeSwap,
    useExecuteBridgeSwap,
    useCalculateBridgeSwapOutput,
    useBridgeAllowance,
    useNeedsBridgeSwapApproval,
    useBridgeSwapApproval,
    useChainStableswapLPToken,
    useChainETHSwapLPToken,
    useHarmonyJewelLPToken,
    useHarmonyAVAXLPToken,
    useCalculateAddLiquidity,
    useCalculateRemoveLiquidity,
    useCalculateRemoveLiquidityOneToken,
    useAddLiquidity,
    useRemoveLiquidity,
    useRemoveLiquidityOneToken,
    useCalculateSwapRate,
    useSwapTokens,
    useApproveLPToken,
    useApprovePoolToken,
    useLPTokenAllowance,
    useLPTokenNeedsApproval,
    useLPTokenApproval,
    usePoolTokenAllowance,
    usePoolTokenNeedsApproval,
    usePoolTokenApproval,
    AllowanceError,
    TransactionError
} from "./hooks/index";

export {
    useApproveBridgeSwap,
    useExecuteBridgeSwap,
    useCalculateBridgeSwapOutput,
    useBridgeAllowance,
    useNeedsBridgeSwapApproval,
    useBridgeSwapApproval,
    useChainStableswapLPToken,
    useChainETHSwapLPToken,
    useHarmonyJewelLPToken,
    useHarmonyAVAXLPToken,
    useCalculateAddLiquidity,
    useCalculateRemoveLiquidity,
    useCalculateRemoveLiquidityOneToken,
    useAddLiquidity,
    useRemoveLiquidity,
    useRemoveLiquidityOneToken,
    useCalculateSwapRate,
    useSwapTokens,
    useApproveLPToken,
    useApprovePoolToken,
    useLPTokenAllowance,
    useLPTokenNeedsApproval,
    useLPTokenApproval,
    usePoolTokenAllowance,
    usePoolTokenNeedsApproval,
    usePoolTokenApproval,
    AllowanceError,
    TransactionError
};

declare module "./" {}