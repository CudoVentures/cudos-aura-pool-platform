import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';
import { NftEventType } from './NftEventEntity';

export default class NftEventFilterModel {

    sessionAccount: number;
    nftId: string;
    miningFarmId: string;
    timestampFrom: number;
    timestampTo: number;
    eventType: NftEventType;
    from: number;
    count: number;

    constructor() {
        this.sessionAccount = S.INT_FALSE;
        this.nftId = S.Strings.NOT_EXISTS;
        this.miningFarmId = S.Strings.NOT_EXISTS;
        this.timestampFrom = S.NOT_EXISTS;
        this.timestampTo = S.NOT_EXISTS;
        this.eventType = S.NOT_EXISTS;
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;

        makeAutoObservable(this);
    }

    static toJson(model: NftEventFilterModel) {
        if (model === null) {
            return null;
        }

        return {
            sessionAccount: model.sessionAccount,
            nftId: model.nftId,
            miningFarmId: model.miningFarmId,
            timestampFrom: model.timestampFrom,
            timestampTo: model.timestampTo,
            eventType: model.eventType,
            from: model.from,
            count: model.count,
        }
    }

    static fromJson(json: any): NftEventFilterModel {
        if (json === null) {
            return null;
        }

        const model = new NftEventFilterModel();

        model.sessionAccount = parseInt(json.sessionAccount ?? model.sessionAccount);
        model.nftId = (json.nftId ?? model.nftId).toString();
        model.miningFarmId = (json.miningFarmId ?? model.miningFarmId).toString();
        model.timestampFrom = parseInt(json.timestampFrom ?? model.timestampFrom);
        model.timestampTo = parseInt(json.timestampTo ?? model.timestampTo);
        model.eventType = parseInt(json.eventType ?? model.eventType);
        model.from = parseInt(json.from ?? model.from);
        model.count = parseInt(json.count ?? model.count);

        return model;
    }

}
