import { makeAutoObservable } from 'mobx';

enum StatPeriod {
    TODAY = 1,
    WEEK = 2,
    MONTH = 3
}

export default class ExtendedChartState {
    statPeriod: StatPeriod;
    statistics: number[];
    callback: (timestamp: number) => Promise < number[] >

    constructor(callback: (timestamp: number) => Promise < number[] >) {
        this.callback = callback;

        this.statPeriod = StatPeriod.TODAY;
        this.statistics = [];

        makeAutoObservable(this);
    }

    init() {
        this.statPeriod = StatPeriod.TODAY;
        this.statistics = [];
        this.fetch();
    }

    async fetch() {
        let timestamp = 0;
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;
        const week = day * 7;
        const month = day * 20;

        switch (this.statPeriod) {
            case StatPeriod.WEEK:
                timestamp = now - week;
                break;
            case StatPeriod.MONTH:
                timestamp = now - month;
                break;
            case StatPeriod.TODAY:
            default:
                timestamp = now - day;
        }

        this.statistics = await this.callback(timestamp);
    }

    isStatsToday(): boolean {
        return this.statPeriod === StatPeriod.TODAY;
    }

    isStatsWeek(): boolean {
        return this.statPeriod === StatPeriod.WEEK;
    }

    isStatsMonth(): boolean {
        return this.statPeriod === StatPeriod.MONTH;
    }

    setStatsToday = () => {
        this.statPeriod = StatPeriod.TODAY;
        this.fetch();
    }

    setStatsWeek = () => {
        this.statPeriod = StatPeriod.WEEK;
        this.fetch();
    }

    setStatsMonth = () => {
        this.statPeriod = StatPeriod.MONTH;
        this.fetch();
    }
}
