import React from 'react';
import S from '../../utilities/Main';

import SvgCheckbox from '@mui/icons-material/Check';
import Svg, { SvgSize } from './Svg';
import '../styles/checkbox.css';

enum CheckboxBoolValue {
    TRUE = S.INT_TRUE,
    FALSE = S.INT_FALSE,
}

type Props = {
    className?: string;
    error?: boolean,
    readOnly?: boolean;
    label: string | React.ReactNode;
    value: CheckboxBoolValue;
    onChange: (value: number, e?: any) => void;
}

export default function Checkbox({ className, label, value, readOnly, error, onChange }: Props) {

    function onChangeHandler(e) {
        if (readOnly === false) {
            onChange(value ^ 1, e);
        }
    }

    return (
        <div
            className = { `CheckboxComponent FlexRow Clickable ${S.CSS.getClassName(error, 'Error')} ${S.CSS.getActiveClassName(value === CheckboxBoolValue.TRUE)} ${S.CSS.getClassName(readOnly, 'ReadOnly')} ${className}` }
            onClick = { onChangeHandler } >

            <Svg className = { 'Transition Checkbox FlexSingleCenter' } size = { SvgSize.CUSTOM } svg = { SvgCheckbox } />
            { label }

        </div>
    );

}

Checkbox.defaultProps = {
    className: S.Strings.EMPTY,
    readOnly: false,
    error: false,
}
