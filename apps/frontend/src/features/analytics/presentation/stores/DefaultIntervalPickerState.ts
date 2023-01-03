import { action, makeAutoObservable } from 'mobx';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';

export enum DefaultIntervalType {
    TODAY = 1,
    WEEK = 2,
    MONTH = 3,
}

export default class DefaultIntervalPickerState {

    defaultIntervalType: DefaultIntervalType
    earningsTimestampFrom: number;
    earningsTimestampTo: number;
    onChangeCallback: () => void;

    constructor(onChangeCallback: () => void) {
        this.defaultIntervalType = DefaultIntervalType.TODAY;
        this.earningsTimestampFrom = 0;
        this.earningsTimestampTo = 0;
        this.onChangeCallback = onChangeCallback;
        this.markEarningsTimestampToday();

        makeAutoObservable(this);
    }

    onChangeToday = action(() => {
        this.defaultIntervalType = DefaultIntervalType.TODAY
        this.markEarningsTimestampToday();
        this.onChangeCallback();
    })

    onChangeWeek = action(() => {
        this.defaultIntervalType = DefaultIntervalType.WEEK
        this.markEarningsTimestampWeek();
        this.onChangeCallback();
    })

    onChangeMonth = action(() => {
        this.defaultIntervalType = DefaultIntervalType.MONTH
        this.markEarningsTimestampMonth();
        this.onChangeCallback();
    })

    isActiveToday() {
        return this.defaultIntervalType === DefaultIntervalType.TODAY;
    }

    isActiveWeek() {
        return this.defaultIntervalType === DefaultIntervalType.WEEK;
    }

    isActiveMonth() {
        return this.defaultIntervalType === DefaultIntervalType.MONTH;
    }

    @action
    markEarningsTimestampToday() {
        const { timestampFrom, timestampTo } = ProjectUtils.makeTimestampsToday();
        this.earningsTimestampFrom = timestampFrom;
        this.earningsTimestampTo = timestampTo;
    }

    @action
    markEarningsTimestampWeek() {
        const { timestampFrom, timestampTo } = ProjectUtils.makeTimestampsWeek();
        this.earningsTimestampFrom = timestampFrom;
        this.earningsTimestampTo = timestampTo;
    }

    @action
    markEarningsTimestampMonth() {
        const { timestampFrom, timestampTo } = ProjectUtils.makeTimestampsMonth();
        this.earningsTimestampFrom = timestampFrom;
        this.earningsTimestampTo = timestampTo;
    }
}
