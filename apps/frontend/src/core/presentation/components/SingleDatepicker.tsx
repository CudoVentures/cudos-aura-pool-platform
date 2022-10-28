import React, { useEffect } from 'react';
import { ReactDatePickerProps } from 'react-datepicker';

import S from '../../utilities/Main';

import Datepicker from './Datepicker';
import Input from './Input';

import SvgClose from '@mui/icons-material/Close';
import Svg from './Svg';
import { InputValidation } from '../stores/ValidationState';
import { observer } from 'mobx-react-lite';

type Props = ReactDatePickerProps & {
    label?: string;
    inputValidation?: InputValidation | InputValidation[],
}

function SingleDatepicker({ label, inputValidation, ...props }: Props) {

    const isDateValid = () => {
        return props.selected !== null;
    }

    const onClickClear = (e) => {
        props.onChange(null, e);
        e.stopPropagation();
    }

    const renderInputProps = () => {
        if (props.readOnly === true || isDateValid() === false) {
            return undefined;
        }

        return {
            'endAdornment': (
                <div className={'DateClearButton StartRight SVG Clickable'} onClick = { onClickClear } >
                    <Svg svg={SvgClose} />
                </div>
            ),
        }
    }

    useEffect(() => {
        if (inputValidation !== null) {
            const value = props.value;
            if (props.value !== null) {
                if (Array.isArray(inputValidation)) {
                    inputValidation.forEach((validation) => validation.onChange(value));
                } else if (inputValidation !== null) {
                    inputValidation.onChange(value);
                }

                return;
            }

            inputValidation.onChange(null);
        }
    }, [props.value]);

    return (
        <Datepicker {...props}
            dateFormat = { props.dateFormat ?? 'dd.MM.yyyy' }
            injectTimes = {[
                setTime(23, 59),
            ]}
            customInput = {
                <Input
                    defaultOnChangeParameter = { true }
                    label = { label }
                    inputValidation = { inputValidation }
                    InputProps = { renderInputProps() } />
            } />
    )

}

SingleDatepicker.defaultProps = {
    label: S.Strings.EMPTY,
    inputValidation: null,
};

export default observer(SingleDatepicker);

function setTime(hours, minutes): Date {
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
}
