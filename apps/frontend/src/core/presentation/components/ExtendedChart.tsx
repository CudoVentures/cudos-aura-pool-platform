import React from 'react';
import moment from 'moment';
import { observer } from 'mobx-react';

import ProjectUtils from '../../utilities/ProjectUtils';
import ExtendedChartState from '../stores/ExtendedChartState';

import Chart, { ChartType, createBarChartDataSet } from './Chart';
import NavRowTabs, { createNavRowTab } from './NavRowTabs';

import '../styles/extended-chart.css';

class HeaderValueTab {
    label: string;
    value: string;
}

type Props = {
    className?: string;
    headerValueTabs?: HeaderValueTab[];
    headerItems?: any;
    extendedChartState: ExtendedChartState;
}

export function createHeaderValueTab(label: string, value: string): HeaderValueTab {
    const tab = new HeaderValueTab();
    tab.label = label;
    tab.value = value;
    return tab;
}

function ExtendedChart({ className, headerValueTabs, extendedChartState, headerItems }: Props) {

    function getChartLabels(): string[] {
        if (extendedChartState.isStatsToday()) {
            return ['00:00 AM', '04:00 AM', '08:00 AM', '12:00 PM', '16:00 PM', '20:00 PM'];
        }

        if (extendedChartState.isStatsWeek()) {
            const labelArray = [];

            for (let i = 7; i >= 0; i--) {
                labelArray.push(moment().subtract(i, 'days').format(ProjectUtils.MOMENT_FORMAT_DATE))
            }

            return labelArray;
        }

        if (extendedChartState.isStatsMonth()) {
            const labelArray = [];

            for (let i = 7; i >= 0; i--) {
                labelArray.push(moment().subtract(i * 4, 'days').format(ProjectUtils.MOMENT_FORMAT_DATE))
                labelArray.push('')
                labelArray.push('')
                labelArray.push('')
            }

            return labelArray;
        }

        return [];
    }

    return (
        <div className={`ExtendedChart FlexColumn ${className}`}>
            <div className={'GraphHeader FlexRow'}>
                <div className={'FlexRow DataRow'}>
                    {headerValueTabs.map((headerValueTab: HeaderValueTab) => <div key={headerValueTab.label} className={'FlexColumn SingleDataColumn'}>
                        <div className={'DataName B1 SemiBold'}>{headerValueTab.label}</div>
                        <div className={'DataValue H2 Bold'}>{headerValueTab.value}</div>
                    </div>)}
                    {headerItems}
                </div>
                <NavRowTabs navTabs={[
                    createNavRowTab('Today', extendedChartState.isStatsToday(), extendedChartState.setStatsToday),
                    createNavRowTab('7 Days', extendedChartState.isStatsWeek(), extendedChartState.setStatsWeek),
                    createNavRowTab('30 Days', extendedChartState.isStatsMonth(), extendedChartState.setStatsMonth),
                ]} />
            </div>
            <Chart
                className = { 'TheChart' }
                labels = { getChartLabels() }
                datasets = { [
                    createBarChartDataSet('set label 1', extendedChartState.statistics, '#30425A'),
                ] }
                type = { ChartType.BAR } />
        </div>
    )
}

ExtendedChart.defaultProps = {
    className: '',
    headerValueTabs: [],
    headerItems: [],
}

export default observer(ExtendedChart);
