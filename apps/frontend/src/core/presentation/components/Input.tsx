import React, { ChangeEvent, PropsWithChildren, useEffect, useRef } from 'react';
import { observer } from 'mobx-react';

import S from '../../utilities/Main';
import { InputValidation } from '../stores/ValidationState';

import TextField, { TextFieldProps } from '@mui/material/TextField/TextField';
import '../styles/input.css';
import { action } from 'mobx';

export enum InputType {
    INTEGER = 1,
    POSITIVE_INTEGER = 2,
    REAL = 3,
    POSITIVE_REAL = 4,
    TEXT = 5,
    PHONE = 6,
}

type Props = TextFieldProps & PropsWithChildren & {
    className?: string;
    inputType?: InputType;
    decimalLength?: number;
    readOnly?: boolean;
    underline?: boolean;
    onChange?: null | ((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => boolean | void);
    stretch?: boolean;
    gray?: boolean;
    defaultOnChangeParameter?: boolean,
    inputValidation?: InputValidation | InputValidation[],
    centered?: boolean;
}

const Input = React.forwardRef(({ children, centered, className, inputType, decimalLength, readOnly, underline, onChange, stretch, gray, defaultOnChangeParameter, inputValidation, ...props }: Props, ref) => {

    const changed = useRef(false);

    useEffect(action(() => {
        if (props.value !== undefined) {
            if (Array.isArray(inputValidation)) {
                inputValidation.forEach((validation) => validation.onChange(props.value));
            } else if (inputValidation !== null) {
                inputValidation.onChange(props.value);
            }
        }

        if (changed.current === true) {
            if (inputValidation !== null) {
                if (Array.isArray(inputValidation)) {
                    inputValidation.forEach((validation) => {
                        validation.showError = true;
                    });
                } else {
                    inputValidation.showError = true;
                }
            }
        }
    }), [props.value]);

    /* listeners */
    function onChangeHandler(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        changed.current = true;

        switch (inputType) {
            case InputType.INTEGER:
                if (filterInteger(event.target.value) === false) {
                    return;
                }
                break;
            case InputType.POSITIVE_INTEGER:
                if (filterPositiveInteger(event.target.value) === false) {
                    return;
                }
                break;
            case InputType.REAL:
                if (filterReal(event.target.value, decimalLength) === false) {
                    return;
                }
                break;
            case InputType.POSITIVE_REAL:
                if (filterPositiveReal(event.target.value, decimalLength) === false) {
                    return;
                }
                break;
            case InputType.PHONE:
                if (filterPhone(event.target.value) === false) {
                    return;
                }
                break;
            default:
                break;
        }

        if (onChange !== null) {
            onChange(defaultOnChangeParameter === true ? event : event.target.value);
        }
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

    const cssClassStretch = S.CSS.getClassName(stretch, 'InputStretch');
    const cssClassGray = S.CSS.getClassName(gray, 'InputGray');
    const error = shouldShowError() && isErrorPresent();
    return (
        <div ref = { ref } className={`Input ${className} ${cssClassStretch} ${cssClassGray} ${S.CSS.getClassName(readOnly, 'ReadOnly')} ${S.CSS.getClassName(underline, 'Underline')}`}>
            <TextField
                {...props}
                error={error}
                inputProps={ { style: { textAlign: centered ? 'center' : 'left' } }} // the change is here
                helperText={error ? getErrorMessage() : '' }
                hiddenLabel = { false }
                onChange={onChange !== null && readOnly !== true ? onChangeHandler : undefined}
                margin='dense'
                variant='standard' />
            <div className={'UnderlineHolder'}>{children}</div>
        </div>
    )
});

Input.displayName = 'Input';

Input.defaultProps = {
    className: '',
    centered: false,
    inputType: InputType.TEXT,
    decimalLength: 4,
    readOnly: false,
    onChange: null,
    stretch: false,
    gray: false,
    defaultOnChangeParameter: false,
    inputValidation: null,
}

export default (observer(Input));

function filterInteger(value: string) {
    if (value.length === 0) {
        return true;
    }

    for (let c, i = value.length; i-- > 0;) {
        c = value[i];
        if (c === '+' || c === '-') {
            return i === 0;
        }
        if (c >= '0' && c <= '9') {
            continue;
        }

        return false;
    }

    return true;
}

function filterPositiveInteger(value: string) {
    if (value.length === 0) {
        return true;
    }

    for (let c, i = value.length; i-- > 0;) {
        c = value[i];
        if (c >= '0' && c <= '9') {
            continue;
        }

        return false;
    }

    return true;
}

function filterReal(value: string, decimalLength: number) {
    if (value.length === 0) {
        return true;
    }

    let delimiter = false;
    let currentDecimalLength = 0;
    for (let c, i = 0; i < value.length; ++i) {
        c = value[i];
        if (c === '+' || c === '-') {
            if (i === 0) {
                continue;
            }
        }
        if (c >= '0' && c <= '9') {
            if (delimiter === true) {
                ++currentDecimalLength;
                if (decimalLength < currentDecimalLength) {
                    return false;
                }
            }
            continue;
        }
        if (c === '.') {
            if (delimiter === true) {
                return false;
            }
            delimiter = true;
            continue;
        }

        return false;
    }

    return true;
}

function filterPositiveReal(value: string, decimalLength: number) {
    if (value.length === 0) {
        return true;
    }

    let delimiter = false;
    let currentDecimalLength = 0;
    for (let c, i = 0; i < value.length; ++i) {
        c = value[i];
        if (c >= '0' && c <= '9') {
            if (delimiter === true) {
                ++currentDecimalLength;
                if (decimalLength < currentDecimalLength) {
                    return false;
                }
            }
            continue;
        }
        if (c === '.') {
            if (delimiter === true) {
                return false;
            }
            delimiter = true;
            continue;
        }

        return false;
    }

    return true;
}

function filterPhone(value: string) {
    if (value.length === 0) {
        return true;
    }

    let plus = false;
    for (let c, i = value.length; i-- > 0;) {
        c = value[i];
        if (c === '+') {
            if (plus === true || i !== 0) {
                return false;
            }
            plus = true;
            continue;
        }
        if (c >= '0' && c <= '9') {
            continue;
        }
        if (c === ' ') {
            continue;
        }

        return false;
    }

    return true;
}
