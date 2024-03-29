import React from 'react';

import '../styles/column-layout.css';

type Props = {
    className?: string;
    gap?: number;
}

export default function ColumnLayout({ className, gap, children }: React.PropsWithChildren < Props >) {
    return (
        <div className = { `ColumnLayout FlexColumn ${className}` } style = { { gap: `${gap}px` } } >
            { children }
        </div>
    )
}

ColumnLayout.defaultProps = {
    className: '',
    gap: 24,
}
