import type {OnClickFunction} from "@utils";

export interface ButtonProps {
    text:      string,
    onClick?:  OnClickFunction,
    disabled?: boolean,
}

export const emptyOnClick: OnClickFunction = () => {}

export default function Button({text, onClick, disabled=false}: ButtonProps) {
    return (
        <div>
            <button
                className={"w-full bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-full"}
                onClick={onClick ?? emptyOnClick}
                disabled={disabled}
            >
                {text}
            </button>
        </div>
    )
}