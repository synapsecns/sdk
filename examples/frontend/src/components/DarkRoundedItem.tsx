import {classNames} from "@utils";

const CLASS_NAME: string = classNames(
    "rounded-md border",
    "shadow-md",
    "dark:bg-gray-800 dark:border-gray-600",
    "h-28"
)

export default function DarkRoundedItem({children}) {
    return (
        <div className={CLASS_NAME}>
            {children}
        </div>
    )
}