



function BridgePageContent(props: {className?: string}) {

    return(
        <div className={"w-1/4"}>
        </div>
    )
}

export function BridgePage(props: {className?: string}) {
    return (
        <BridgePageContent className={props.className}/>
    )
}