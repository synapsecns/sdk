import {classNames} from "@utils";

interface GridProps {
    className?: string,
    rows?:      number,
    cols?:      number,
    gapX?:      number,
    gapY?:      number,
    children:   JSX.Element | JSX.Element[],
}

export function Grid({
    className="",
    rows=6,
    cols=6,
    gapX=1,
    gapY=1,
    children
}: GridProps) {
    return(<div
        className={classNames(
            "grid",
            `gap-x-${gapX}`,
            `gap-y-${gapY}`,
            `grid-rows-${rows}`,
            `grid-cols-${cols}`,
            className
        )}
    >
        {children}
    </div>)
}