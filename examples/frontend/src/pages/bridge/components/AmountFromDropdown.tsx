import {DropdownItem, DropdownMenu} from "../../../components/DropdownMenu";
import {BigNumber} from "ethers";

import {DarkRoundedItem} from "../../../components/DarkRoundedItem";

export interface AmountDropdownItem extends DropdownItem {
    amount: BigNumber,
}

interface AmountDropdownProps {
    selected:    AmountDropdownItem,
    setSelected: any,
    items:       AmountDropdownItem[]
}

export default function AmountFromDropdown({selected, setSelected, items}: AmountDropdownProps) {
    return(
        <DarkRoundedItem>
            <DropdownMenu
                title={"Select amount from"}
                selectedItem={selected}
                setSelectedItem={setSelected}
                items={items}
            />
        </DarkRoundedItem>
    )
}