import {useConnectedMetaMask} from "metamask-react";

import {ChainId} from "@synapseprotocol/sdk";

import {
	useRemoveLiquidity,
	useLPTokenApproval,
	useCalculateRemoveLiquidity,
	useChainStableswapLPToken
} from "@synapseprotocol/sdk";

import {Grid} from "@components/Grid";

import {
	ApproveButton,
	ExecuteButton,
	ColBreak,
	DataRow,
	LOADING,
	LOADING_COLOR, NeedsApprovalCol
} from "./VariousComponents";

import {useState} from "react";
import {MetamaskStatus} from "@utils";
import {BigNumber} from "@ethersproject/bignumber";

export default function RemoveLiquidity(props) {
	const {ethereum, chainId: cid, status} = useConnectedMetaMask();

	const chainId = status === MetamaskStatus.CONNECTED ? BigNumber.from(cid).toNumber() : ChainId.ETH;

	const [stableswapPool] = useChainStableswapLPToken(ethereum, chainId);

	const removeLiquidityAmount = "55";

	const deadline = Math.round((new Date().getTime() / 1000) + 60 * 10);

	const [calculateRemoveLiquidity, removeLiquidityEstimate] = useCalculateRemoveLiquidity({
		ethereum,
		chainId,
		lpToken: stableswapPool,
		amount:  removeLiquidityAmount
	});

	if (stableswapPool && !removeLiquidityEstimate) {
		calculateRemoveLiquidity();
	}

	const {
		needsApprove,
		allowance: swapPoolSpendAllowance,
		execApprove,
		approveTx,
		approveStatus
	} = useLPTokenApproval({
		ethereum,
		chainId,
		lpToken: stableswapPool,
		amount:  removeLiquidityAmount
	});

	const [removeLiquidity, removeLiquidityTx] = useRemoveLiquidity({
		ethereum,
		chainId,
		deadline,
		lpToken:    stableswapPool,
		amount:     removeLiquidityAmount,
		minAmounts: removeLiquidityEstimate
	});

	return (
		<div className={"w-auto"}>
			<Grid className={"grid-flow-row"} rows={4} cols={3} gapX={4} gapY={4}>
				<EstimatedTokensCol lpToken={stableswapPool} removeLiquidityEstimate={removeLiquidityEstimate}/>
				<ColBreak />
				{stableswapPool && <NeedsApprovalCol token={stableswapPool} needsApproval={needsApprove}/>}
				<ColBreak />
				{stableswapPool && <ApproveButton execApprove={execApprove} token={stableswapPool} approveStatus={approveStatus}/>}
				<ColBreak />
				<ExecuteButton text={"Remove Liquidity"} execFn={removeLiquidity}/>
			</Grid>
		</div>
	)
}

function EstimatedTokensCol(args: {removeLiquidityEstimate, lpToken}) {
	const {removeLiquidityEstimate, lpToken} = args;

	const [textColor, setTextColor] = useState<string>(LOADING_COLOR);

	if (!lpToken || !removeLiquidityEstimate) {
		return (
			<DataRow>
				<p>Estimated LP Tokens received</p>
				<span className={`${textColor} position-relative`}>{LOADING}</span>
			</DataRow>
		)
	}

	return (
		removeLiquidityEstimate.map((amount, idx) => {
			const poolToken = lpToken.poolTokens[idx];
			const amtEther = poolToken.weiToEtherString(amount, lpToken.chainId);
			return (
				<DataRow>
					<p>Estimated LP Tokens received</p>
					<span className={`${textColor} position-relative`}>{amtEther}</span> {poolToken.symbol}
				</DataRow>
			)
		})
	)
}