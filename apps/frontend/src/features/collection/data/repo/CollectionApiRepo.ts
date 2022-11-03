import NftEntity from '../../../nft/entities/NftEntity';
import CategoryEntity from '../../entities/CategoryEntity';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';
import CollectionRepo from '../../presentation/repos/CollectionRepo';
import CollectionFilterModel from '../../utilities/CollectionFilterModel';
import CollectionApi from '../data-sources/CollectionApi';

export default class CollectionStorageRepo implements CollectionRepo {

    collectionApi: CollectionApi;

    constructor() {
        this.collectionApi = new CollectionApi();
    }

    async fetchCategories(): Promise < CategoryEntity [] > {
        return this.collectionApi.fetchCategories();
    }

    async fetchTopCollections(period: number, status: CollectionStatus = CollectionStatus.APPROVED): Promise < CollectionEntity[] > {
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
        return this.collectionApi.fetchCollectionsByFilter(collectionFilterModel);
    }

    async creditCollection(collectionEntity: CollectionEntity, nftEntities: NftEntity[]) {
        const result = await this.collectionApi.creditCollection(collectionEntity, nftEntities);
        Object.assign(collectionEntity, result.collectionEntity);
        result.nftEntities.forEach((nftEntity, i) => {
            Object.assign(nftEntities[i], nftEntity);
        });
    }

}
