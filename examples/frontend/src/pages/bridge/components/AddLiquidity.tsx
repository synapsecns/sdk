import {useConnectedMetaMask} from "metamask-react";

import {
	type Token,
	Tokens,
	ChainId,
	SwapPools
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
	RowBreak,
	ColBreak,
	DataRow,
	LOADING,
	LOADING_COLOR, NeedsApprovalCol
} from "./VariousComponents";

import {useEffect, useState} from "react";
import {MetamaskStatus} from "@utils";
import {formatEther} from "@ethersproject/units";
import {
	BigNumber,
	type BigNumberish
} from "@ethersproject/bignumber";

interface BaseProps {
	ethereum: any;
	chainId:  number;
	status:   string;
}

interface AddLiquiditySingleTokenProps extends BaseProps {
	lpToken: 		 SwapPools.SwapPoolToken;
	liquidityToken:  Token;
	liquidityAmount: BigNumberish;
}


export default function AddLiquidity(props) {
	const {ethereum, chainId: cid, status} = useConnectedMetaMask();
	const chainId = status === MetamaskStatus.CONNECTED ? BigNumber.from(cid).toNumber() : ChainId.ETH;

	const [stableswapPool] = useChainStableswapLPToken(ethereum, chainId);

	const [liquidityAmountsMap, setLiquidityAmountsMap] = useState(null);

	const addLiquidityAmount = "55";
	const deadline = Math.round((new Date().getTime() / 1000) + 60 * 10);

	useEffect(() => {
		if (stableswapPool && !liquidityAmountsMap) {
			const amountsMap = stableswapPool.liquidityAmountsMap();
			Object.keys(amountsMap).forEach(k => amountsMap[k] = addLiquidityAmount)
			setLiquidityAmountsMap(amountsMap);
		}
	}, [stableswapPool])

	const [calculateAddLiquidity, addLiquidityEstimate] = useCalculateAddLiquidity({
		ethereum,
		chainId,
		lpToken: stableswapPool,
		amounts: liquidityAmountsMap
	});

	if (liquidityAmountsMap) {
		calculateAddLiquidity();
	}

	const [addLiquidity, addLiquidityTx] = useAddLiquidity({
		ethereum,
		chainId,
		deadline,
		lpToken:   stableswapPool,
		amounts:   liquidityAmountsMap,
		minToMint: addLiquidityEstimate
	});

	let baseProps: BaseProps;

	if (stableswapPool && liquidityAmountsMap) {
		baseProps = {
			ethereum,
			chainId,
			status
		};

		return (
			<div className={"w-auto"}>
				<Grid className={"grid-flow-row"} rows={10} cols={2} gapX={4} gapY={4}>
					<EstimatedLPTokenCol lpToken={stableswapPool} addLiquidityEstimate={addLiquidityEstimate}/>
					{/*<RowBreak />*/}
					<ExecuteButton text={"Add Liquidity"} execFn={addLiquidity}/>
					<RowBreak />
					<div className={"row-span-4 pt-8"}>{stableswapPool.poolTokens.map((liquidityToken) => {
						const tokenSymbol = liquidityToken.symbol;
						const liquidityAmount = liquidityAmountsMap[`${tokenSymbol}`];

						const componentProps: AddLiquiditySingleTokenProps = {
							...baseProps,
							lpToken: stableswapPool,
							liquidityToken,
							liquidityAmount
						};

						return (
							<DataRow>
								<AddLiquiditySingleToken {...componentProps} />
							</DataRow>
						)
					})}</div>
				</Grid>
			</div>
		)
	}


	return (
		<div className={"w-auto"}>{LOADING}</div>
	)
}

function AddLiquiditySingleToken(props: AddLiquiditySingleTokenProps) {
	const {
		ethereum,
		chainId,
		lpToken,
		liquidityToken,
		liquidityAmount
	} = props;

	const {
		needsApprove,
		allowance: swapPoolSpendAllowance,
		execApprove,
		approveTx,
		approveStatus
	} = usePoolTokenApproval({
		ethereum,
		chainId,
		lpToken,
		token:   liquidityToken,
		amount:  liquidityAmount
	});

	return (
		<Grid className={"grid-flow-row"} rows={2} cols={1} gapY={4}>
			<NeedsApprovalCol token={liquidityToken} needsApproval={needsApprove}/>
			{/*<RowBreak/>*/}
			<ApproveButton execApprove={execApprove} token={liquidityToken} approveStatus={approveStatus}/>
			<RowBreak />
		</Grid>
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
			<DataRow pb={2}>
				<p>Estimated LP Tokens received</p>
				<span className={`${textColor} position-relative`}>{formattedEstimate}</span>
			</DataRow>
		)
	}

	return (
		<DataRow pb={2}>
			<p>Estimated LP Tokens received</p>
			<span className={`${textColor} position-relative`}>{formattedEstimate}</span> {lpToken.symbol}
		</DataRow>
	)
}