import {
	addLiquidity as _addLiquidity,
	bridgeSwapSupported as _bridgeSwapSupported,
	buildAddLiquidityTransaction as _buildAddLiquidityTransaction,
	buildRemoveLiquidityOneTokenTransaction as _buildRemoveLiquidityOneTokenTransaction,
	buildRemoveLiquidityTransaction as _buildRemoveLiquidityTransaction,
	buildSwapTokensTransaction as _buildSwapTokensTransaction,
	calculateAddLiquidity as _calculateAddLiquidity,
	calculateRemoveLiquidity as _calculateRemoveLiquidity,
	calculateRemoveLiquidityOneToken as _calculateRemoveLiquidityOneToken,
	calculateSwapRate as _calculateSwapRate,
	detailedTokenSwapMap as _detailedTokenSwapMap,
	intermediateTokens as _intermediateTokens,
	removeLiquidity as _removeLiquidity,
	removeLiquidityOneToken as _removeLiquidityOneToken,
	swapContract as _swapContract, 
	swapSetup as _swapSetup,
	swapSupported as _swapSupported,
	swapTokens as _swapTokens
} from "@tokenswap";

export namespace TokenSwap {
	export const swapSupported = _swapSupported;
	export const bridgeSwapSupported = _bridgeSwapSupported;
	export const calculateAddLiquidity = _calculateAddLiquidity;
	export const calculateRemoveLiquidity = _calculateRemoveLiquidity;
	export const calculateRemoveLiquidityOneToken = _calculateRemoveLiquidityOneToken;
	export const addLiquidity = _addLiquidity;
	export const buildAddLiquidityTransaction = _buildAddLiquidityTransaction;
	export const removeLiquidity = _removeLiquidity;
	export const buildRemoveLiquidityTransaction = _buildRemoveLiquidityTransaction;
	export const removeLiquidityOneToken = _removeLiquidityOneToken;
	export const buildRemoveLiquidityOneTokenTransaction = _buildRemoveLiquidityOneTokenTransaction;
	export const calculateSwapRate = _calculateSwapRate;
	export const swapTokens = _swapTokens;
	export const buildSwapTokensTransaction = _buildSwapTokensTransaction;
	export const intermediateTokens = _intermediateTokens;
	export const detailedTokenSwapMap = _detailedTokenSwapMap;
	export const swapContract = _swapContract;
	export const swapSetup = _swapSetup;
}