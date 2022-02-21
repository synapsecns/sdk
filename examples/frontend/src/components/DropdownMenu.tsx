import {
    Listbox,
    Transition,
} from "@headlessui/react";

import { SelectorIcon } from '@heroicons/react/solid';

import {classNames} from "@utils";

export interface DropdownItem {
    label:      string,
    key:        string,
    className?: string,
    link?:      string,
    disabled:   boolean,
}

interface DropdownMenuProps {
    selectedItem:    any,
    setSelectedItem: any,
    title:           string,
    items:           DropdownItem[],
}

export default function DropdownMenu({title, selectedItem, setSelectedItem, items}: DropdownMenuProps) {
    return(
        <div className={"flex items-center justify-center"}>
            <div className={"w-60 max-w-xs"}>
                <Listbox value={selectedItem} onChange={setSelectedItem} as={"div"} className={"space-y-1"}>
                    {({open}) => (
                        <>
                            <Listbox.Label className={"block text-sm font-medium"}>{title}</Listbox.Label>
                            <div className={"relative"}>
                                <span className={"inline-block w-full rounded-md"}>
                                    <Listbox.Button
                                        className={classNames(
                                            "cursor-default relative w-full",
                                            "py-2 pl-3 pr-10 text-center",
                                            "rounded-md shadow-md",
                                            "sm:text-sm",
                                            "focus:outline-none focus-visible:ring-2",
                                            "focus-visible:ring-opacity-75 focus-visible:ring-white",
                                            "focus-visible:ring-offset-2 focus-visible:border-indigo-500"
                                        )}
                                    >
                                        <span className={"block truncate text-lg"}>{selectedItem?.label || ""}</span>
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                            <SelectorIcon className="w-5 h-5 text-gray-400" aria-hidden="true"/>
                                        </span>
                                    </Listbox.Button>
                                </span>
                                <Transition
                                    // as={Fragment}
                                    show={open}
                                    unmount={false}
                                    enter="transition duration-100 ease-in"
                                    enterFrom="transform opacity-0"
                                    enterTo="transform opacity-100"
                                    leave="transition duration-75 ease-out"
                                    leaveFrom="transform opacity-100"
                                    leaveTo="transform opacity-0"
                                    className={"absolute mt-1 w-full rounded-md dark:bg-gray-600"}
                                >
                                    <Listbox.Options static className={"z-10 overflow-auto max-h-60 sm:text-sm"}>
                                        {items.map((item) => {
                                            const selected = item.key === selectedItem.key;
                                            return(<Listbox.Option
                                                    key={item.key}
                                                    value={item}
                                                    disabled={item.disabled || selected}
                                                >
                                                    {({ active }) => (
                                                        <div className={classNames(
                                                            "cursor-default select-none relative",
                                                            active ? "bg-blue-500" : ""
                                                        )}>
                                                            <span
                                                                className={classNames(
                                                                    selected ? "font-semibold" : "font-normal",
                                                                    "block truncate"
                                                                )}
                                                            >
                                                                {item.label}
                                                            </span>
                                                        </div>
                                                    )}
                                                </Listbox.Option>
                                            )})}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </>
                    )}
                </Listbox>
            </div>
        </div>
    )
}