import S from '../../../../core/utilities/Main';
import StorageHelper from '../../../../core/helpers/StorageHelper';
import NftEntity from '../../entities/NftEntity';
import NftRepo from '../../presentation/repos/NftRepo';
import NftFilterModel, { NftHashPowerFilter, NftPriceSortDirection } from '../../utilities/NftFilterModel';

export default class NftStorageRepo implements NftRepo {

    storageHelper: StorageHelper;

    constructor(storageHelper: StorageHelper) {
        this.storageHelper = storageHelper;
    }

    async fetchNftById(nftId: string): Promise < NftEntity > {
        const nftJson = this.storageHelper.nftsJson.find((json) => json.id === nftId);
        return NftEntity.fromJson(nftJson)
    }

    async fetchNewNftDrops(): Promise < NftEntity[] > {
        // TODO: sort them by listing date or something?
        const nftEntities = this.storageHelper.nftsJson.slice(0, 10).map((json) => NftEntity.fromJson(json));

        return nftEntities;
    }

    async fetchTrendingNfts(): Promise < NftEntity[] > {
        // TODO: sort them by something?
        const nftEntities = this.storageHelper.nftsJson.slice(0, 10).map((json) => NftEntity.fromJson(json));

        return nftEntities;
    }

    async fetchNftsByFilter(nftFilterModel: NftFilterModel): Promise < { nftEntities: NftEntity[], total: number } > {
        let nftsSlice = this.storageHelper.nftsJson.map((json) => NftEntity.fromJson(json));

        if (nftFilterModel.collectionIds.length !== 0) {
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
