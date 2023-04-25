import React from 'react';

import SvgInfo from '@mui/icons-material/InfoOutlined';
import Tooltip from './Tooltip';
import Svg, { SvgSize } from './Svg';

import '../styles/text-with-tooltip.css';

// using css classes
export enum TextWithTooltipType {
    DEFAULT = '',
    WARNING = 'TextWithTooltipTypeWarning',
}

type Props = {
    className?: string;
    text?: string;
    tooltipText?: string;
    type?: TextWithTooltipType;
}

export default function TextWithTooltip({ className, text, tooltipText, type }: Props) {

    return (
        <div className={`FlexRow TextWithTooltip ${type} ${className}`}>
            <div className={'TooltipText'} > {text} </div>
            <Tooltip title = { tooltipText } >
                <Svg className = { 'SvgTooltip' } size = { SvgSize.CUSTOM } svg = { SvgInfo } />
            </Tooltip>
        </div>
    );
}

TextWithTooltip.defaultProps = {
    className: '',
    text: '',
    tooltipText: '',
    type: TextWithTooltipType.DEFAULT,
}
