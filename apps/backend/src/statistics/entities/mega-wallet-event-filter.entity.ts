import { NOT_EXISTS_INT } from '../../common/utils';
import { MegaWalletEventFilterValidationJson } from '../statistics.types';
import { NftTransferHistoryEventType } from './nft-event.entity';

export enum MegaWalletEventSortBy {
    TIME_ASC = 1,
    TIME_DESC = -TIME_ASC
}

export default class MegaWalletEventFilterEntity {
    eventTypes: NftTransferHistoryEventType[];
    timestampFrom: number;
    timestampTo: number;
    from: number;
    count: number;
    sortBy: MegaWalletEventSortBy;

    constructor() {
        this.eventTypes = null;
        this.timestampFrom = NOT_EXISTS_INT;
        this.timestampTo = NOT_EXISTS_INT;
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;
        this.sortBy = MegaWalletEventSortBy.TIME_DESC;
    }

    isEventFilterSet(): boolean {
        return this.eventTypes !== null;
    }

    isTimestampFilterSet(): boolean {
        return this.timestampFrom !== NOT_EXISTS_INT && this.timestampTo !== NOT_EXISTS_INT;
    }

    isSortByTime(): boolean {
        return this.sortBy === MegaWalletEventSortBy.TIME_ASC || this.sortBy === MegaWalletEventSortBy.TIME_DESC;
    }

    static fromJson(json: MegaWalletEventFilterValidationJson): MegaWalletEventFilterEntity {
        const entity = new MegaWalletEventFilterEntity();

        entity.eventTypes = json.eventTypes ?? entity.eventTypes;
        entity.timestampFrom = json.timestampFrom ?? entity.timestampFrom;
        entity.timestampTo = json.timestampTo ?? entity.timestampTo;
        entity.from = json.from ?? entity.from;
        entity.count = json.count ?? entity.count;
        entity.sortBy = json.sortBy ?? entity.sortBy;

        return entity;
    }
}
