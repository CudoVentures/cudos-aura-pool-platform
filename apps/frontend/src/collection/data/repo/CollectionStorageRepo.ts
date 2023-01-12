import S from '../../../core/utilities/Main';
import StorageHelper from '../../../core/helpers/StorageHelper';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';
import CollectionRepo from '../../presentation/repos/CollectionRepo';
import CollectionFilterModel, { CollectionHashPowerFilter } from '../../utilities/CollectionFilterModel';
import CategoryEntity from '../../entities/CategoryEntity';
import NftEntity from '../../../nft/entities/NftEntity';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import BigNumber from 'bignumber.js';

export default class CollectionStorageRepo implements CollectionRepo {

    storageHelper: StorageHelper;

    constructor(storageHelper: StorageHelper) {
        this.storageHelper = storageHelper;
    }

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void) {}
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void) {}

    async fetchCategories(): Promise < CategoryEntity[] > {
        return this.storageHelper.categoriesJson.map((json) => CategoryEntity.fromJson(json));
    }

    async fetchTopCollections(timestampFrom: number, timestampTo: number, status: CollectionStatus = CollectionStatus.APPROVED): Promise < CollectionEntity[] > {
        const collectionFilterModel = new CollectionFilterModel();
        // TO DO: add top collection sort
        if (status) {
            collectionFilterModel.status = [status];
        }
        const { collectionEntities } = await this.fetchCollectionsByFilter(collectionFilterModel);
        return collectionEntities;
    }

    async fetchCollectionsByIds(collectionIds: string[], status?: CollectionStatus): Promise < CollectionEntity[] > {
        const collectionFilterModel = new CollectionFilterModel();
        // TO DO: add top collection sort
        collectionFilterModel.collectionIds = collectionIds;

        if (status) {
            collectionFilterModel.status = [status];
        }
        const { collectionEntities } = await this.fetchCollectionsByFilter(collectionFilterModel);
        return collectionEntities;
    }

    async fetchCollectionById(collectionId: string, status?: CollectionStatus): Promise < CollectionEntity > {
        const collectionEntities = await this.fetchCollectionsByIds([collectionId], status);
        return collectionEntities.length === 1 ? collectionEntities[0] : null;
    }

    async fetchCollectionsByFilter(collectionFilterModel: CollectionFilterModel): Promise < { collectionEntities: CollectionEntity[], total: number } > {
        let collectionSlice = this.storageHelper.collectionsJson.map((json) => CollectionEntity.fromJson(json));

        if (collectionFilterModel.collectionIds !== null) {
            const set = new Set(collectionFilterModel.collectionIds);
            collectionSlice = collectionSlice.filter((json) => {
                return set.has(json.id);
            });
        }

        if (collectionFilterModel.status !== null && collectionFilterModel.status.length !== 0) {
            collectionSlice = collectionSlice.filter((json) => {
                return collectionFilterModel.status.includes(json.status);
            });
        }

        if (collectionFilterModel.searchString !== '') {
            collectionSlice = collectionSlice.filter((json) => {
                return json.name.toLowerCase().indexOf(collectionFilterModel.searchString) !== -1;
            });
        }

        if (collectionFilterModel.farmId !== S.Strings.NOT_EXISTS) {
            collectionSlice = collectionSlice.filter((json) => {
                return json.farmId === collectionFilterModel.farmId;
            });
        }

        return {
            collectionEntities: collectionSlice.slice(collectionFilterModel.from, collectionFilterModel.from + collectionFilterModel.count),
            total: collectionSlice.length,
        }
    }

    async fetchCollectionDetailsById(collectionId: string): Promise < CollectionDetailsEntity > {
        const collectionDetailsEntities = await this.fetchCollectionsDetailsByIds([collectionId]);
        return collectionDetailsEntities.length === 1 ? collectionDetailsEntities[0] : null;
    }

    async fetchCollectionsDetailsByIds(collectionIds: string[]): Promise < CollectionDetailsEntity[] > {
        return collectionIds.map((collectionId) => {
            const collectionJson = this.storageHelper.collectionsJson.find((collectionJson) => {
                return collectionJson.id === collectionId;
            });
            const usedHashPowerInTh = this.storageHelper.nftsJson.reduce((accu, nftJson) => {
                const hashPowerInTh = nftJson.collectionId === collectionJson.id ? nftJson.hashPowerInTh : 0;
                return accu + hashPowerInTh;
            }, 0);

            const collectionDetailsEntity = new CollectionDetailsEntity();

            collectionDetailsEntity.collectionId = collectionId;
            collectionDetailsEntity.floorPriceInAcudos = new BigNumber(`${Math.round(Math.random() * 100)}000000000000000000`);
            collectionDetailsEntity.volumeInAcudos = new BigNumber(`${Math.round(Math.random() * 100000)}000000000000000000`);
            collectionDetailsEntity.owners = Math.round(Math.random() * 10);
            collectionDetailsEntity.cudosAddress = 'cudos14h7pdf8g2kkjgum5dntz80s5lhtrw3lk2uswk0';
            collectionDetailsEntity.remainingHashPowerInTH = collectionJson.hashPowerInTh - usedHashPowerInTh

            return collectionDetailsEntity;
        });
    }

    async creditCollection(collectionEntity: CollectionEntity, nftEntities: NftEntity[]) {
        const collectionsJson = this.storageHelper.collectionsJson;

        let collectionJson = collectionsJson.find((json) => {
            return json.id === collectionEntity.id;
        });

        if (collectionJson !== undefined) {
            Object.assign(collectionJson, CollectionEntity.toJson(collectionEntity));
        } else {
            const lastCollectionEntity = collectionsJson.last();
            const nextCollectionId = 1 + (lastCollectionEntity !== null ? parseInt(lastCollectionEntity.id) : 0);

            collectionJson = CollectionEntity.toJson(collectionEntity);
            collectionJson.id = nextCollectionId.toString();

            collectionsJson.push(collectionJson);
        }

        Object.assign(collectionEntity, CollectionEntity.fromJson(collectionJson));

        if (nftEntities !== null) {
            const nftsJson = this.storageHelper.nftsJson;

            nftEntities.forEach((nftEntity) => {
                let nftJson = nftsJson.find((json) => {
                    return json.id === nftEntity.id;
                });

                if (nftJson !== undefined) {
                    Object.assign(nftJson, NftEntity.toJson(nftEntity));
                } else {
                    const lastNftEntity = nftsJson.last();
                    const nextNftId = 1 + (lastNftEntity !== null ? parseInt(lastNftEntity.id) : 0);
                    const cudosWalletAddress = this.storageHelper.sessionAdmin.cudosWalletAddress;

                    nftJson = NftEntity.toJson(nftEntity);
                    nftJson.id = nextNftId.toString();
                    nftJson.collectionId = collectionJson.id;
                    nftJson.currentOwner = cudosWalletAddress;

                    nftsJson.push(nftJson);
                }

                Object.assign(nftEntity, NftEntity.fromJson(nftJson));
            });
        }

        this.storageHelper.save();
    }

    async editCollection(collectionEntity: CollectionEntity) {
    }
}
