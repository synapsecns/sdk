import {useEffect, useState} from "react";
import Button from "@components/Button";

export const LOADING = "Loading...";
export const LOADING_COLOR = "text-sky-500";

export const RowBreak = () => (<div className={"row-span-1"}/>)
export const ColBreak = () => (<div className={"col-span-1"}/>)

export const DataRow = ({children, pb=8}) => (<div className={`row-span-1 pb-${pb}`}>{children}</div>)
export const DataCol = ({children, pb=8}) => (<div className={`col-span-1 pb-${pb}`}>{children}</div>)

export function NeedsApprovalCol(args: {token, needsApproval}) {
	const {token, needsApproval} = args;

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
		<DataRow pb={2}>
			<p>{token.symbol} approval required</p>
			<p className={textColor}>{text}</p>
		</DataRow>
	)
}

export function ApproveButton(args: {execApprove, token, approveStatus}) {
	const {execApprove, token, approveStatus} = args;

	return (
		<DataRow>
			<Button
				text={`Approve ${token.symbol}`}
				onClick={execApprove}
				disabled={approveStatus}
			/>
		</DataRow>
	)
}

export function ExecuteButton(args: {text, execFn}) {
	const {text, execFn} = args;

	return (
		<DataRow>
			<Button
				text={text}
				onClick={execFn}
			/>
		</DataRow>
	)
}