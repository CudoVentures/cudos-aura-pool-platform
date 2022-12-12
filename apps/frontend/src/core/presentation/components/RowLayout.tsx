import React from 'react';

import '../styles/row-layout.css';

type Props = {
    className?: string;
    gap?: number;
    numColumns: number;
}

export default function RowLayout({ className, numColumns, gap, children }: React.PropsWithChildren < Props >) {
    return (
        <div className = { `RowLayout ${className}` } style = { { gap: `${gap}px`, gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))` } } >
            { children }
        </div>
    )
}

RowLayout.defaultProps = {
    className: '',
    gap: 24,
}
