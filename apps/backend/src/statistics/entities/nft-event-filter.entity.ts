import { IntBoolValue, NOT_EXISTS_INT, NOT_EXISTS_STRING } from '../../common/utils';
import { NftEventFilterValidationJson } from '../statistics.types';
import { NftTransferHistoryEventType } from './nft-event.entity';

export default class NftEventFilterEntity {
    sessionAccount: IntBoolValue;
    nftId: string;
    eventTypes: NftTransferHistoryEventType[];
    timestampFrom: number;
    timestampTo: number;
    from: number;
    count: number;

    constructor() {
        this.sessionAccount = IntBoolValue.FALSE;
        this.nftId = NOT_EXISTS_STRING;
        this.eventTypes = null;
        this.timestampFrom = NOT_EXISTS_INT;
        this.timestampTo = NOT_EXISTS_INT;
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;
    }

    isPlatformFilter(): boolean {
        return this.sessionAccount === IntBoolValue.FALSE && this.nftId === NOT_EXISTS_STRING
    }

    isEventFilterSet(): boolean {
        return this.eventTypes !== null;
    }

    isTimestampFilterSet(): boolean {
        return this.timestampFrom !== NOT_EXISTS_INT && this.timestampTo !== NOT_EXISTS_INT;
    }

    isByNftId(): boolean {
        return this.nftId !== NOT_EXISTS_STRING;
    }

    isBySessionAccount(): boolean {
        return this.sessionAccount === IntBoolValue.TRUE;
    }

    static fromJson(json: NftEventFilterValidationJson): NftEventFilterEntity {
        const entity = new NftEventFilterEntity();

        entity.sessionAccount = json.sessionAccount ?? entity.sessionAccount;
        entity.nftId = json.nftId ?? entity.nftId;
        entity.eventTypes = json.eventTypes ?? entity.eventTypes;
        entity.timestampFrom = json.timestampFrom ?? entity.timestampFrom;
        entity.timestampTo = json.timestampTo ?? entity.timestampTo;
        entity.from = json.from ?? entity.from;
        entity.count = json.count ?? entity.count;

        return entity;
    }
}
