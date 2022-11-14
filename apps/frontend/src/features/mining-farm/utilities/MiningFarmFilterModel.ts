import S from '../../../core/utilities/Main';
import { MiningFarmStatus } from '../entities/MiningFarmEntity';

export default class MiningFarmFilterModel {

    static SORT_KEY_NAME = 1;
    static SORT_KEY_POPULAR = 2;

    miningFarmIds: string[];
    status: MiningFarmStatus;
    searchString: string;
    sessionAccount: number;
    from: number;
    count: number;

    constructor() {
        this.miningFarmIds = null;
        this.status = null;
        this.searchString = '';
        this.sessionAccount = null;
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
            'offset': entity.from,
            'limit': entity.count,
        }
    }
}
