import BigNumber from 'bignumber.js';
import { MathHelper, Decimal, GasPrice, SigningStargateClient } from 'cudosjs';
import Ledger from 'cudosjs/build/ledgers/Ledger';
import { Royalty } from 'cudosjs/build/stargate/modules/marketplace/proto-types/royalty';
import { CHAIN_DETAILS } from '../../../../core/utilities/Constants';
import AccountApi from '../../../accounts/data/data-sources/AccountApi';
import NftEntity from '../../../nft/entities/NftEntity';
import CategoryEntity from '../../entities/CategoryEntity';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';
import CollectionRepo from '../../presentation/repos/CollectionRepo';
import CollectionFilterModel, { CollectionorderBy } from '../../utilities/CollectionFilterModel';
import CollectionApi from '../data-sources/CollectionApi';

export default class CollectionApiRepo implements CollectionRepo {
    accountApi: AccountApi;
    collectionApi: CollectionApi;

    enableActions: () => void;
    disableActions: () => void;

    constructor() {
        this.collectionApi = new CollectionApi();
        this.accountApi = new AccountApi();

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
        collectionFilterModel.fromTimestamp = timestampFrom;
        collectionFilterModel.toTimestamp = timestampTo;
        collectionFilterModel.orderBy = CollectionorderBy.TIMESTAMP_DESC;

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

    async approveCollection(collectionEntity: CollectionEntity, ledger: Ledger, network: string): Promise < string > {
        const adminEntity = await this.accountApi.getFarmAdminByFarmId(collectionEntity.farmId);

        const signingClient = await SigningStargateClient.connectWithSigner(CHAIN_DETAILS.RPC_ADDRESS[network], ledger.offlineSigner);
        const gasPrice = GasPrice.fromString(`${CHAIN_DETAILS.GAS_PRICE}acudos`);

        const decimals = (new BigNumber(10)).pow(18);
        const innitialRoyalty = (new BigNumber(100)).multipliedBy(decimals);
        const secondaryRoyalty = (new BigNumber(100)).multipliedBy(decimals);

        const tx = await signingClient.marketplaceCreateCollection(
            ledger.accountAddress,
            collectionEntity.name, // TODO: should this be something else?
            collectionEntity.name,
            'CudosAuraPoolSchema',
            'CudosAuraPoolSymbol',
            'NotEditable',
            `CudosAuraPoolService collection for farm: ${collectionEntity.farmId}`,
            CHAIN_DETAILS.MINTING_SERVICE_ADDRESS[network],
            '',
            [
                Royalty.fromPartial({ address: adminEntity.cudosWalletAddress, percent: innitialRoyalty.toFixed(0) }),
            ],
            [
                Royalty.fromPartial({ address: adminEntity.cudosWalletAddress, percent: secondaryRoyalty.toFixed(0) }),
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
