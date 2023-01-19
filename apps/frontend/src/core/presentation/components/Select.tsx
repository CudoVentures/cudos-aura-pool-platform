import React, { useState, useEffect } from 'react';
import { Select as MuiSelect, SelectProps, InputLabel, FormControl, SelectChangeEvent, FormHelperText } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import '../styles/select.css';
import { InputValidation } from '../stores/ValidationState';
import { observer } from 'mobx-react';
import S from '../../utilities/Main';

type Props = SelectProps & {
    className?: string;
    onChange?: (value: any) => (boolean | void);
    label?: string;
    innerLabel?: string;
    readOnly?: boolean;
    error?: boolean;
    gray?: boolean;
    inputValidation?: InputValidation | InputValidation[],
}

function Select({ className, margin, onChange, innerLabel, label, readOnly, error, gray, inputValidation, ...props }: Props) {

    const [open, setOpen] = useState(false);

    useEffect(() => {
        document.addEventListener('wheel', onPreventableScroll, { passive: false });
        document.addEventListener('touchmove', onPreventableScroll, { passive: false });
        document.addEventListener('scroll', onUnpreventableScroll);

        return () => {
            document.removeEventListener('wheel', onPreventableScroll);
            document.removeEventListener('touchmove', onPreventableScroll);
            document.removeEventListener('scroll', onUnpreventableScroll);
        }
    });

    useEffect(() => {
        if (inputValidation !== null) {
            if (props.multiple === undefined || props.multiple === false) {
                if (props.value !== null) {
                    const value = props.value;
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
                inputValidation.forEach((validation) => onChange(null));
            } else {
                inputValidation.onChange(null);
            }
        }
    }, [props.value]);

    function onChangeHandler(e: SelectChangeEvent<unknown>) {
        if (onChange !== undefined) {
            onChange(e.target.value);
        }
    }

    function onPreventableScroll(e) {
        if (open === true) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    function onUnpreventableScroll() {
        if (open === true) {
            onClose();
        }
    }

    function onOpen() {
        setOpen(true);
    }

    function onClose() {
        setOpen(false);
        setTimeout(() => {
            document.activeElement.blur();
        }, 0);
    }

    function isErrorPresent(): boolean {
        if (inputValidation !== null) {
            if (Array.isArray(inputValidation)) {
                return inputValidation.find((validation) => validation.isError === true) !== undefined;
            }

            return inputValidation.isError;
        }

        return false;
    }

    function getErrorMessage(): string {
        if (inputValidation !== null) {

            if (Array.isArray(inputValidation)) {
                return inputValidation.filter((validation) => validation.isError === true && validation.errorMessage !== S.Strings.EMPTY)
                    .map((validation) => validation.errorMessage).join(', ');
            }

            if (inputValidation.isError) {
                return inputValidation.errorMessage;
            }
        }

        return S.Strings.EMPTY;
    }

    function shouldShowError(): boolean {
        if (inputValidation !== null) {
            if (Array.isArray(inputValidation)) {
                return inputValidation.find((validation) => validation.showError === true) !== undefined;
            }

            return inputValidation.showError;
        }

        return false;
    }

    const cssClassGray = S.CSS.getClassName(gray, 'SelectGray');
    return (
        <div className = { `Select ${cssClassGray} ${className}` }>
            <FormControl variant = 'standard' margin = { 'dense' }>
                { label !== undefined && (
                    <InputLabel
                        error = { error || (shouldShowError() && isErrorPresent()) }
                        variant = { 'standard' }
                        margin = { 'dense' } >
                        { label }
                    </InputLabel>
                ) }
                <MuiSelect
                    { ...props }
                    onChange = { onChange !== null && readOnly !== true ? onChangeHandler : undefined }
                    onOpen = { onOpen }
                    onClose = { onClose }
                    open = { open }
                    IconComponent = { KeyboardArrowDownIcon }
                    margin = { 'dense' }
                    MenuProps = {{
                        disableScrollLock: true,
                        PopoverClasses: {
                            root: 'AppSelectRoot',
                            paper: 'AppSelectPaper',
                        },
                    }}

                    variant = { 'standard' } />
                {shouldShowError() && isErrorPresent() && (<FormHelperText>{getErrorMessage()}</FormHelperText>)}
            </FormControl>
        </div>
    )
}

Select.defaultProps = {
    className: '',
    onChange: undefined,
    readOnly: false,
    error: false,
    gray: false,
    inputValidation: null,
}

export default observer(Select);
