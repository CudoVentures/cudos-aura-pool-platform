import React from 'react'
import '../styles/progress-bar.css';

type Props = {
    fillPercent: number,
}

export default function Progressbar({ fillPercent }: Props) {
    return (
        <div className={ 'ProgressBar' }>
            <div className={ 'ProgressbarEmpty' }>
                <div className={ 'ProgressbarFilled'} style={{ width: `${fillPercent}%` }}></div>
            </div>
        </div>
    )
}
