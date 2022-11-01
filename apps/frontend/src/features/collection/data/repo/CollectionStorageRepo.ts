import S from '../../../../core/utilities/Main';
import StorageHelper from '../../../../core/helpers/StorageHelper';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';
import CollectionRepo from '../../presentation/repos/CollectionRepo';
import CollectionFilterModel, { CollectionHashPowerFilter } from '../../utilities/CollectionFilterModel';
import CategoryEntity from '../../entities/CategoryEntity';
import NftEntity from '../../../nft/entities/NftEntity';
import { Collection } from 'cudosjs/build/stargate/modules/nft/proto-types/nft';
import BigNumber from 'bignumber.js';

export default class CollectionStorageRepo implements CollectionRepo {

    storageHelper: StorageHelper;

    constructor(storageHelper: StorageHelper) {
        this.storageHelper = storageHelper;
    }

    async fetchCategories(): Promise < CategoryEntity[] > {
        return this.storageHelper.categoriesJson.map((json) => CategoryEntity.fromJson(json));
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
        let collectionSlice = this.storageHelper.collectionsJson.map((json) => CollectionEntity.fromJson(json));

        if (collectionFilterModel.collectionIds !== null) {
            const set = new Set(collectionFilterModel.collectionIds);
            collectionSlice = collectionSlice.filter((json) => {
                return set.has(json.id);
            });
        }

        if (collectionFilterModel.status !== CollectionStatus.ANY) {
            collectionSlice = collectionSlice.filter((json) => {
                return json.status === collectionFilterModel.status;
            });
        }

        if (collectionFilterModel.searchString !== '') {
            collectionSlice = collectionSlice.filter((json) => {
                return json.name.toLowerCase().indexOf(collectionFilterModel.searchString) !== -1;
            });
        }

        // if (collectionFilterModel.sessionAccount === S.INT_TRUE) {
        //     collectionSlice = collectionSlice.filter((json) => {
        //         return (json.accountId === this.storageHelper.sessionAccount?.accountId) || false
        //     });
        // }

        if (collectionFilterModel.farmId !== S.Strings.NOT_EXISTS) {
            collectionSlice = collectionSlice.filter((json) => {
                return json.farmId === collectionFilterModel.farmId;
            });
        }

        if (collectionFilterModel.hashPowerFilter !== CollectionHashPowerFilter.NONE) {
            let hashPowerLimit = S.NOT_EXISTS;
            switch (collectionFilterModel.hashPowerFilter) {
                case CollectionHashPowerFilter.BELOW_1000_EH:
                    hashPowerLimit = 1000;
                    break;
                case CollectionHashPowerFilter.BELOW_2000_EH:
                    hashPowerLimit = 2000;
                    break;
                case CollectionHashPowerFilter.ABOVE_2000_EH:
                default:
                    hashPowerLimit = Number.MAX_SAFE_INTEGER;
                    break;

            }

            collectionSlice = collectionSlice.filter((json) => {
                return json.hashPower <= hashPowerLimit;
            });
        }

        collectionSlice.sort((a: CollectionEntity, b: CollectionEntity) => {
            switch (collectionFilterModel.sortKey) {
                case CollectionFilterModel.SORT_KEY_PRICE:
                    return a.price.comparedTo(b.price)
                case CollectionFilterModel.SORT_KEY_NAME:
                default:
                    return a.name.localeCompare(b.name)
            }
        });

        return {
            collectionEntities: collectionSlice.slice(collectionFilterModel.from, collectionFilterModel.from + collectionFilterModel.count),
            total: collectionSlice.length,
        }
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

                    nftJson = NftEntity.toJson(nftEntity);
                    nftJson.id = nextNftId.toString();
                    nftJson.collectionId = collectionJson.id;
                    nftJson.currentOwnerAddress = collectionJson.ownerAddress;
                    nftJson.creatorAddress = collectionJson.ownerAddress;

                    nftsJson.push(nftJson);
                }

                Object.assign(nftEntity, NftEntity.fromJson(nftJson));
            });
        }

        this.storageHelper.save();
    }

}
