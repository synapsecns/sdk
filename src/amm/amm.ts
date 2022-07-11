import { Token } from "@token";
import {
  BigNumber,
  ContractTransaction,
  PopulatedTransaction,
  Signer,
} from "ethers";
import {
  contractsForChainId,
  getTimeMinutesFromNow,
  convertToNativeDecimals,
} from "@common/utils";
import { Swap__factory } from "@internal/gen";
import { rpcProviderForChain } from "@internal/rpcproviders";
import { Tokens } from "@tokens";

// - [SWAP] - //

/**
 * @notice Builds a `swap` transaction from the `Swap` contract
 * @param chainId the id of the chain to swap on
 * @param tokenFrom the token to swap from
 * @param tokenTo the token to swap to
 * @param amountFrom the amount of tokenFrom to swap
 * @param amountTo optional: the minimum amount of tokenTo to receive
 * @param deadline optional: the deadline for the txn to execute
 * @returns a populated `swap` transaction
 */
export async function createSwapTxn(
  chainId: number,
  tokenFrom: Token,
  tokenTo: Token,
  amountFrom: number, // in units of ui
  amountTo?: number, // in units of ui
  deadline?: number
): Promise<PopulatedTransaction> {
  // Get the swap contract
  const provider = rpcProviderForChain(chainId);
  const swapAddress = contractsForChainId(chainId).swapAddress;
  const swapContract = Swap__factory.connect(swapAddress, provider);

  // Get the `swap` parameters
  const minimumAmountReceived = amountFrom * (99 / 100);
  const defaultDeadline = getTimeMinutesFromNow(10);
  const tokenIndexFrom = await swapContract.getTokenIndex(
    tokenFrom.address(chainId)
  );
  const tokenIndexTo = await swapContract.getTokenIndex(
    tokenTo.address(chainId)
  );

  // Build a populated transaction with the contract's `swap` function
  return await swapContract.populateTransaction.swap(
    tokenIndexFrom,
    tokenIndexTo,
    convertToNativeDecimals(amountFrom, tokenFrom.decimals(chainId)),
    convertToNativeDecimals(
      amountTo ?? minimumAmountReceived,
      tokenTo.decimals(chainId)
    ),
    deadline ?? defaultDeadline
  );
}

/**
 * @notice Call the `calculateSwap` function of the `Swap` contract
 * @param chainId the id of the chain to swap on
 * @param tokenFrom the token to swap from
 * @param tokenTo the token to swap to
 * @param amountFrom the amount of tokenFrom to swap
 * @returns the amount that would be received from a swap of amountFrom
 */
 export async function calculateSwap(
  chainId: number,
  tokenFrom: Token,
  tokenTo: Token,
  amountFrom: number // in units of ui
): Promise<BigNumber> {
  // Get the swap contract
  const provider = rpcProviderForChain(chainId);
  const swapAddress = contractsForChainId(chainId).swapAddress;
  const swapContract = Swap__factory.connect(swapAddress, provider);

  // Get the `swap` parameters
  const tokenIndexFrom = await swapContract.getTokenIndex(
    tokenFrom.address(chainId)
  );
  const tokenIndexTo = await swapContract.getTokenIndex(
    tokenTo.address(chainId)
  );

  // Call the contract's `swap` function
  return await swapContract.calculateSwap(
    tokenIndexFrom,
    tokenIndexTo,
    convertToNativeDecimals(amountFrom, tokenFrom.decimals(chainId))
  );
}

/**
 * @notice Call the `swap` function of the `Swap` contract
 * @param signer the signer who is calling the swap
 * @param chainId the id of the chain to swap on
 * @param tokenFrom the token to swap from
 * @param tokenTo the token to swap to
 * @param amountFrom the amount of tokenFrom to swap
 * @param amountTo optional: the minimum amount of tokenTo to receive
 * @param deadline optional: the deadline for the txn to execute
 * @returns amount of tokenTo received from the swap
 */
 export async function swap(
  signer: Signer,
  chainId: number,
  tokenFrom: Token,
  tokenTo: Token,
  amountFrom: number, // in units of ui
  amountTo?: number, // in units of ui
  deadline?: number
): Promise<ContractTransaction> {
  // Create the swap transaction
  const swapTxn = await createSwapTxn(
    chainId,
    tokenFrom,
    tokenTo,
    amountFrom,
    amountTo ?? null,
    deadline ?? null,
  );

  // Execute populated swap transaction
  return signer.sendTransaction(swapTxn);
}

// - [ADD LIQUIDITY] - //

/**
 * @notice Builds an `addLiquidity` transaction from the `Swap` contract
 * @param chainId the id of the chain to addLiquidity on
 * @param amounts the amounts of each token to add
 * @param minToMint the minimum amount of LP token to receive
 * @param deadline optional: the deadline for the txn to execute
 * @returns a populated `addLiquidity` transaction
 */
export async function createAddLiquidityTxn(
  chainId: number,
  amounts: number[],
  minToMint: number,
  deadline?: number,
): Promise<PopulatedTransaction> {
  // Get the swap contract
  const provider = rpcProviderForChain(chainId);
  const swapAddress = contractsForChainId(chainId).swapAddress;
  const swapContract = Swap__factory.connect(swapAddress, provider);

  // Get the length of the token array and tokens associated with each index of `amounts`
  const pooledTokensLength = 5;
  let tokenList: Token[] = [];
  for (let i = 0; i < pooledTokensLength; i++) {
    const tokenAtIndex = await swapContract.getToken(i);
    tokenList.push(Tokens.tokenFromAddress(tokenAtIndex, chainId));
  }

  // Get the `addLiquidity` parameters
  const defaultDeadline = getTimeMinutesFromNow(10);
  const amountsToNativeDecimals: BigNumber[] = [];
  for (let i = 0; i < amounts.length; i++) {
    amountsToNativeDecimals.push(
      convertToNativeDecimals(amounts[i], tokenList[i].decimals(chainId))
    );
  }

  // Build a populated transaction with the contract's `addLiquidity` function
  return await swapContract.populateTransaction.addLiquidity(
    amountsToNativeDecimals,
    minToMint,
    deadline ?? defaultDeadline
  );
}

/**
 * @notice Call the `addLiquidity` function of the `Swap` contract
 * @param signer the signer who is calling addLiquidity
 * @param chainId the id of the chain to addLiquidity on
 * @param amounts the amounts of each token to add
 * @param minToMint the minimum amount of LP token to receive
 * @param deadline optional: the deadline for the txn to execute
 * @returns amount of LP token received from the swap
 */
export async function addLiquidity(
  signer: Signer,
  chainId: number,
  amounts: number[],
  minToMint: number,
  deadline?: number,
): Promise<ContractTransaction> {
  // Create the addLiquidity transaction
  const addLiquidityTxn = await createAddLiquidityTxn(
    chainId,
    amounts,
    minToMint,
    deadline ?? null,
  );

  // Execute populated addLiquidity transaction
  return signer.sendTransaction(addLiquidityTxn);
}

// - [REMOVE LIQUIDITY] - //

/**
 * @notice Builds a `removeLiquidity` transaction from the `Swap` contract
 * @param chainId the id of the chain to removeLiquidity on
 * @param amount the amount of LP token to remove
 * @param minAmounts the minimum amount of each token to receive
 * @param deadline optional: the deadline for the txn to execute
 * @returns a populated `removeLiquidity` transaction
 */
export async function createRemoveLiquidityTxn(
  chainId: number,
  amount: number,
  minAmounts: number[],
  deadline?: number,
): Promise<PopulatedTransaction> {
  // Get the swap contract
  const provider = rpcProviderForChain(chainId);
  const swapAddress = contractsForChainId(chainId).swapAddress;
  const swapContract = Swap__factory.connect(swapAddress, provider);

  // Get the length of the token array and tokens associated with each index of `minAmounts`
  const pooledTokensLength = 5;
  let tokenList: Token[] = [];
  for (let i = 0; i < pooledTokensLength; i++) {
    const tokenAtIndex = await swapContract.getToken(i);
    tokenList.push(Tokens.tokenFromAddress(tokenAtIndex, chainId));
  }

  // Get the `removeLiquidity` parameters
  const defaultDeadline = getTimeMinutesFromNow(10);
  const minAmountsToNativeDecimals: BigNumber[] = [];
  for (let i = 0; i < minAmounts.length; i++) {
    minAmountsToNativeDecimals.push(
      convertToNativeDecimals(minAmounts[i], tokenList[i].decimals(chainId))
    );
  }

  // Build a populated transaction with the contract's `removeLiquidity` function
  return await swapContract.populateTransaction.removeLiquidity(
    amount,
    minAmountsToNativeDecimals,
    deadline ?? defaultDeadline
  );
}

/**
 * @notice Call the `removeLiquidity` function of the `Swap` contract
 * @param signer the signer who is calling removeLiquidity
 * @param chainId the id of the chain to removeLiquidity on
 * @param amount the amount of LP token to remove
 * @param minAmounts the minimum amount of each token to receive
 * @param deadline optional: the deadline for the txn to execute
 * @returns amount of each token received from the swap
 */
export async function removeLiquidity(
  signer: Signer,
  chainId: number,
  amount: number,
  minAmounts: number[],
  deadline?: number,
): Promise<ContractTransaction> {
  // Create the removeLiquidity transaction
  const removeLiquidityTxn = await createRemoveLiquidityTxn(
    chainId,
    amount,
    minAmounts,
    deadline ?? null,
  );

  // Execute populated removeLiquidity transaction
  return signer.sendTransaction(removeLiquidityTxn);
}
