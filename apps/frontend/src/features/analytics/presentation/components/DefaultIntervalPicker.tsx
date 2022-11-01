import React from 'react';
import NavRowTabs, { createNavRowTab } from '../../../../core/presentation/components/NavRowTabs';

import '../styles/default-interval-picker.css';

export enum DefaultIntervalType {
    TODAY = 1,
    WEEK = 2,
    MONTH = 3,
}

type Props = {
    selectedIntervalType: DefaultIntervalType,
    onClickToday: () => void;
    onClickWeek: () => void;
    onClickMonth: () => void;
}

export default function DefaultIntervalPicker({ selectedIntervalType, onClickToday, onClickWeek, onClickMonth }: Props) {

    function isActiveToday() {
        return selectedIntervalType === DefaultIntervalType.TODAY;
    }

    function isActiveWeek() {
        return selectedIntervalType === DefaultIntervalType.WEEK;
    }

    function isActiveMonth() {
        return selectedIntervalType === DefaultIntervalType.MONTH;
    }

    return (
        <NavRowTabs className = { 'DefaultIntervalPicker' } navTabs={[
            createNavRowTab('Today', isActiveToday(), onClickToday),
            createNavRowTab('7 Days', isActiveWeek(), onClickWeek),
            createNavRowTab('30 Days', isActiveMonth(), onClickMonth),
        ]} />
    )

}
