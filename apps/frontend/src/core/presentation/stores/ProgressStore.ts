import { makeAutoObservable } from 'mobx';
import React from 'react';
import S from '../../utilities/Main';

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
        return `${(this.progress * 100).toFixed(2)} %`;
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
