import S from '../../../core/utilities/Main';
import { MiningFarmStatus } from '../entities/MiningFarmEntity';

export enum MiningFarmOrderBy {
    POPULAR_DESC = 1,
}

export default class MiningFarmFilterModel {

    miningFarmIds: string[];
    status: MiningFarmStatus;
    searchString: string;
    sessionAccount: number;
    orderBy: MiningFarmOrderBy;
    from: number;
    count: number;

    constructor() {
        this.miningFarmIds = null;
        this.status = null;
        this.searchString = '';
        this.sessionAccount = null;
        this.orderBy = 0;
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;
    }

    static toJson(entity: MiningFarmFilterModel) {
        if (entity === null) {
            return null;
        }

        return {
            'id': entity.miningFarmIds !== null ? entity.miningFarmIds.join(',') : null,
            'status': entity.status ?? undefined,
            'search_string': entity.searchString,
            'creator_id': entity.sessionAccount ?? undefined,
            'order_by': entity.orderBy,
            'offset': entity.from,
            'limit': entity.count,
        }
    }
}
