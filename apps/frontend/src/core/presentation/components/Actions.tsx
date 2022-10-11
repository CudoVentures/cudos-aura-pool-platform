import React from 'react';

import '../styles/actions.css';

export enum ACTIONS_LAYOUT {
    LAYOUT_ROW_LEFT,
    LAYOUT_ROW_CENTER,
    LAYOUT_ROW_RIGHT,
    LAYOUT_COLUMN_FULL,
    LAYOUT_COLUMN_CENTER,
    LAYOUT_COLUMN_LEFT,
    LAYOUT_COLUMN_RIGHT,
}

export enum ACTIONS_HEIGHT {
   HEIGHT_32,
   HEIGHT_36,
   HEIGHT_42,
   HEIGHT_48,
   HEIGHT_52,
   HEIGHT_60,
   HEIGHT_75,
}

type Props = {
    className?: string;
    height?: number;
    layout?: number;
}

export default function Actions({ className, height, layout, children }: React.PropsWithChildren < Props >) {

    function cssClassHeight() {
        switch (height) {
            case ACTIONS_HEIGHT.HEIGHT_36:
                return 'H36';
            case ACTIONS_HEIGHT.HEIGHT_42:
                return 'H42';
            case ACTIONS_HEIGHT.HEIGHT_48:
                return 'H48';
            case ACTIONS_HEIGHT.HEIGHT_52:
                return 'H52';
            case ACTIONS_HEIGHT.HEIGHT_60:
                return 'H60';
            case ACTIONS_HEIGHT.HEIGHT_75:
                return 'H75';
            case ACTIONS_HEIGHT.HEIGHT_32:
            default:
                return 'H32';
        }
    }

    function cssClassLayout() {
        switch (layout) {
            case ACTIONS_LAYOUT.LAYOUT_ROW_CENTER:
                return 'Row Center';
            case ACTIONS_LAYOUT.LAYOUT_ROW_RIGHT:
                return 'Row Right';
            case ACTIONS_LAYOUT.LAYOUT_COLUMN_CENTER:
                return 'Column Center';
            case ACTIONS_LAYOUT.LAYOUT_COLUMN_FULL:
                return 'Column Full';
            case ACTIONS_LAYOUT.LAYOUT_COLUMN_LEFT:
                return 'Column Left';
            case ACTIONS_LAYOUT.LAYOUT_COLUMN_RIGHT:
                return 'Column Right';
            case ACTIONS_LAYOUT.LAYOUT_ROW_LEFT:
            default:
                return 'Row';
        }
    }

    return (
        <div className={`Actions ${cssClassHeight()} ${cssClassLayout()} ${className}`} >
            {children}
        </div>
    );

}

Actions.defaultProps = {
    className: '',
    height: ACTIONS_HEIGHT.HEIGHT_32,
    layout: ACTIONS_LAYOUT.LAYOUT_ROW_LEFT,
}
