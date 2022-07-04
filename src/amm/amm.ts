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

/**
 * @notice Builds a `swap` transaction from the `Swap` contract
 * @param chainId the id of the chain to swap on
 * @param signer the signer who is calling the swap
 * @param tokenFrom the token to swap from
 * @param tokenTo the token to swap to
 * @param amountFrom the amount of tokenFrom to swap
 * @param amountTo optional: the minimum amount of tokenTo to receive
 * @param deadline optional: the deadline for the txn to execute
 * @returns amount of tokenTo received from the swap
 */
export async function createSwapTxn(
  chainId: number,
  tokenFrom: Token,
  tokenTo: Token,
  amountFrom: number, // in units if ui
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

  // Call the contract's `swap` function
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
 * @notice Call the `swap` function of the `Swap` contract
 * @param chainId the id of the chain to swap on
 * @param signer the signer who is calling the swap
 * @param tokenFrom the token to swap from
 * @param tokenTo the token to swap to
 * @param amountFrom the amount of tokenFrom to swap
 * @param amountTo optional: the minimum amount of tokenTo to receive
 * @param deadline optional: the deadline for the txn to execute
 * @returns amount of tokenTo received from the swap
 */
export async function swap(
  chainId: number,
  signer: Signer,
  tokenFrom: Token,
  tokenTo: Token,
  amountFrom: number, // in units if ui
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

/**
 * @notice Call the `calculateSwap` function of the `Swap` contract
 * @param chainId the id of the chain to swap on
 * @param signer the signer who is calling the swap
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
