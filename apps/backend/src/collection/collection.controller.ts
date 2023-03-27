import {
    Body,
    Controller,
    forwardRef,
    HttpCode,
    Inject,
    Post,
    Put,
    Req,
    UseGuards,
    UseInterceptors,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ModuleName, ReqCreditCollection, ReqEditCollection, ReqFetchCollectionDetails, ReqFetchCollectionsByFilter, ReqFetchTopCollections, ReqUpdateCollectionChainData } from './dto/requests.dto';
import { CollectionService } from './collection.service';
import { NFTService } from '../nft/nft.service';
import RoleGuard from '../auth/guards/role.guard';
import { IsCreatorOrSuperAdminGuard } from './guards/is-creator-or-super-admin.guard';
import { IsFarmApprovedGuard } from './guards/is-farm-approved.guard';
import DataService from '../data/data.service';
import { CollectionStatus } from './utils';
import { AppRequest } from '../common/commont.types';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AccountType } from '../account/account.types';
import { CollectionCreationError, DataServiceError, ERROR_TYPES } from '../common/errors/errors';
import { CollectionEntity } from './entities/collection.entity';
import NftEntity from '../nft/entities/nft.entity';
import { ResFetchCollectionsByFilter, ResCreditCollection, ResFetchCollectionDetails, ResEditCollection, ResFetchTopCollections } from './dto/responses.dto';
import CollectionFilterEntity from './entities/collection-filter.entity';
import NftFilterEntity from '../nft/entities/nft-filter.entity';
import { GraphqlService } from '../graphql/graphql.service';
import { FarmService } from '../farm/farm.service';
import ApiKeyGuard from '../auth/guards/api-key.guard';

@ApiTags('Collection')
@Controller('collection')
export class CollectionController {
    constructor(
        @Inject(forwardRef(() => CollectionService))
        private collectionService: CollectionService,
        private nftService: NFTService,
        private dataService: DataService,
        private graphqlService: GraphqlService,
        private farmService: FarmService,
    // eslint-disable-next-line no-empty-function
    ) {}

    @Post()
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    async findAll(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqFetchCollectionsByFilter: ReqFetchCollectionsByFilter,
    ): Promise < ResFetchCollectionsByFilter > {
        const collectionFilterEntity = CollectionFilterEntity.fromJson(reqFetchCollectionsByFilter.collectionFilter);

        const { collectionEntities, total } = await this.collectionService.findByFilter(collectionFilterEntity);

        return new ResFetchCollectionsByFilter(collectionEntities, total);
    }

    @Post('fetchTopCollections')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    async fetchTopCollections(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqFetchTopCollections: ReqFetchTopCollections,
    ): Promise < ResFetchTopCollections > {
        const collectionEntities = await this.collectionService.findTopCollections(reqFetchTopCollections.timestampFrom, reqFetchTopCollections.timestampTo);
        return new ResFetchTopCollections(collectionEntities);
    }

    @Post('details')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    async getDetails(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqFetchCollectionDetails: ReqFetchCollectionDetails,
    ): Promise<ResFetchCollectionDetails> {
        const collectionIds = reqFetchCollectionDetails.collectionIds;

        const getCollectionDetails = collectionIds.map(async (collectionId) => this.collectionService.getDetails(parseInt(collectionId)))
        const collectionDetails = await Promise.all(getCollectionDetails)

        return new ResFetchCollectionDetails(collectionDetails);
    }

    @ApiBearerAuth('access-token')
    @UseGuards(RoleGuard([AccountType.ADMIN, AccountType.SUPER_ADMIN]), IsCreatorOrSuperAdminGuard, IsFarmApprovedGuard)
    @UseInterceptors(TransactionInterceptor)
    @Put()
    @HttpCode(200)
    async creditCollection(
        @Req() req: AppRequest,
        @Body() reqCreditCollection: ReqCreditCollection,
    ): Promise<ResCreditCollection> {
        const { collectionDto, nftDtos } = reqCreditCollection
        const collectionEntity = CollectionEntity.fromJson(collectionDto);
        const nftEntities = nftDtos.map((nftDto) => NftEntity.fromJson(nftDto));

        const collectionId = collectionEntity.id;

        const miningFarmDb = await this.farmService.findMiningFarmById(collectionEntity.farmId);
        const collectionOwnerAccountId = miningFarmDb.accountId;

        try {
            collectionEntity.bannerImage = await this.dataService.trySaveUri(collectionOwnerAccountId, collectionEntity.bannerImage);
            collectionEntity.mainImage = await this.dataService.trySaveUri(collectionOwnerAccountId, collectionEntity.mainImage);
            for (let i = nftEntities.length; i-- > 0;) {
                nftEntities[i].uri = await this.dataService.trySaveUri(collectionOwnerAccountId, nftEntities[i].uri);
            }
        } catch (e) {
            console.log(e);
            throw new DataServiceError();
        }

        const collectionDbEntity = await this.collectionService.findOne(collectionId, req.transaction, req.transaction.LOCK.UPDATE);
        const nftFilterEntity = new NftFilterEntity();
        nftFilterEntity.collectionIds = [collectionId.toString()];
        const { nftEntities: collectionNftDbEntities } = await this.nftService.findByFilter(null, nftFilterEntity);

        let oldUris = [];
        if (collectionDbEntity !== null) {
            oldUris = [collectionDbEntity.mainImage, collectionDbEntity.bannerImage];
            collectionNftDbEntities.forEach((nft) => {
                oldUris.push(nft.uri);
            });
        }

        const newUris = [collectionEntity.mainImage, collectionEntity.bannerImage];
        nftEntities.forEach((nftEntity) => {
            newUris.push(nftEntity.uri);
        });

        collectionEntity.denomId = collectionEntity.name.toLowerCase().replace(/ /g, '');

        let collectionEntityResult: CollectionEntity, nftEntityResults: NftEntity[] = [], nftsToDelete: NftEntity[] = [];
        try {
            if (collectionEntity.isNew()) {
                collectionEntity.creatorId = collectionOwnerAccountId
                collectionEntityResult = await this.collectionService.createOne(collectionEntity, req.transaction);

                const nfts = nftEntities.map(async (nftEntity) => {
                    nftEntity.collectionId = collectionEntityResult.id;
                    nftEntity.creatorId = collectionOwnerAccountId
                    const createdNftEntity = await this.nftService.createOne(nftEntity, req.transaction);
                    return createdNftEntity
                })

                nftEntityResults = await Promise.all(nfts)
            } else {
                if (req.sessionAccountEntity.isAdmin()) {
                    collectionEntity.markQueued();
                }
                collectionEntityResult = await this.collectionService.updateOne(collectionId, collectionEntity, req.transaction);

                const tempNftFilterEntity = new NftFilterEntity();
                tempNftFilterEntity.collectionIds = [collectionId.toString()];
                const { nftEntities: collectionDbNftEntities } = await this.nftService.findByFilter(null, tempNftFilterEntity);

                // DELETE nfts in db but not in reques
                nftsToDelete = collectionDbNftEntities.filter((nft) => nftEntities.findIndex((item) => item.id === nft.id) === -1);
                await this.nftService.deleteMany(nftsToDelete);

                // CREATE OR UPDATE rest
                const nftsToCreateOrEdit = nftEntities.map(async (nftEntity: NftEntity) => {
                    // not a new nftEntity
                    if (nftEntity.isNew() === false) {
                        return this.nftService.updateOne(nftEntity.id, nftEntity, req.transaction);
                    }

                    nftEntity.collectionId = collectionEntityResult.id;
                    nftEntity.creatorId = req.sessionAccountEntity.accountId;
                    return this.nftService.createOne(nftEntity, req.transaction)
                })

                nftEntityResults = await Promise.all(nftsToCreateOrEdit)
            }

            this.dataService.cleanUpOldUris(oldUris, newUris);
        } catch (ex) {
            console.log(ex);
            this.dataService.cleanUpNewUris(oldUris, newUris);
            const errMessage = ex.response?.message;
            switch (errMessage) {
                case ERROR_TYPES.COLLECTION_DENOM_EXISTS_ERROR:
                case ERROR_TYPES.COLLECTION_WRONG_DENOM_ERROR:
                case ERROR_TYPES.DATA_SERVICE_ERROR:
                    throw ex;
                default:
                    throw new CollectionCreationError();
            }
        }

        return new ResCreditCollection(collectionEntityResult, nftEntityResults, nftsToDelete.length);
    }

    @ApiBearerAuth('access-token')
    @UseGuards(RoleGuard([AccountType.ADMIN, AccountType.SUPER_ADMIN]), IsCreatorOrSuperAdminGuard, IsFarmApprovedGuard)
    @UseInterceptors(TransactionInterceptor)
    @Put('editCollection')
    @HttpCode(200)
    async edit(
        @Req() req: AppRequest,
        @Body() reqEditCollection: ReqEditCollection,
    ): Promise<ResEditCollection> {
        const { collectionDto } = reqEditCollection
        const collectionEntity = CollectionEntity.fromJson(collectionDto);

        if (collectionEntity.isNew() === true) {
            throw new CollectionCreationError();
        }

        const collectionId = collectionEntity.id;

        try {
            collectionEntity.bannerImage = await this.dataService.trySaveUri(req.sessionAccountEntity.accountId, collectionEntity.bannerImage);
            collectionEntity.mainImage = await this.dataService.trySaveUri(req.sessionAccountEntity.accountId, collectionEntity.mainImage);
        } catch (e) {
            throw new DataServiceError();
        }

        const collectionDbEntity = await this.collectionService.findOne(collectionId, req.transaction, req.transaction.LOCK.UPDATE);

        let oldUris = [];
        if (collectionDbEntity !== null) {
            oldUris = [collectionDbEntity.mainImage, collectionDbEntity.bannerImage];
        }

        const newUris = [collectionEntity.mainImage, collectionEntity.bannerImage];

        let collectionEntityResult: CollectionEntity;
        try {
            if (req.sessionAccountEntity.isAdmin()) {
                collectionEntity.markQueued();
            }
            collectionEntityResult = await this.collectionService.updateOne(collectionId, collectionEntity, req.transaction);
            this.dataService.cleanUpOldUris(oldUris, newUris);
        } catch (ex) {
            this.dataService.cleanUpNewUris(oldUris, newUris);
            const errMessage = ex.response?.message;
            switch (errMessage) {
                case ERROR_TYPES.COLLECTION_DENOM_EXISTS_ERROR:
                case ERROR_TYPES.COLLECTION_WRONG_DENOM_ERROR:
                case ERROR_TYPES.DATA_SERVICE_ERROR:
                    throw ex;
                default:
                    throw new CollectionCreationError();
            }
        }

        return new ResEditCollection(collectionEntityResult);
    }

    // used by the chain-ibserver
    @Put('trigger-updates')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @UseGuards(ApiKeyGuard)
    async updateCollectionsChainData(
        @Req() req: AppRequest,
        @Body() reqUpdateCollectionChainData: ReqUpdateCollectionChainData,
    ): Promise<void> {
        const { denomIds, collectionIds, module, height } = reqUpdateCollectionChainData;

        const bdJunoParsedHeight = await this.graphqlService.fetchLastParsedHeight();

        if (height > bdJunoParsedHeight) {
            throw new Error(`BDJuno not yet on block:  ${height}`);
        }

        if (module === ModuleName.MARKETPLACE) {
            const chainMarketplaceCollectionEntitiesByDenoms = await this.collectionService.getChainMarketplaceCollectionsByDenomIds(denomIds);
            const chainMarketplaceCollectionEntitiesByIds = await this.collectionService.getChainMarketplaceCollectionsByIds(collectionIds);

            if (chainMarketplaceCollectionEntitiesByDenoms.length !== denomIds.length) {
                throw new Error(`BDJuno is updated but marketpalce collections are missing (fetch by denomIds) looking for ${denomIds.join(', ')} found ${chainMarketplaceCollectionEntitiesByDenoms.join(', ')}`);
            }
            if (chainMarketplaceCollectionEntitiesByIds.length !== collectionIds.length) {
                throw new Error(`BDJuno is updated but marketpalce collections are missing (fetch by collectionIds) looking for ${collectionIds.join(', ')} found ${chainMarketplaceCollectionEntitiesByIds.join(', ')}`);
            }

            const chainMarketplaceCollectionEntitiesMap = new Map();
            const chainMarketplaceCollectionEntities = [];
            chainMarketplaceCollectionEntitiesByDenoms.forEach((chainMarketplaceCollectionEntity) => {
                chainMarketplaceCollectionEntitiesMap.set(chainMarketplaceCollectionEntity.denomId, chainMarketplaceCollectionEntity);
            });
            chainMarketplaceCollectionEntitiesByIds.forEach((chainMarketplaceCollectionEntity) => {
                chainMarketplaceCollectionEntitiesMap.set(chainMarketplaceCollectionEntity.denomId, chainMarketplaceCollectionEntity);
            });
            chainMarketplaceCollectionEntitiesMap.forEach((chainMarketplaceCollectionEntity) => {
                chainMarketplaceCollectionEntities.push(chainMarketplaceCollectionEntity);
            });

            for (let i = 0; i < chainMarketplaceCollectionEntities.length; i++) {
                const chainMarketplaceCollectionEntity = chainMarketplaceCollectionEntities[i];
                const denomId = chainMarketplaceCollectionEntity.denomId;

                const collectionEntity = await this.collectionService.findOneByDenomId(denomId);
                if (!collectionEntity) {
                    return;
                }

                // TODO: those shouldnt be changeable?
                // updateCollectionDto.denom_id = denomId;
                // updateCollectionDto.royalties = chainMarketplaceCollectionEntity.;
                // updateCollectionDto.creator = chainMarketplaceCollectionEntity.creator;
                collectionEntity.status = chainMarketplaceCollectionEntity.verified === true ? CollectionStatus.APPROVED : CollectionStatus.DELETED;

                await this.collectionService.updateOneByDenomId(denomId, collectionEntity, req.transaction);
            }
        } else if (module === ModuleName.NFT) {
            const chainNftCollectionEntities = await this.collectionService.getChainNftCollectionsByDenomIds(denomIds);

            if (chainNftCollectionEntities.length !== denomIds.length) {
                throw new Error('BDJuno is updated but nft collection entities are missing');
            }

            for (let i = 0; i < chainNftCollectionEntities.length; i++) {
                const chainNftCollectionEntity = chainNftCollectionEntities[i];
                const denomId = chainNftCollectionEntity.id;
                const collectionEntity = await this.collectionService.findOneByDenomId(denomId);

                if (!collectionEntity) {
                    return;
                }

                collectionEntity.name = chainNftCollectionEntity.name;
                collectionEntity.description = chainNftCollectionEntity.description;

                await this.collectionService.updateOneByDenomId(denomId, collectionEntity, req.transaction);
            }
        }
    }
}
