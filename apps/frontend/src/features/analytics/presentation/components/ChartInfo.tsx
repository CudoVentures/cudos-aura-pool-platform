import React from 'react';

import '../styles/chart-info.css';

type Props = {
    label: string;
    value: string;
}

export default function ChartInfo({ label, value }: Props) {

    return (
        <div className={'ChartInfo'}>
            <div className={'ChartInfoName B1 SemiBold'}>{label}</div>
            <div className={'ChartInfoValue H2 Bold'}>{value}</div>
        </div>
    )

}
