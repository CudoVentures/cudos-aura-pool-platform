import { makeAutoObservable } from 'mobx';
import S from '../../core/utilities/Main';
import { NftEventType } from './NftEventEntity';

export default class MegaWalletEventFilterModel {

    timestampFrom: number;
    timestampTo: number;
    eventTypes: NftEventType[];
    from: number;
    count: number;

    constructor() {
        this.timestampFrom = S.NOT_EXISTS;
        this.timestampTo = S.NOT_EXISTS;
        this.eventTypes = null;
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;

        makeAutoObservable(this);
    }

    static toJson(model: MegaWalletEventFilterModel) {
        if (model === null) {
            return null;
        }

        return {
            'timestampFrom': model.timestampFrom,
            'timestampTo': model.timestampTo,
            'eventTypes': model.eventTypes,
            'from': model.from,
            'count': model.count,
        }
    }

}
