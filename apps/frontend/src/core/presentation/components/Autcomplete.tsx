import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import MuiAutocomplete, { AutocompleteProps } from '@mui/material/Autocomplete/Autocomplete';

import S from '../../utilities/Main';
import { InputValidation } from '../stores/ValidationState';

import AutocompleteOption from '../../entities/AutocompleteOption';
import Input from './Input';
import Svg from './Svg';

import SvgClear from '@mui/icons-material/Clear';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import '../styles/autcomplete.css';

type Props = AutocompleteProps < AutocompleteOption, true, true, false > & {
    label?: string | React.ReactNode;
    error?: boolean;
    readOnly?: boolean;
    inputValidation?: InputValidation | InputValidation[],
}

function Autocomplete({ className, readOnly, error, label, inputValidation, ...props }: Props) {

    function onChange(event, value, reason) {
        if (props.onChange !== null) {
            props.onChange(value, event, reason);
        }
    }

    useEffect(() => {
        if (inputValidation !== null) {
            if (props.multiple === undefined || props.multiple === false) {
                if (props.value !== null) {
                    const value = props.value.value;
                    if (Array.isArray(inputValidation)) {
                        inputValidation.forEach((validation) => validation.onChange(value));
                    } else if (inputValidation !== null) {
                        inputValidation.onChange(value);
                    }

                    return;
                }
            } else if (props.value.length !== 0) {
                props.value.forEach((option) => {
                    if (Array.isArray(inputValidation)) {
                        inputValidation.forEach((validation) => validation.onChange(option.value));
                    } else if (inputValidation !== null) {
                        inputValidation.onChange(option.value);
                    }
                });
                return;
            }

            if (Array.isArray(inputValidation)) {
                inputValidation.forEach((validation) => onChange(null, null, ''));
            } else {
                inputValidation.onChange(null);
            }
        }
    }, [props.value]);

    return (
        <div className = { `Autocomplete ${className} ${S.CSS.getClassName(readOnly, 'ReadOnly')}` } >
            <MuiAutocomplete
                {...props}
                clearIcon = { <AutocompleteClearIcon /> }
                popupIcon = { <AutocompletePopupIcon /> }
                ChipProps = { {
                    deleteIcon: <AutocompleteClearIcon />,
                } }
                onChange = { props.onChange !== null && readOnly !== true ? onChange : null }
                getOptionLabel = { getOptionLabel }
                isOptionEqualToValue = { isOptionEqualToValue }
                classes = { {
                    popper: 'AppAutocompletePopup',
                } }
                renderInput = { (params) => (
                    <Input
                        { ...params }
                        inputValidation = { inputValidation}
                        label = { label }/>
                )} />
        </div>
    );
}

Autocomplete.defaultProps = {
    className: '',
    filterSelectedOptions: true,
    label: '',
    error: false,
    readOnly: false,
    inputValidation: null,
};

export default observer(Autocomplete);

function getOptionLabel(option: AutocompleteOption) {
    return option.label;
}

function isOptionEqualToValue(option: AutocompleteOption, value: AutocompleteOption) {
    return option.value === value.value;
}

function AutocompleteClearIcon(props) {

    return (
        <Svg {...props} svg = { SvgClear } />
    )

}

function AutocompletePopupIcon(props) {

    return (
        <Svg {...props} svg = { KeyboardArrowDownIcon } />
    )

}
