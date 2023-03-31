import { makeAutoObservable } from 'mobx';
import React from 'react';
import S from '../../utilities/Main';
import { formatPercent } from '../../utilities/NumberFormatter';

export default class ProgressStore {

    title: string | React.ReactNode;
    progress: number;

    constructor() {
        this.progress = S.NOT_EXISTS;
        this.title = '';

        makeAutoObservable(this);
    }

    isVisible() {
        return this.progress !== S.NOT_EXISTS;
    }

    formatProgressInPercentage(): string {
        return formatPercent(this.progress * 100, true);
    }

    onProgress = (title: string, progress: number) => {
        this.title = title;
        this.progress = progress;
    }

    getProgressBarStyle() {
        return {
            'transform': `scaleX(${this.progress === S.NOT_EXISTS ? 0 : this.progress})`,
        }
    }

}
