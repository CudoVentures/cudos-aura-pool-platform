import { makeAutoObservable } from 'mobx';
import S from '../../core/utilities/Main';
import { MiningFarmStatus } from '../entities/MiningFarmEntity';

export enum MiningFarmOrderBy {
    POPULAR_ASC = 1,
    POPULAR_DESC = -MiningFarmOrderBy.POPULAR_ASC,
}

export default class MiningFarmFilterModel {

    miningFarmIds: string[];
    status: MiningFarmStatus[];
    searchString: string;
    sessionAccount: number;
    orderBy: MiningFarmOrderBy;
    from: number;
    count: number;

    constructor() {
        this.miningFarmIds = null;
        this.status = null;
        this.searchString = '';
        this.sessionAccount = S.INT_FALSE;
        this.orderBy = MiningFarmOrderBy.POPULAR_ASC;
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;

        makeAutoObservable(this);
    }

    clone(): MiningFarmFilterModel {
        const model = new MiningFarmFilterModel();

        Object.assign(model, this);

        return model;
    }

    static toJson(entity: MiningFarmFilterModel) {
        if (entity === null) {
            return null;
        }

        return {
            'miningFarmIds': entity.miningFarmIds,
            'status': entity.status,
            'searchString': entity.searchString,
            'sessionAccount': entity.sessionAccount,
            'orderBy': entity.orderBy,
            'from': entity.from,
            'count': entity.count,
        }
    }
}
