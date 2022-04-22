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

import {useEffect, useState} from "react";
import {MetamaskStatus} from "@utils";
import {BigNumber} from "@ethersproject/bignumber";
import {formatEther} from "@ethersproject/units";

const LOADING = "Loading...";
const LOADING_COLOR = "text-sky-500";

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
				<NeedsApprovalCol tokenFrom={tokenFrom} needsApproval={needsApprove}/>
				<ColBreak />
				<ApproveButton execApprove={execApprove} tokenFrom={tokenFrom} approveStatus={approveStatus}/>
				<ColBreak />
				<BridgeButton executeBridgeSwap={executeBridgeSwap}/>
			</Grid>
		</div>
	)
}

const ColBreak = () => (<div className={"col-span-1"}/>)

const DataRow = ({children}) => (<div className={"col-span-1 pb-8"}>{children}</div>)

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

function NeedsApprovalCol(args: {tokenFrom, needsApproval}) {
	const {tokenFrom, needsApproval} = args;

	const [text, setText] = useState<string>(LOADING);
	const [textColor, setTextColor] = useState<string>(LOADING_COLOR);

	useEffect(() => {
		if (needsApproval !== null && text === LOADING) {
			setText(`${needsApproval ? "Yes" : "No"}`);
			if (needsApproval) {
				setTextColor("text-amber-500");
			} else {
				setTextColor("text-emerald-600");
			}
		}
	}, [needsApproval])

	return (
		<DataRow>
			<p>{tokenFrom.symbol} approval required</p>
			<p className={textColor}>{text}</p>
		</DataRow>
	)
}

function ApproveButton(args: {execApprove, tokenFrom, approveStatus}) {
	const {execApprove, tokenFrom, approveStatus} = args;

	return (
		<DataRow>
			<Button
				text={`Approve ${tokenFrom.symbol}`}
				onClick={execApprove}
				disabled={approveStatus}
			/>
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