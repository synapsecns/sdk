import {useConnectedMetaMask} from "metamask-react";

import {
	Tokens,
	ChainId
} from "@synapseprotocol/sdk";

import {
	useExecuteBridgeSwap,
	useBridgeSwapApproval,
	useCalculateBridgeSwapOutput
} from "@synapseprotocol/sdk";

import {Grid} from "@components/Grid";
import Button from "@components/Button";

import {
	ColBreak,
	DataRow,
	NeedsApprovalCol,
	ApproveButton,
	LOADING,
	LOADING_COLOR
} from "./VariousComponents";

import {useEffect, useState} from "react";
import {MetamaskStatus} from "@utils";
import {BigNumber} from "@ethersproject/bignumber";
import {formatEther} from "@ethersproject/units";


export default function BridgeSwap(props) {
	const {ethereum, chainId: cid, status} = useConnectedMetaMask();

	const chainId = status === MetamaskStatus.CONNECTED ? BigNumber.from(cid).toNumber() : ChainId.ETH;

	const
		tokenFrom   = Tokens.JEWEL,
		tokenTo     = Tokens.JEWEL,
		amountFrom  = tokenFrom.etherToWei("8", chainId),
		chainIdTo   = ChainId.AVALANCHE;

	const [calculateBridgeSwap, bridgeSwapEstimate] = useCalculateBridgeSwapOutput({
		ethereum,
		chainId,
		tokenFrom,
		tokenTo,
		amountFrom,
		chainIdTo
	});

	const {
		needsApprove,
		allowance: bridgeSpendAllowance,
		execApprove,
		approveTx,
		approveStatus
	} = useBridgeSwapApproval({
		ethereum,
		chainId,
		token:  tokenFrom,
		amount: amountFrom
	});

	const [executeBridgeSwap, bridgeSwapTx] = useExecuteBridgeSwap({
		ethereum,
		chainId,
		tokenFrom,
		tokenTo,
		amountFrom,
		amountTo: bridgeSwapEstimate?.amountToReceive ?? BigNumber.from(0),
		chainIdTo
	});

	if (!bridgeSwapEstimate) {
		calculateBridgeSwap();
	}

	return (
		<div className={"w-auto"}>
			<SwapHeader
				tokenFrom={tokenFrom}
				tokenTo={tokenTo}
				chainId={chainId}
				chainIdTo={chainIdTo}
			/>
			<Grid className={"grid-flow-row"} rows={4} cols={3} gapX={4} gapY={4}>
				<EstimatedOutputCol tokenTo={tokenTo} bridgeSwapEstimate={bridgeSwapEstimate}/>
				<ColBreak />
				<BridgeFeeCol tokenFrom={tokenFrom} bridgeSwapEstimate={bridgeSwapEstimate}/>
				<ColBreak />
				<NeedsApprovalCol token={tokenFrom} needsApproval={needsApprove}/>
				<ColBreak />
				<ApproveButton execApprove={execApprove} token={tokenFrom} approveStatus={approveStatus}/>
				<ColBreak />
				<BridgeButton executeBridgeSwap={executeBridgeSwap}/>
			</Grid>
		</div>
	)
}



function SwapHeader(args: {tokenFrom, tokenTo, chainId, chainIdTo}) {
	const headerStr: string = `${args.tokenFrom.symbol} (${args.chainId}) - ${args.tokenTo.symbol} (${args.chainIdTo})`

	return (<p className={"pb-8 font-extrabold"}>{headerStr}</p>)
}

function EstimatedOutputCol(args: {tokenTo, bridgeSwapEstimate}) {
	const {tokenTo, bridgeSwapEstimate} = args;

	const [formattedEstimate, setFormattedEstimate] = useState<string>(LOADING);
	const [textColor, setTextColor] = useState<string>(LOADING_COLOR);

	useEffect(() => {
		if (bridgeSwapEstimate !== null && formattedEstimate === LOADING) {
			const amt = bridgeSwapEstimate.amountToReceive;
			const amtEther = formatEther(amt);

			setFormattedEstimate(amtEther.toString());
		}
	}, [bridgeSwapEstimate])

	return (
		<DataRow>
			<p>Estimated output</p>
			<span className={`${textColor} position-relative`}>{formattedEstimate}</span> {tokenTo.symbol}
		</DataRow>
	)
}

function BridgeFeeCol(args: {tokenFrom, bridgeSwapEstimate}) {
	const {tokenFrom, bridgeSwapEstimate} = args;

	const [formattedEstimate, setFormattedEstimate] = useState<string>(LOADING);
	const [textColor, setTextColor] = useState<string>(LOADING_COLOR);

	useEffect(() => {
		if (bridgeSwapEstimate !== null && formattedEstimate === LOADING) {
			const amt = bridgeSwapEstimate.bridgeFee;
			const amtEther = formatEther(amt);

			setFormattedEstimate(amtEther.toString());
			setTextColor("text-indigo-700")
		}
	}, [bridgeSwapEstimate])

	return (
		<DataRow>
			<p>Bridge fee</p>
			<span className={`${textColor} position-relative`}>{formattedEstimate}</span> {tokenFrom.symbol}
		</DataRow>
	)
}

function BridgeButton(args: {executeBridgeSwap}) {
	const {executeBridgeSwap} = args;

	return (
		<DataRow>
			<Button
				text={`Do the bridge!`}
				onClick={executeBridgeSwap}
			/>
		</DataRow>
	)
}