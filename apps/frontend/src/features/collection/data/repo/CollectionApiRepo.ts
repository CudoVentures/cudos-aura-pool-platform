import NftEntity from '../../../nft/entities/NftEntity';
import CategoryEntity from '../../entities/CategoryEntity';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';
import CollectionRepo from '../../presentation/repos/CollectionRepo';
import CollectionFilterModel from '../../utilities/CollectionFilterModel';
import CollectionApi from '../data-sources/CollectionApi';

export default class CollectionStorageRepo implements CollectionRepo {

    collectionApi: CollectionApi;
    enableActions: () => void;
    disableActions: () => void;

    constructor() {
        this.collectionApi = new CollectionApi();
        this.enableActions = null;
        this.disableActions = null;
    }

    setPresentationCallbacks(enableActions: () => void, disableActions: () => void) {
        this.enableActions = enableActions;
        this.disableActions = disableActions;
    }

    async fetchCategories(): Promise < CategoryEntity [] > {
        try {
            this.disableActions?.();
            return this.collectionApi.fetchCategories();
        } finally {
            this.enableActions?.();
        }
    }

    async fetchTopCollections(timestampFrom: number, timestampTo: number, status: CollectionStatus = CollectionStatus.APPROVED): Promise < CollectionEntity[] > {
        const collectionFilterModel = new CollectionFilterModel();
        // TO DO: add top collection sort
        collectionFilterModel.status = status;

        const { collectionEntities, total } = await this.fetchCollectionsByFilter(collectionFilterModel);
        return collectionEntities;
    }

    async fetchCollectionsByIds(collectionIds: string[], status: CollectionStatus = CollectionStatus.APPROVED): Promise < CollectionEntity[] > {
        const collectionFilterModel = new CollectionFilterModel();
        // TO DO: add top collection sort
        collectionFilterModel.collectionIds = collectionIds;
        collectionFilterModel.status = status;

        const { collectionEntities, total } = await this.fetchCollectionsByFilter(collectionFilterModel);
        return collectionEntities;
    }

    async fetchCollectionById(collectionId: string, status: CollectionStatus = CollectionStatus.APPROVED): Promise < CollectionEntity > {
        const collectionEntities = await this.fetchCollectionsByIds([collectionId], status);
        return collectionEntities.length === 1 ? collectionEntities[0] : null;
    }

    async fetchCollectionsByFilter(collectionFilterModel: CollectionFilterModel): Promise < { collectionEntities: CollectionEntity[], total: number } > {
        try {
            this.disableActions?.();
            return await this.collectionApi.fetchCollectionsByFilter(collectionFilterModel);
        } finally {
            this.enableActions?.();
        }
    }

    async fetchCollectionDetailsById(collectionId: string): Promise < CollectionDetailsEntity > {
        const collectionDetailsEntities = await this.fetchCollectionsDetailsByIds([collectionId]);
        return collectionDetailsEntities.length === 1 ? collectionDetailsEntities[0] : null;
    }

    async fetchCollectionsDetailsByIds(collectionIds: string[]): Promise < CollectionDetailsEntity[] > {
        try {
            this.disableActions?.();
            return this.collectionApi.fetchCollectionsDetailsByIds(collectionIds);
        } finally {
            this.enableActions?.();
        }
    }

    async creditCollection(collectionEntity: CollectionEntity, nftEntities: NftEntity[]) {
        try {
            this.disableActions?.();
            const result = await this.collectionApi.creditCollection(collectionEntity, nftEntities);
            Object.assign(collectionEntity, result.collectionEntity);
            result.nftEntities.forEach((nftEntity, i) => {
                Object.assign(nftEntities[i], nftEntity);
            });
        } finally {
            this.enableActions?.();
        }
    }

}
