import React from 'react';

import '../styles/chart-heading.css';

type Props = {
    leftContent?: React.ReactNode,
    rightContent?: React.ReactNode,
}

export default function ChartHeading({ leftContent, rightContent }: Props) {
    return (
        <div className = { 'ChartHeading FlexSplit' } >
            { leftContent !== null && (
                <div className = { 'ChartHeadingLeft FlexRow' } > { leftContent } </div>
            ) }
            { rightContent !== null && (
                <div className = { 'ChartHeadingRight StartRight' } > { rightContent } </div>
            ) }
        </div>
    )
}

ChartHeading.defaultProps = {
    leftContent: null,
    rightContent: null,
}
