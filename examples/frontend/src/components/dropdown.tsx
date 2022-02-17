import {
    Fragment,
    useState,
    Dispatch,
    SetStateAction
} from "react";
import {
    Listbox,
    Transition,
} from "@headlessui/react";

export interface DropdownItemProps {
    label:      string,
    key:        any,
    value?:     any,
    className?: string,
    link?:      string,
}

interface DropdownMenuProps {
    selectedItem:    any,
    setSelectedItem: any,
    title:           string,
    items:           DropdownItemProps[],
}

export function DropdownMenu({title, selectedItem, setSelectedItem, items}: DropdownMenuProps) {
    return(
        <Listbox value={selectedItem} onChange={setSelectedItem}>
            <Listbox.Label>{`${title}: `}</Listbox.Label>
            <Listbox.Button>{selectedItem.label}</Listbox.Button>
            <Transition
                as={Fragment}
                enter={"transition ease-out duration-100"}
                enterFrom={"transform opacity-0 scale-95"}
                enterTo={"transform opacity-100 scale-100"}
                leave={"transition ease-in duration-75"}
                leaveFrom={"transform opacity-100 scale-100"}
                leaveTo={"transform opacity-0 scale-95"}
            >
                <Listbox.Options>
                    {items.map((item) => (
                        <Listbox.Option
                            key={`${item.key}`}
                            value={item}
                        >
                            {item.label}
                        </Listbox.Option>
                    ))}
                </Listbox.Options>
            </Transition>
        </Listbox>
    )
}

export const useDropdownMenu = (
    props: {title: string, items: DropdownItemProps[]}
): [DropdownItemProps, Dispatch<SetStateAction<DropdownItemProps>>, any] => {
    let [selectedItem, setSelectedItem] = useState<DropdownItemProps>(props.items[0]);

    let Component = ({}) => (
        <div>
            <DropdownMenu
                title={props.title}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                items={props.items}
            />
        </div>
    );

    return [selectedItem, setSelectedItem, Component]
}