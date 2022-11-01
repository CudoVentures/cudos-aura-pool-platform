import S from '../../../../core/utilities/Main';
import StorageHelper from '../../../../core/helpers/StorageHelper';
import NftEntity from '../../entities/NftEntity';
import NftRepo from '../../presentation/repos/NftRepo';
import NftFilterModel, { NftHashPowerFilter, NftPriceSortDirection } from '../../utilities/NftFilterModel';
import { CollectionStatus } from '../../../collection/entities/CollectionEntity';

export default class NftStorageRepo implements NftRepo {

    storageHelper: StorageHelper;

    constructor(storageHelper: StorageHelper) {
        this.storageHelper = storageHelper;
    }

    async fetchNftById(nftId: string, status: CollectionStatus = CollectionStatus.APPROVED): Promise < NftEntity > {
        const nftFilterModel = new NftFilterModel();
        nftFilterModel.from = 0;
        nftFilterModel.count = Number.MAX_SAFE_INTEGER;
        nftFilterModel.nftIds = [nftId];
        nftFilterModel.collectionStatus = status;

        const { nftEntities, total } = await this.fetchNftsByFilter(nftFilterModel);
        return nftEntities.length === 1 ? nftEntities[0] : null;
    }

    async fetchNewNftDrops(status: CollectionStatus = CollectionStatus.APPROVED): Promise < NftEntity[] > {
        const nftFilterModel = new NftFilterModel();
        // TO DO: sort by newest
        nftFilterModel.from = 0;
        nftFilterModel.count = Number.MAX_SAFE_INTEGER;
        nftFilterModel.collectionStatus = status;

        const { nftEntities, total } = await this.fetchNftsByFilter(nftFilterModel);
        return nftEntities;
    }

    async fetchTrendingNfts(status: CollectionStatus = CollectionStatus.APPROVED): Promise < NftEntity[] > {
        const nftFilterModel = new NftFilterModel();
        // TO DO: sort by trending
        nftFilterModel.from = 0;
        nftFilterModel.count = Number.MAX_SAFE_INTEGER;
        nftFilterModel.collectionStatus = status;

        const { nftEntities, total } = await this.fetchNftsByFilter(nftFilterModel);
        return nftEntities;
    }

    async fetchNftsByFilter(nftFilterModel: NftFilterModel): Promise < { nftEntities: NftEntity[], total: number } > {
        let nftsSlice = this.storageHelper.nftsJson.map((json) => NftEntity.fromJson(json));

        if (nftFilterModel.nftIds !== null) {
            const set = new Set(nftFilterModel.nftIds);
            nftsSlice = nftsSlice.filter((json) => {
                return set.has(json.id);
            });
        }

        if (nftFilterModel.sessionAccount === S.INT_TRUE) {
            const accountId = this.storageHelper.sessionAccount?.accountId ?? '';
            const miningFarmIdsSet = new Set();
            const collectionIdsSet = new Set();
            this.storageHelper.miningFarmsJson.forEach((miningFarmJson) => {
                if (miningFarmJson.accountId === accountId) {
                    miningFarmIdsSet.add(miningFarmJson.id);
                }
            });
            this.storageHelper.collectionsJson.forEach((collectionJson) => {
                if (miningFarmIdsSet.has(collectionJson.farmId) === true) {
                    collectionIdsSet.add(collectionJson.id);
                }
            });

            nftsSlice = nftsSlice.filter((json) => {
                return collectionIdsSet.has(json.collectionId);
            });
        }

        if (nftFilterModel.collectionStatus !== CollectionStatus.ANY) {
            const collectionIdsSet = new Set();
            this.storageHelper.collectionsJson.forEach((collectionJson) => {
                if (collectionJson.status === nftFilterModel.collectionStatus) {
                    collectionIdsSet.add(collectionJson.id);
                }
            });

            nftsSlice = nftsSlice.filter((json) => {
                return collectionIdsSet.has(json.collectionId);
            });
        }

        if (nftFilterModel.collectionIds !== null) {
            nftsSlice = nftsSlice.filter((json) => {
                return nftFilterModel.collectionIds.includes(json.collectionId);
            });
        }

        if (nftFilterModel.searchString !== '') {
            nftsSlice = nftsSlice.filter((json) => {
                return json.name.toLowerCase().indexOf(nftFilterModel.searchString) !== -1;
            });
        }

        if (nftFilterModel.hashPowerFilter !== NftHashPowerFilter.NONE) {
            let hashPowerLimit = S.NOT_EXISTS;
            switch (nftFilterModel.hashPowerFilter) {
                case NftHashPowerFilter.BELOW_1000_EH:
                    hashPowerLimit = 1000;
                    break;
                case NftHashPowerFilter.BELOW_2000_EH:
                    hashPowerLimit = 2000;
                    break;
                case NftHashPowerFilter.ABOVE_2000_EH:
                default:
                    hashPowerLimit = Number.MAX_SAFE_INTEGER;
                    break;

            }

            nftsSlice = nftsSlice.filter((json) => {
                return json.hashPower <= hashPowerLimit;
            });
        }

        nftsSlice.sort((a: NftEntity, b: NftEntity) => {
            switch (nftFilterModel.sortKey) {
                case NftFilterModel.SORT_KEY_POPULAR:
                case NftFilterModel.SORT_KEY_NAME:
                default:
                    return a.name.localeCompare(b.name)
            }
        });

        if (nftFilterModel.sortPriceDirection !== NftPriceSortDirection.NONE) {
            nftsSlice.sort((a: NftEntity, b: NftEntity) => {
                switch (nftFilterModel.sortPriceDirection) {
                    case NftPriceSortDirection.HIGH_TO_LOW:
                        return a.price.comparedTo(b.price);
                    case NftPriceSortDirection.LOW_TO_HIGH:
                        return b.price.comparedTo(a.price);
                    default:
                        return 0;
                }
            });
        }

        return {
            nftEntities: nftsSlice.slice(nftFilterModel.from, nftFilterModel.from + nftFilterModel.count),
            total: nftsSlice.length,
        };
    }
}
