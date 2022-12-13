import React from 'react';

import Svg from './Svg';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import '../styles/info-blue-box.css';

type Props = {
    className?: string,
    text: string
}

export default function InfoBlueBox({ className, text }: Props) {
    return (
        <div className={`InfoBlueBox FlexRow ${className}`}>
            <Svg svg={ErrorOutlineIcon} />
            <div className={'B2'}>{text}</div>
        </div>
    )
}

InfoBlueBox.defaultProps = {
    className: '',
}
