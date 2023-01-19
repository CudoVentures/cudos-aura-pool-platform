import React, { useState } from 'react';
import moment from 'moment';
import { ReactDatePickerProps } from 'react-datepicker';

import S from '../../utilities/Main';

import Datepicker from './Datepicker';

import SvgClose from '@mui/icons-material/Close';
import '../styles/range-datepicker.css'
import Svg from './Svg';

type Props = ReactDatePickerProps & {
    datepickerState: RangeDatepickerState;
    dateRangeFormat?: string;
    emptyDateString?: string;
    onChange: any;
    label?: string;
    gray?: boolean;
    hasClear?: boolean;
    className?: string;
}

export default function RangeDatepicker({ datepickerState, dateRangeFormat, emptyDateString, onChange, label, hasClear, className, gray, ...props }: Props) {

    const [datepickerOpen, setDatepickerOpen] = useState(datepickerState.open);

    function onChangeOpen() {
        setDatepickerOpen(!datepickerOpen);
    }

    function onChangeHandler(dates) {
        const [start, end] = dates;
        const open = end === null;

        const startTime = isDateValid(start) ? start.getTime() : S.NOT_EXISTS;
        let endTime;
        if (isDateValid(end) === true) {
            if (props.showTimeInput !== true && props.showTimeSelect !== true && props.showTimeSelectOnly !== true) {
                const date = new Date(end);
                date.setDate(date.getDate() + 1);
                endTime = date.getTime() - 1;
            } else {
                endTime = end.getTime();
            }
        } else {
            endTime = S.NOT_EXISTS;
        }

        onChange(startTime, endTime);

        setDatepickerOpen(open);
    }

    function isDateValid(date) {
        return date !== null && date !== S.NOT_EXISTS;
    }

    function formatDate(date) {
        if (isDateValid(date) === true) {
            return moment(new Date(date)).format(dateRangeFormat);
        }

        if (emptyDateString !== S.Strings.EMPTY) {
            return emptyDateString;
        }

        return (
            <div dangerouslySetInnerHTML = {{ __html: '&nbsp;' }} />
        )
    }

    function onClickClearDates(e) {
        onChange(S.NOT_EXISTS, S.NOT_EXISTS);
        setDatepickerOpen(false);
        e.stopPropagation();
    }

    const cssClassGray = S.CSS.getClassName(gray, 'DatePickerInputGray');
    return (
        <Datepicker
            {...props}
            selectsRange = { true }
            // popperClassName = { 'RangeDatepickerPopper' }
            wrapperClassName = { `RangeDatepickerWrapper ${S.CSS.getClassName(props.disabled, 'Disabled')} ${className}` }
            onInputClick = {onChangeOpen}
            onClickOutside = {onChangeOpen}
            open = {datepickerOpen}
            startDate = {isDateValid(datepickerState.startDate) ? new Date(datepickerState.startDate) : null}
            endDate = {isDateValid(datepickerState.endDate) ? new Date(datepickerState.endDate) : null}
            onChange = {onChangeHandler}
            customInput = {
                <fieldset className={`DatePickerInput FlexRow FlexSplit ${cssClassGray}`}>
                    { label !== S.Strings.EMPTY && (
                        <>
                            <legend className = {'DatePickerFieldLabel'}>{ label }</legend>
                        </>
                    )}
                    <div className={'DatePickerSmallLetters'}>From</div>
                    <div className={'DatePickerInputText'}> { formatDate(datepickerState.startDate) } </div>
                    <div className={'DatePickerSmallLetters'}>To</div>
                    <div className={'DatePickerInputText'}> { formatDate(datepickerState.endDate) } </div>
                    { hasClear === false && isDateValid(datepickerState.startDate) === true && (
                        <div onClick={onClickClearDates} className={'DateClearButton StartRight SVG Clickable'}>
                            <Svg svg={SvgClose} />
                        </div>
                    ) }
                </fieldset>
            } />
    )

}

RangeDatepicker.defaultProps = {
    emptyDateString: S.Strings.EMPTY,
    dateRangeFormat: 'DD.MM.YYYY',
    label: S.Strings.EMPTY,
    hasClear: true,
    gray: false,
    className: S.Strings.EMPTY,
};

export class RangeDatepickerState {

    startDate: number;
    endDate: number;
    open: boolean;

    constructor(startDate: number = S.NOT_EXISTS, endDate: number = S.NOT_EXISTS, open = false) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.open = open;
    }

}
