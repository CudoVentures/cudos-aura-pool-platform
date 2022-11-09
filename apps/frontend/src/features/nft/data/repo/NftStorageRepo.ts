import S from '../../../../core/utilities/Main';
import StorageHelper from '../../../../core/helpers/StorageHelper';
import NftEntity, { ListStatus } from '../../entities/NftEntity';
import NftRepo from '../../presentation/repos/NftRepo';
import NftFilterModel from '../../utilities/NftFilterModel';
import { CollectionStatus } from '../../../collection/entities/CollectionEntity';
import BigNumber from 'bignumber.js';

export default class NftStorageRepo implements NftRepo {

    storageHelper: StorageHelper;

    constructor(storageHelper: StorageHelper) {
        this.storageHelper = storageHelper;
    }

    setPresentationCallbacks(enableActions: () => void, disableActions: () => void) {}

    async fetchNftById(nftId: string, status: CollectionStatus = CollectionStatus.APPROVED): Promise < NftEntity > {
        const nftEntities = await this.fetchNftByIds([nftId], status);
        return nftEntities.length === 1 ? nftEntities[0] : null;
    }

    async fetchNftByIds(nftIds: string[], status: CollectionStatus = CollectionStatus.APPROVED): Promise < NftEntity[] > {
        const nftFilterModel = new NftFilterModel();
        nftFilterModel.nftIds = nftIds;
        nftFilterModel.collectionStatus = status;

        const { nftEntities, total } = await this.fetchNftsByFilter(nftFilterModel);
        return nftEntities;
    }

    async fetchNewNftDrops(status: CollectionStatus = CollectionStatus.APPROVED): Promise < NftEntity[] > {
        const nftFilterModel = new NftFilterModel();
        // TO DO: sort by newest
        nftFilterModel.collectionStatus = status;

        const { nftEntities, total } = await this.fetchNftsByFilter(nftFilterModel);
        return nftEntities;
    }

    async fetchTrendingNfts(status: CollectionStatus = CollectionStatus.APPROVED): Promise < NftEntity[] > {
        const nftFilterModel = new NftFilterModel();
        // TO DO: sort by trending
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

        return {
            nftEntities: nftsSlice.slice(nftFilterModel.from, nftFilterModel.from + nftFilterModel.count),
            total: nftsSlice.length,
        };
    }

    async buyNft(nftEntity: NftEntity, ledger: Ledger, network: string): Promise < string > {
        this.storageHelper.nftsJson.forEach((nftJson: NftEntity) => {
            if (nftJson.id === nftEntity.id) {
                nftJson.currentOwnerAddress = ledger.accountAddress
                nftJson.listStatus = ListStatus.NOT_LISTED
            }
        })

        this.storageHelper.save();

        return '0xTRANSACTIONHASH1';
    }

    async listNftForSale(nftEntity: NftEntity, price: BigNumber, ledger: Ledger, network: string): Promise < string > {
        this.storageHelper.nftsJson.forEach((nftJson: NftEntity) => {
            if (nftJson.id === nftEntity.id) {
                nftJson.listStatus = ListStatus.LISTED
            }
        })

        this.storageHelper.save();

        return '0xTRANSACTIONHASH1';
    }
}
