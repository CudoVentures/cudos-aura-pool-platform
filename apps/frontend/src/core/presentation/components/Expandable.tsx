import React, { useState } from 'react';
import { Collapse } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Svg from './Svg';
import '../styles/expandable.css';

type Props = {
    title: React.ReactNode;
    defaultExpanded?: boolean;
    timeout?: number;
    collapsedSize?: number;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

export default function Expandable({ title, timeout, defaultExpanded, collapsedSize, children, orientation, className }: React.PropsWithChildren<Props>) {
    const [shouldBeExpanded, setShouldBeExpanded] = useState(defaultExpanded);

    return (
        <div className={`Expandable ${className}`}>
            <div
                style={{ msTransitionDuration: `${timeout}` }}
                className={'ExpandableHeader Clickable FlexRow'}
                onClick={() => {
                    setShouldBeExpanded(!shouldBeExpanded);
                }}>
                {title}
                <Svg svg={shouldBeExpanded ? KeyboardArrowDownIcon : KeyboardArrowUpIcon} />
            </div>
            <Collapse
                className={'ExpandableContent'}
                in={shouldBeExpanded}
                timeout={timeout}
                collapsedSize={collapsedSize}
                orientation={orientation}>
                {children}
            </Collapse>
        </div>
    )
}

Expandable.defaultProps = {
    expanded: false,
    timeout: 300,
    collapsedSize: 0,
    orientation: 'vertical',
}
