import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';
import { NftEventType } from './NftEventEntity';

export default class NftEventFilterModel {

    sessionAccount: number;
    nftId: string;
    miningFarmId: string;
    timestampFrom: number;
    timestampTo: number;
    eventTypes: NftEventType[];
    from: number;
    count: number;

    constructor() {
        this.sessionAccount = S.INT_FALSE;
        this.nftId = S.Strings.NOT_EXISTS;
        this.miningFarmId = S.Strings.NOT_EXISTS;
        this.timestampFrom = S.NOT_EXISTS;
        this.timestampTo = S.NOT_EXISTS;
        this.eventTypes = null;
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;

        makeAutoObservable(this);
    }

    static toJson(model: NftEventFilterModel) {
        if (model === null) {
            return null;
        }

        return {
            'sessionAccount': model.sessionAccount,
            'nftId': model.nftId,
            'miningFarmId': model.miningFarmId,
            'timestampFrom': model.timestampFrom,
            'timestampTo': model.timestampTo,
            'eventTypes': model.eventTypes,
            'from': model.from,
            'count': model.count,
        }
    }

}
