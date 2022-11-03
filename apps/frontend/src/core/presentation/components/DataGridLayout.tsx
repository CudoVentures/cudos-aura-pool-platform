import React from 'react';

import '../styles/data-grid-layout.css';

type Props = {
    className?: string;
    headerLeft?: React.ReactNode;
    headerRight?: React.ReactNode;
};

export default function DataGridLayout({ className, headerLeft, headerRight, children }: React.PropsWithChildren < Props >) {

    return (
        <div className={`DataGridLayout ${className}`}>
            { (headerLeft !== null || headerRight !== null) && (
                <div className={'DataGridHeader'}>
                    <div className={'DataGridHeaderLeft'}> { headerLeft } </div>
                    <div className={'DataGridHeaderRight'}> { headerRight } </div>
                </div>
            ) }
            { children }
        </div>
    )

}

DataGridLayout.defaultProps = {
    className: '',
    headerLeft: null,
    headerRight: null,
}
