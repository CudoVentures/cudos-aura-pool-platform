import BigNumber from 'bignumber.js';
import { GasPrice, checkValidNftDenomId } from 'cudosjs';
import { CudosSigningStargateClient } from 'cudosjs/build/stargate/cudos-signingstargateclient';
import { Royalty } from 'cudosjs/build/stargate/modules/marketplace/proto-types/royalty';
import { BackendErrorType, parseBackendErrorType } from '../../../core/utilities/AxiosWrapper';
import { CHAIN_DETAILS } from '../../../core/utilities/Constants';
import AccountApi from '../../../accounts/data/data-sources/AccountApi';
import SuperAdminEntity from '../../../accounts/entities/SuperAdminEntity';
import MiningFarmApi from '../../../mining-farm/data/data-sources/MiningFarmApi';
import MiningFarmFilterModel from '../../../mining-farm/utilities/MiningFarmFilterModel';
import NftEntity from '../../../nft/entities/NftEntity';
import CategoryEntity from '../../entities/CategoryEntity';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';
import CollectionRepo from '../../presentation/repos/CollectionRepo';
import CollectionFilterModel from '../../utilities/CollectionFilterModel';
import CollectionApi from '../data-sources/CollectionApi';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import CollectionSessionStorage from '../data-sources/CollectionSessionStorage';
import DefaultProgressHandler from '../../../core/utilities/DefaultProgressHandler';

export default class CollectionApiRepo implements CollectionRepo {
    accountApi: AccountApi;
    collectionApi: CollectionApi;
    collectionSessionStorage: CollectionSessionStorage;
    miningFarmApi: MiningFarmApi;

    enableActions: () => void;
    disableActions: () => void;
    showAlert: (msg: string, positiveListener?: null | (() => boolean | void), negativeListener?: null | (() => boolean | void)) => void;
    onProgress: (title: string, progress: number) => void;

    constructor() {
        this.collectionApi = new CollectionApi();
        this.collectionSessionStorage = new CollectionSessionStorage();
        this.accountApi = new AccountApi();
        this.miningFarmApi = new MiningFarmApi();

        this.enableActions = null;
        this.disableActions = null;
        this.showAlert = null;
    }

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void) {
        this.enableActions = enableActions;
        this.disableActions = disableActions;
    }

    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener?: null | (() => boolean | void), negativeListener?: null | (() => boolean | void)) => void) {
        this.showAlert = showAlert;
    }

    setProgressCallbacks(onProgress: (title: string, progress: number) => void) {
        this.onProgress = onProgress;
    }

    async fetchCategories(): Promise < CategoryEntity [] > {
        try {
            this.disableActions?.();
            return await this.collectionApi.fetchCategories();
        } finally {
            this.enableActions?.();
        }
    }

    async fetchTopCollections(timestampFrom: number, timestampTo: number): Promise < CollectionEntity[] > {
        try {
            this.disableActions?.();
            return await this.collectionApi.fetchTopCollections(timestampFrom, timestampTo);
        } finally {
            this.enableActions?.();
        }
    }

    async fetchCollectionsByIds(collectionIds: string[], status?: CollectionStatus): Promise < CollectionEntity[] > {
        const collectionFilterModel = new CollectionFilterModel();
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

    async fetchCollectionsByMiningFarmId(miningFarmId: string, status?: CollectionStatus): Promise < CollectionEntity[] > {
        const collectionFilterModel = new CollectionFilterModel();
        collectionFilterModel.farmId = miningFarmId;
        if (status) {
            collectionFilterModel.status = [status];
        }
        const { collectionEntities } = await this.fetchCollectionsByFilter(collectionFilterModel);
        return collectionEntities;
    }

    async fetchCollectionsByFilter(collectionFilterModel: CollectionFilterModel): Promise < { collectionEntities: CollectionEntity[], total: number } > {
        try {
            this.disableActions?.();
            const fetchedCollectionResult = await this.collectionApi.fetchCollectionsByFilter(collectionFilterModel);

            const checkedCollectionEntities = this.checkCollectionsVersusSessionStorage(fetchedCollectionResult.collectionEntities);

            return {
                collectionEntities: checkedCollectionEntities,
                total: fetchedCollectionResult.total,
            }
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
            return await this.collectionApi.fetchCollectionsDetailsByIds(collectionIds);
        } finally {
            this.enableActions?.();
        }
    }

    async creditCollection(collectionEntity: CollectionEntity, nftEntities: NftEntity[]) {
        const progressHandler = new DefaultProgressHandler('Uploading collection...', 'Processing collection...', this.onProgress);
        try {
            this.disableActions?.();

            const result = await this.collectionApi.creditCollection(collectionEntity, nftEntities, progressHandler.onProgress);

            await runInActionAsync(() => {
                Object.assign(collectionEntity, result.collectionEntity);
                result.nftEntities.forEach((nftEntity, i) => {
                    Object.assign(nftEntities[i], nftEntity);
                });
            })
        } catch (e) {
            const error = parseBackendErrorType(e);
            switch (error) {
                case BackendErrorType.COLLECTION_DENOM_EXISTS_ERROR:
                    this.showAlert?.('Please ensure that denom id is not already in use');
                    throw Error(error);
                case BackendErrorType.COLLECTION_CREATE_ERROR:
                    this.showAlert?.('There was error saving the colelction. Please try again.');
                    throw Error(error);
                case BackendErrorType.COLLECTION_WRONG_DENOM_ERROR:
                    this.showAlert?.('Please use only letters for collection name.');
                    throw Error(error);
                case BackendErrorType.DATA_SERVICE_ERROR:
                    this.showAlert?.('Failed to save pictures. Please try again.');
                    throw Error(error);
                default:
                    throw Error(error);
            }
        } finally {
            this.enableActions?.();
            progressHandler.finish();
        }
    }

    async editCollection(collectionEntity: CollectionEntity) {
        try {
            this.disableActions?.();
            const resultCollectionEntity = await this.collectionApi.editCollection(collectionEntity);
            Object.assign(collectionEntity, resultCollectionEntity);
        } catch (e) {
            const error = parseBackendErrorType(e);
            switch (error) {
                case BackendErrorType.COLLECTION_DENOM_EXISTS_ERROR:
                    this.showAlert?.('Please ensure that denom id is not already in use');
                    throw Error(error);
                case BackendErrorType.COLLECTION_CREATE_ERROR:
                    this.showAlert?.('There was error saving the colelction. Please try again.');
                    throw Error(error);
                case BackendErrorType.COLLECTION_WRONG_DENOM_ERROR:
                    this.showAlert?.('Please use only letters for collection name.');
                    throw Error(error);
                case BackendErrorType.DATA_SERVICE_ERROR:
                    this.showAlert?.('Failed to save pictures. Please try again.');
                    throw Error(error);
                default:
                    throw Error(error);
            }
        } finally {
            this.enableActions?.();
        }
    }

    async approveCollection(collectionEntity: CollectionEntity, superAdminEntity: SuperAdminEntity, creatorCudosAddress: string, signingClient: CudosSigningStargateClient): Promise < string > {
        try {
            this.disableActions?.();

            checkValidNftDenomId(collectionEntity.denomId)
            const filter = new MiningFarmFilterModel()
            filter.miningFarmIds = [collectionEntity.farmId];
            const miningFarmEntities = (await this.miningFarmApi.fetchMiningFarmsByFilter(filter)).miningFarmEntities;
            const miningFarmEntity = miningFarmEntities[0];

            const farmOwnerAdminEntity = await this.accountApi.fetchFarmOwnerAccount(miningFarmEntity.accountId);

            const gasPrice = GasPrice.fromString(`${CHAIN_DETAILS.GAS_PRICE}${CHAIN_DETAILS.NATIVE_TOKEN_DENOM}`);

            const decimals = (new BigNumber(10)).pow(18);
            const cudosMintRoyalties = miningFarmEntity.cudosMintNftRoyaltiesPercent;

            const innitialOwnerRoyalty = (new BigNumber(100 - cudosMintRoyalties)).multipliedBy(decimals);
            const innitialCudosRoyalty = (new BigNumber(cudosMintRoyalties)).multipliedBy(decimals);

            const secondaryFarmOwnerRoyalty = (new BigNumber(collectionEntity.royalties)).multipliedBy(decimals);
            const secondaryCudosRoyalty = (new BigNumber(miningFarmEntity.cudosResaleNftRoyaltiesPercent)).multipliedBy(decimals);

            const data = `{
                "farm_id":"${collectionEntity.farmId}",
                "platform_royalties_address": "${superAdminEntity.cudosRoyalteesAddress}",
                "farm_mint_royalties_address": "${farmOwnerAdminEntity.cudosWalletAddress}",
                "farm_resale_royalties_address": "${miningFarmEntity.resaleFarmRoyaltiesCudosAddress}"
            }`;

            const tx = await signingClient.marketplaceCreateCollection(
                creatorCudosAddress,
                collectionEntity.denomId,
                collectionEntity.name,
                'CudosMarketsSchema',
                collectionEntity.name,
                'NotEditable',
                '',
                CHAIN_DETAILS.MINTING_SERVICE_ADDRESS,
                data,
                [
                    Royalty.fromPartial({ address: farmOwnerAdminEntity.cudosWalletAddress, percent: innitialOwnerRoyalty.toFixed(0) }),
                    Royalty.fromPartial({ address: superAdminEntity.cudosRoyalteesAddress, percent: innitialCudosRoyalty.toFixed(0) }),
                ],
                [
                    Royalty.fromPartial({ address: miningFarmEntity.resaleFarmRoyaltiesCudosAddress, percent: secondaryFarmOwnerRoyalty.toFixed(0) }),
                    Royalty.fromPartial({ address: superAdminEntity.cudosRoyalteesAddress, percent: secondaryCudosRoyalty.toFixed(0) }),
                ],
                true,
                gasPrice,
                undefined,
                `Minted by CUDOS Markets Service, approved by Super Admin: ${creatorCudosAddress}`,
            )

            this.showAlert('You have approved the collection and now it is been processed by the chain and CUDOS Markets. Once the processing is finished then the collection\'s status will be changed to APPROVED.');

            collectionEntity.markApproved();
            this.collectionSessionStorage.updateCollectionsMap([collectionEntity]);
            return tx.transactionHash;
        } finally {
            this.enableActions?.();
        }
    }

    private checkCollectionsVersusSessionStorage(collectionEntities: CollectionEntity[]): CollectionEntity[] {
        const collectionsMap = this.collectionSessionStorage.getCollectionsMap();
        return collectionEntities.map((collectionEntity) => {
            const storageCollection = collectionsMap.get(collectionEntity.id);
            if (storageCollection !== undefined && collectionEntity.timestampUpdatedAt === storageCollection.timestampUpdatedAt) {
                return storageCollection;
            }

            return collectionEntity;
        });
    }
}
