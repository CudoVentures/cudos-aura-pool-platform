import React from 'react';
import S from '../../utilities/Main';
import '../styles/slider.css';

type Props = {
    className?: string;
    maxItems?: number;
}

export default function Slider({ children, className, maxItems }: React.PropsWithChildren< Props >) {
    return (
        <div className={`Slider FlexRow RightShadow ${className} ${S.CSS.getClassName(maxItems === 3, 'Items3')} ${S.CSS.getClassName(maxItems === 4, 'Items4')}`}>
            {children}
        </div>
    )
}
Slider.defaultProps = {
    className: '',
    maxItems: 4,
}
