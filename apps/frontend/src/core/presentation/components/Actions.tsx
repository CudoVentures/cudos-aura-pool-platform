import React from 'react';

import '../styles/actions.css';

/* each member of the enum corresponds to a CSS class */
export enum ACTIONS_LAYOUT {
    LAYOUT_ROW_LEFT = 'Row',
    LAYOUT_ROW_CENTER = 'Row Center',
    LAYOUT_ROW_RIGHT = 'Row Right',
    LAYOUT_COLUMN_FULL = 'Column Full',
    LAYOUT_COLUMN_CENTER = 'Column Center',
    LAYOUT_COLUMN_LEFT = 'Column Left',
    LAYOUT_COLUMN_RIGHT = 'Column Right',
}

/* each member of the enum corresponds to a CSS class */
export enum ACTIONS_HEIGHT {
   HEIGHT_32 = 'H32',
   HEIGHT_36 = 'H36',
   HEIGHT_42 = 'H42',
   HEIGHT_48 = 'H48',
   HEIGHT_52 = 'H52',
   HEIGHT_60 = 'H60',
   HEIGHT_75 = 'H75',
}

type Props = {
    className?: string;
    height?: ACTIONS_HEIGHT;
    layout?: ACTIONS_LAYOUT;
}

export default function Actions({ className, height, layout, children }: React.PropsWithChildren < Props >) {

    return (
        <div className={`Actions ${height} ${layout} ${className}`} >
            {children}
        </div>
    );

}

Actions.defaultProps = {
    className: '',
    height: ACTIONS_HEIGHT.HEIGHT_32,
    layout: ACTIONS_LAYOUT.LAYOUT_ROW_LEFT,
}
