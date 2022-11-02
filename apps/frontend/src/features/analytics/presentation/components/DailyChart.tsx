import moment from 'moment';
import React from 'react';
import Chart, { ChartType, createBarChartDataSet } from '../../../../core/presentation/components/Chart';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';

import '../styles/daily-chart.css';

type Props = {
    className?: string;
    timestampFrom: number,
    timestampTo: number,
    data: number[],
}

export default function DailyChart({ className, timestampFrom, timestampTo, data }: Props) {

    function calculatedLabels() {
        return data.map((number, i) => {
            const date = new Date(timestampFrom);
            date.setDate(date.getDate() + i);
            return moment().format(ProjectUtils.MOMENT_FORMAT_DATE);
        });
    }

    return (
        <Chart
            className = { `DailyChart ${className}` }
            labels = { calculatedLabels() }
            datasets = { [
                createBarChartDataSet('', data, '#30425A'),
            ] }
            type = { ChartType.BAR } />
    )

}

DailyChart.defaultProps = {
    className: '',
};
