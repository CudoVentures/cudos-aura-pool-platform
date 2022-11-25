import BigNumber from 'bignumber.js';
import { MathHelper, Decimal, GasPrice, SigningStargateClient, checkValidNftDenomId } from 'cudosjs';
import Ledger from 'cudosjs/build/ledgers/Ledger';
import { Royalty } from 'cudosjs/build/stargate/modules/marketplace/proto-types/royalty';
import { CHAIN_DETAILS } from '../../../../core/utilities/Constants';
import AccountApi from '../../../accounts/data/data-sources/AccountApi';
import SuperAdminEntity from '../../../accounts/entities/SuperAdminEntity';
import MiningFarmApi from '../../../mining-farm/data/data-sources/MiningFarmApi';
import MiningFarmFilterModel from '../../../mining-farm/utilities/MiningFarmFilterModel';
import NftEntity from '../../../nft/entities/NftEntity';
import CategoryEntity from '../../entities/CategoryEntity';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';
import CollectionRepo from '../../presentation/repos/CollectionRepo';
import CollectionFilterModel, { CollectionOrderBy } from '../../utilities/CollectionFilterModel';
import CollectionApi from '../data-sources/CollectionApi';

export default class CollectionApiRepo implements CollectionRepo {
    accountApi: AccountApi;
    collectionApi: CollectionApi;
    miningFarmApi: MiningFarmApi;

    enableActions: () => void;
    disableActions: () => void;

    constructor() {
        this.collectionApi = new CollectionApi();
        this.accountApi = new AccountApi();
        this.miningFarmApi = new MiningFarmApi();

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
        collectionFilterModel.status = status;
        collectionFilterModel.timestampFrom = timestampFrom;
        collectionFilterModel.timestampTo = timestampTo;
        collectionFilterModel.orderBy = CollectionOrderBy.TOP_DESC;

        const { collectionEntities, total } = await this.fetchCollectionsByFilter(collectionFilterModel);
        return collectionEntities;
    }

    async fetchCollectionsByIds(collectionIds: string[], status: CollectionStatus = CollectionStatus.APPROVED): Promise < CollectionEntity[] > {
        const collectionFilterModel = new CollectionFilterModel();
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

    async approveCollection(collectionEntity: CollectionEntity, superAdminEntity: SuperAdminEntity, ledger: Ledger, network: string): Promise < string > {

        checkValidNftDenomId(collectionEntity.denomId)

        const farmAdminEntity = await this.accountApi.getFarmAdminByFarmId(collectionEntity.farmId);
        const filter = new MiningFarmFilterModel()
        filter.miningFarmIds = [collectionEntity.farmId];
        const miningFarmEntities = (await this.miningFarmApi.fetchMiningFarmsByFilter(filter)).miningFarmEntities;
        const miningFarmEntity = miningFarmEntities[0];

        const signingClient = await SigningStargateClient.connectWithSigner(CHAIN_DETAILS.RPC_ADDRESS[network], ledger.offlineSigner);
        const gasPrice = GasPrice.fromString(`${CHAIN_DETAILS.GAS_PRICE}acudos`);

        const decimals = (new BigNumber(10)).pow(18);
        const cudosMintRoyalties = miningFarmEntity.cudosMintNftRoyaltiesPercent;

        const innitialOwnerRoyalty = (new BigNumber(100 - cudosMintRoyalties)).multipliedBy(decimals);
        const innitialCudosRoyalty = (new BigNumber(cudosMintRoyalties)).multipliedBy(decimals);

        const secondaryFarmOwnerRoyalty = (new BigNumber(collectionEntity.royalties)).multipliedBy(decimals);
        const secondaryCudosRoyalty = (new BigNumber(miningFarmEntity.cudosResaleNftRoyaltiesPercent)).multipliedBy(decimals);

        const data = `{"farm_id":"${collectionEntity.farmId}"}`;

        const tx = await signingClient.marketplaceCreateCollection(
            ledger.accountAddress,
            collectionEntity.denomId,
            collectionEntity.name,
            'CudosAuraPoolSchema',
            collectionEntity.name,
            'NotEditable',
            '',
            CHAIN_DETAILS.MINTING_SERVICE_ADDRESS[network],
            data,
            [
                Royalty.fromPartial({ address: farmAdminEntity.cudosWalletAddress, percent: innitialOwnerRoyalty.toFixed(0) }),
                Royalty.fromPartial({ address: superAdminEntity.cudosRoyalteesAddress, percent: innitialCudosRoyalty.toFixed(0) }),
            ],
            [
                Royalty.fromPartial({ address: farmAdminEntity.cudosWalletAddress, percent: secondaryFarmOwnerRoyalty.toFixed(0) }),
                Royalty.fromPartial({ address: farmAdminEntity.cudosWalletAddress, percent: secondaryCudosRoyalty.toFixed(0) }),
            ],
            true,
            gasPrice,
            undefined,
            `Minted by Cudos Aura Pool Service, approved by Super Admin: ${ledger.accountAddress}`,
        )

        const txHash = tx.transactionHash;

        return txHash;
    }
}
