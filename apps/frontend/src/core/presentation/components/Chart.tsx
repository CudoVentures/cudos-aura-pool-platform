import React, { useEffect, useRef } from 'react';
import { Chart as ChartJs, Color, registerables } from 'chart.js';

import '../styles/chart.css';
import { formatBtc } from '../../utilities/NumberFormatter';

ChartJs.register(...registerables);

ChartJs.defaults.maintainAspectRatio = false;
ChartJs.defaults.plugins.legend.display = false;
ChartJs.defaults.plugins.tooltip.enabled = false;
ChartJs.defaults.scale.grid.display = false;
ChartJs.defaults.scale.ticks.autoSkip = true;
ChartJs.defaults.scale.ticks.maxRotation = 0;

export enum ChartType {
    LINE = 'line',
    PIE = 'pie',
    BAR = 'bar'
}

type Props = {
    className?: string;
    labels: any;
    datasets: any;
    type: ChartType;
    yAxisFormatter?: (label: number | string) => string;
}

export function createChartDataSet(label, data, backgroundColor) {
    return { label, data, backgroundColor };
}

export function createLineChartDataSet(label: string, data: number[], color: Color) {
    return {
        'label': label,
        'data': data,
        'borderColor': color,
        'backgroundColor': '#262b3110',
        'pointBackgroundColor': '#2AD791',
        'pointBorderColor': '#2AD791',
    }
}

export function createPieChartDataSet(label: string, data: number[], colors: Color[]) {
    return {
        'label': label,
        'data': data,
        'borderColor': colors,
        'backgroundColor': colors,
        'pointBackgroundColor': 'transparent',
        'pointBorderColor': 'transparent',
    }
}

export function createBarChartDataSet(label: string, data: number[], colors: Color | Color[]) {
    return {
        'label': label,
        'data': data,
        'backgroundColor': colors,
    }
}

export default function Chart({ className, labels, datasets, type, yAxisFormatter }: Props) {

    const rootNode = useRef(null);
    const canvasNode = useRef(null);

    const self = useRef({
        ctx: null,
        chart: null,
    }).current;

    useEffect(() => {
        if (self.ctx === null) {
            self.ctx = canvasNode.current.getContext('2d');
            self.chart = new ChartJs(self.ctx, {
                'type': type,
                'data': {
                    'labels': [],
                    'datasets': [],
                },
            });
        }

        self.chart.data.labels = labels;
        self.chart.data.datasets = datasets;
        self.chart.options.scales.y = {
            ticks: {
                callback(label, index, labels) {
                    if (yAxisFormatter !== null) {
                        return yAxisFormatter(label);
                    }

                    return label;
                },
            },
        };

        self.chart.update();
    });

    return (
        <div
            ref = { rootNode }
            className = { `Chart ${className}` } >

            <div className = { 'CanvasWrapper' } >

                <canvas ref = { canvasNode } />

            </div>

        </div>
    )
}

Chart.defaultProps = {
    'className': '',
    'yAxisFormatter': null,
};
