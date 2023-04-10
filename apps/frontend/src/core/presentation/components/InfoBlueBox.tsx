import React from 'react';

import Svg from './Svg';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import '../styles/info-blue-box.css';

export enum InfoAlignment {
    TOP = '1',
    CENTER = '2',
    BOTTOM = '3',
}

type Props = {
    className?: string,
    text?: string
    alignment?: InfoAlignment
}

export default function InfoBlueBox({ className, text, alignment, children }: React.PropsWithChildren<Props>) {
    function cssAlignment() {
        switch (alignment) {
            case InfoAlignment.TOP:
                return 'Top';
            case InfoAlignment.BOTTOM:
                return 'Bottom';
            case InfoAlignment.CENTER:
            default:
                return 'Center';
        }
    }

    return (
        <div className={`InfoBlueBox FlexRow ${className} ${cssAlignment()}`}>
            <Svg svg={ErrorOutlineIcon} />
            <div className={'B2'}>{text}</div>
            <div className={'B2'}>{children}</div>
        </div>
    )
}

InfoBlueBox.defaultProps = {
    className: '',
    text: '',
    alignment: InfoAlignment.CENTER,
}
