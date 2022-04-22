import {useConnectedMetaMask} from "metamask-react";

import {
	Tokens,
	ChainId
} from "@synapseprotocol/sdk";

import {
	useAddLiquidity,
	usePoolTokenApproval,
	useCalculateAddLiquidity,
	useChainStableswapLPToken
} from "@synapseprotocol/sdk";

import {Grid} from "@components/Grid";
import Button from "@components/Button";

import {
	ApproveButton,
	ExecuteButton,
	ColBreak,
	DataRow,
	LOADING,
	LOADING_COLOR, NeedsApprovalCol
} from "./VariousComponents";

import {useEffect, useState} from "react";
import {MetamaskStatus} from "@utils";
import {BigNumber} from "@ethersproject/bignumber";
import {formatEther} from "@ethersproject/units";


export default function AddLiquiditySingleToken(props) {
	const {ethereum, chainId: cid, status} = useConnectedMetaMask();

	const chainId = status === MetamaskStatus.CONNECTED ? BigNumber.from(cid).toNumber() : ChainId.ETH;

	const [stableswapPool] = useChainStableswapLPToken(ethereum, chainId);

	// const liquidityToken = Tokens.USDC;
	const addLiquidityAmount = "55";

	// console.log(stableswapPool);

	const [liquidityAmountsMap, setLiquidityAmountsMap] = useState(null);

	useEffect(() => {
		if (stableswapPool && !liquidityAmountsMap) {
			const amountsMap = stableswapPool.liquidityAmountsMap();
			amountsMap[liquidityToken.symbol] = addLiquidityAmount;
			setLiquidityAmountsMap(amountsMap);
		}
	}, [stableswapPool])

	const deadline = Math.round((new Date().getTime() / 1000) + 60 * 10);

	const [calculateAddLiquidity, addLiquidityEstimate] = useCalculateAddLiquidity({
		ethereum,
		chainId,
		lpToken: stableswapPool,
		amounts: liquidityAmountsMap
	});

	if (liquidityAmountsMap) {
		calculateAddLiquidity();
	}

	const {
		needsApprove,
		allowance: swapPoolSpendAllowance,
		execApprove,
		approveTx,
		approveStatus
	} = usePoolTokenApproval({
		ethereum,
		chainId,
		token:   liquidityToken,
		lpToken: stableswapPool,
		amount:  addLiquidityAmount
	});

	const [addLiquidity, addLiquidityTx] = useAddLiquidity({
		ethereum,
		chainId,
		deadline,
		lpToken:   stableswapPool,
		amounts:   liquidityAmountsMap,
		minToMint: addLiquidityEstimate
	});

	return (
		<div className={"w-auto"}>
			<Grid className={"grid-flow-row"} rows={4} cols={3} gapX={4} gapY={4}>
				<EstimatedLPTokenCol lpToken={stableswapPool} addLiquidityEstimate={addLiquidityEstimate}/>
				<ColBreak />
				<NeedsApprovalCol token={liquidityToken} needsApproval={needsApprove}/>
				<ColBreak />
				<ApproveButton execApprove={execApprove} token={liquidityToken} approveStatus={approveStatus}/>
				<ColBreak />
				<ExecuteButton text={"Add Liquidity"} execFn={addLiquidity}/>
			</Grid>
		</div>
	)
}

function EstimatedLPTokenCol(args: {addLiquidityEstimate, lpToken}) {
	const {addLiquidityEstimate, lpToken} = args;

	const [formattedEstimate, setFormattedEstimate] = useState<string>(LOADING);
	const [textColor, setTextColor] = useState<string>(LOADING_COLOR);

	useEffect(() => {
		if (addLiquidityEstimate !== null && formattedEstimate === LOADING) {
			const amtEther = formatEther(addLiquidityEstimate);

			setFormattedEstimate(amtEther.toString());
		}
	}, [addLiquidityEstimate])

	if (!lpToken) {
		return (
			<DataRow>
				<p>Estimated LP Tokens received</p>
				<span className={`${textColor} position-relative`}>{formattedEstimate}</span>
			</DataRow>
		)
	}

	return (
		<DataRow>
			<p>Estimated LP Tokens received</p>
			<span className={`${textColor} position-relative`}>{formattedEstimate}</span> {lpToken.symbol}
		</DataRow>
	)
}