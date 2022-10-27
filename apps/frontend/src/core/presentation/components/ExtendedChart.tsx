import { observer } from 'mobx-react';
import moment from 'moment';
import { string } from 'prop-types';
import React from 'react';
import ProjectUtils from '../../utilities/ProjectUtils';
import ExtendedChartState from '../stores/ExtendedChartState';
import Chart, { ChartType, createBarChartDataSet } from './Chart';
import NavRowTabs, { createNavRowTab } from './NavRowTabs';
import StyledContainer, { ContainerPadding } from './StyledContainer';
import '../styles/extended-chart.css';

class HeaderValueTab {
    label: string;
    value: string;
}

type Props = {
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

function ExtendedChart({ headerValueTabs, extendedChartState, headerItems }: Props) {

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
        <StyledContainer className={'ExtendedChart'} containerPadding={ContainerPadding.PADDING_24}>
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
                labels = { getChartLabels() }
                datasets = { [
                    createBarChartDataSet('set label 1', extendedChartState.statistics, '#30425A'),
                ] }
                type = { ChartType.BAR } />
        </StyledContainer>
    )
}

ExtendedChart.defaultProps = {
    headerValueTabs: [],
    headerItems: [],
}

export default observer(ExtendedChart);
