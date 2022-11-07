import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';
import { CollectionStatus } from '../../collection/entities/CollectionEntity';

export default class NftFilterModel {

    nftIds: string[];
    collectionStatus: CollectionStatus;
    collectionIds: string[];
    searchString: string;
    sessionAccount: number;
    from: number;
    count: number;

    constructor() {
        this.nftIds = null;
        this.collectionStatus = CollectionStatus.APPROVED;
        this.collectionIds = null;
        this.searchString = '';
        this.sessionAccount = S.INT_FALSE;
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;

        makeAutoObservable(this);
    }

    static toJson(entity: NftFilterModel) {
        if (entity === null) {
            return null;
        }

        return {
            nftIds: entity.nftIds,
            collectionStatus: entity.collectionStatus,
            collectionIds: entity.collectionIds,
            searchString: entity.searchString,
            sessionAccount: entity.sessionAccount,
            from: entity.from,
            count: entity.count,
        }
    }

    static fromJson(json): NftFilterModel {
        if (json === null) {
            return null;
        }

        const model = new NftFilterModel();

        model.nftIds = json.nftIds ?? model.nftIds;
        model.collectionStatus = json.collectionStatus ?? model.collectionStatus;
        model.collectionIds = (json.collectionIds ?? model.collectionIds).map((j) => j.toString());
        model.searchString = json.searchString ?? model.searchString;
        model.sessionAccount = parseInt(json.sessionAccount ?? model.sessionAccount);
        model.from = parseInt(json.from ?? model.from);
        model.count = parseInt(json.count ?? model.count);

        return model;
    }

}
