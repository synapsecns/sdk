import {DropdownItem, DropdownMenu} from "../../components/DropdownMenu";
import {BigNumber} from "ethers";
import {classNames} from "../../utils";

export interface AmountDropdownItem extends DropdownItem {
    amount: BigNumber,
}


interface AmountDropdownProps {
    selected:    AmountDropdownItem,
    setSelected: any,
    items:       AmountDropdownItem[]
}

export default function AmountFromDropdown({selected, setSelected, items}: AmountDropdownProps) {
    return(<div
        className={classNames(
            "rounded-md border",
            "shadow-md",
            "dark:bg-gray-800 dark:border-gray-600",
        )}>
        <DropdownMenu
            title={"Select amount from"}
            selectedItem={selected}
            setSelectedItem={setSelected}
            items={items}
        />
    </div>)
}