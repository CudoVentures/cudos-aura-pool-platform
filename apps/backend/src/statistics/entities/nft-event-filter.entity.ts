import { NOT_EXISTS_INT, NOT_EXISTS_STRING } from '../../common/utils';
import { NftEventFilterValidationJson } from '../statistics.types';

export default class NftEventFilterEntity {
    sessionAccount: number;
    nftId: string;
    timestampFrom: number;
    timestampTo: number;
    from: number;
    count: number;

    constructor() {
        this.sessionAccount = NOT_EXISTS_INT;
        this.nftId = NOT_EXISTS_STRING;
        this.timestampFrom = NOT_EXISTS_INT;
        this.timestampTo = NOT_EXISTS_INT;
        this.from = NOT_EXISTS_INT;
        this.count = NOT_EXISTS_INT;
    }

    isTimestampFilterSet(): boolean {
        return this.timestampFrom !== NOT_EXISTS_INT && this.timestampTo !== NOT_EXISTS_INT;
    }

    isByNftId(): boolean {
        return this.nftId !== NOT_EXISTS_STRING;
    }

    isBySessionAccount(): boolean {
        return this.sessionAccount !== NOT_EXISTS_INT;
    }

    static fromJson(json: NftEventFilterValidationJson): NftEventFilterEntity {
        const entity = new NftEventFilterEntity();

        entity.sessionAccount = json.sessionAccount ?? entity.sessionAccount;
        entity.nftId = json.nftId ?? entity.nftId;
        entity.timestampFrom = json.timestampFrom ?? entity.timestampFrom
        entity.timestampTo = json.timestampTo ?? entity.timestampTo
        entity.from = json.from ?? entity.from
        entity.count = json.count ?? entity.count

        return entity;
    }
}
