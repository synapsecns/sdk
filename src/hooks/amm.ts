import { Provider } from "@ethersproject/providers";
import { Token } from "@token";
import { BigNumberish, ethers, Signer } from "ethers";
import { useSignerFromEthereum } from "./signer";
import SWAP_ABI from "@abis/swap.json";
import {
  getTimeMinutesFromNow,
  uiToNative,
} from "./utils";

/**
 * @notice Call the `swap` function of the `Swap` contract
 * @param poolName the name of the pool to use
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
  poolName: any,
  chainId: number,
  signer: Signer,
  tokenFrom: Token,
  tokenTo: Token,
  amountFrom: number, // in units if ui
  amountTo?: number, // in units of ui
  deadline?: number
) {
  // Get the swap contract
  const { swapAddress, swapEthAddress } = usePoolTokenInfo(poolName, chainId);
  const swapContract = new ethers.Contract(swapAddress, SWAP_ABI, signer);

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
  return await swapContract.swap(
    tokenIndexFrom,
    tokenIndexTo,
    uiToNative(amountFrom, tokenFrom.decimals(chainId)),
    uiToNative(amountTo ?? minimumAmountReceived, tokenTo.decimals(chainId)),
    deadline ?? defaultDeadline
  );
}

/**
 * @notice Call the `calculateSwap` function of the `Swap` contract
 * @param poolName the name of the pool to use
 * @param chainId the id of the chain to swap on
 * @param signer the signer who is calling the swap
 * @param tokenFrom the token to swap from
 * @param tokenTo the token to swap to
 * @param amountFrom the amount of tokenFrom to swap
 * @returns the amount that would be received from a swap of amountFrom
 */
export async function calculateSwap(
  poolName: any,
  chainId: number,
  signer: Signer,
  tokenFrom: Token,
  tokenTo: Token,
  amountFrom: number // in units of ui
) {
  // Get the swap contract
  const { swapAddress, swapEthAddress } = usePoolTokenInfo(poolName, chainId);
  const swapContract = new ethers.Contract(swapAddress, SWAP_ABI, signer);

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
    uiToNative(amountFrom, tokenFrom.decimals(chainId))
  );
}