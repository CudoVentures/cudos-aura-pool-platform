import React from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import '../styles/info-gray-box.css';
import Svg from './Svg';

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
