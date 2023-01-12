import React from 'react';
import NavRowTabs, { createNavRowTab } from '../../../core/presentation/components/NavRowTabs';
import DefaultIntervalPickerState from '../stores/DefaultIntervalPickerState';

import '../styles/default-interval-picker.css';

type Props = {
    defaultIntervalPickerState: DefaultIntervalPickerState;
}

export default function DefaultIntervalPicker({ defaultIntervalPickerState }: Props) {

    return (
        <NavRowTabs className = { 'DefaultIntervalPicker' } navTabs={[
            createNavRowTab('Today', defaultIntervalPickerState.isActiveToday(), defaultIntervalPickerState.onChangeToday),
            createNavRowTab('7 Days', defaultIntervalPickerState.isActiveWeek(), defaultIntervalPickerState.onChangeWeek),
            createNavRowTab('30 Days', defaultIntervalPickerState.isActiveMonth(), defaultIntervalPickerState.onChangeMonth),
        ]} />
    )

}
