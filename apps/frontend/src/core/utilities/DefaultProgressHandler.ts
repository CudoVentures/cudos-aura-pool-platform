import { AxiosProgressEvent } from 'axios';
import S from './Main';

export default class DefaultProgressHandler {

    start: number;
    uploadingTitle: string;
    simulationTitle: string;
    presentationOnProgress: (title: string, progress: number) => void

    constructor(uploadingTitle: string, simulationTitle: string, presentationOnProgress: (title: string, progress: number) => void) {
        this.start = S.NOT_EXISTS;
        this.uploadingTitle = uploadingTitle;
        this.simulationTitle = simulationTitle;
        this.presentationOnProgress = presentationOnProgress;
    }

    hasStart(): boolean {
        return this.start !== S.NOT_EXISTS;
    }

    finish() {
        this.start = S.NOT_EXISTS;
        this.presentationOnProgress('', S.NOT_EXISTS);
    }

    onProgress = (progressEvent: AxiosProgressEvent) => {
        if (this.hasStart() === false) {
            this.start = Date.now();
        }

        this.presentationOnProgress(this.uploadingTitle, progressEvent.progress / 2);
        if (progressEvent.progress === 1) {
            const end = Date.now();
            const duration = end - this.start;
            const backendUpdate = () => {
                if (this.hasStart() === false) {
                    return;
                }

                const simulation = (Date.now() - end) / duration;
                let finalProgress = 0.5 + simulation / 2;
                if (finalProgress > 0.9999) {
                    finalProgress = 0.9999;
                } else {
                    requestAnimationFrame(backendUpdate);
                }
                this.presentationOnProgress(this.simulationTitle, finalProgress);
            }
            requestAnimationFrame(backendUpdate);
        }
    }

}
