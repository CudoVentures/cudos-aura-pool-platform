import React from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import '../styles/info-gray-box.css';
import Svg from './Svg';

type Props = {
    className?: string,
    text: string
}

export default function InfoGrayBox({ className, text }: Props) {
    return (
        <div className={`InfoGrayBox FlexRow ${className}`}>
            <Svg svg={ErrorOutlineIcon} />
            <div className={'B2'}>{text}</div>
        </div>
    )
}

InfoGrayBox.defaultProps = {
    className: '',
}
