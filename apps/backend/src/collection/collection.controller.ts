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
import { CollectionCreationError, CollectionDenomExistsError, DataServiceError, ERROR_TYPES } from '../common/errors/errors';
import { CollectionEntity } from './entities/collection.entity';
import NftEntity from '../nft/entities/nft.entity';
import { ResFetchCollectionsByFilter, ResCreditCollection, ResFetchCollectionDetails, ResEditCollection, ResFetchTopCollections } from './dto/responses.dto';
import CollectionFilterEntity from './entities/collection-filter.entity';
import NftFilterEntity from '../nft/entities/nft-filter.entity';
import { GraphqlService } from '../graphql/graphql.service';
import { FarmService } from '../farm/farm.service';
import ApiKeyGuard from '../auth/guards/api-key.guard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { HttpService } from '@nestjs/axios';

@Controller('collection')
export class CollectionController {

    isCreatorOrSuperAdminGuard: IsCreatorOrSuperAdminGuard;
    isFarmApprovedGuard: IsFarmApprovedGuard;

    constructor(
        @Inject(forwardRef(() => CollectionService))
        private collectionService: CollectionService,
        private nftService: NFTService,
        private dataService: DataService,
        private graphqlService: GraphqlService,
        private farmService: FarmService,
        private readonly httpService: HttpService,
    ) {
        this.isCreatorOrSuperAdminGuard = new IsCreatorOrSuperAdminGuard(this.collectionService, this.farmService);
        this.isFarmApprovedGuard = new IsFarmApprovedGuard(this.farmService);
    }

    @Post()
    @UseInterceptors(TransactionInterceptor)
    @Throttle(40, 1)
    @HttpCode(200)
    async findAll(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqFetchCollectionsByFilter: ReqFetchCollectionsByFilter,
    ): Promise < ResFetchCollectionsByFilter > {
        const collectionFilterEntity = CollectionFilterEntity.fromJson(reqFetchCollectionsByFilter.collectionFilter);

        const { collectionEntities, total } = await this.collectionService.findByFilter(collectionFilterEntity, req.transaction);

        return new ResFetchCollectionsByFilter(collectionEntities, total);
    }

    @Post('fetchTopCollections')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @Throttle(10, 1)
    async fetchTopCollections(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqFetchTopCollections: ReqFetchTopCollections,
    ): Promise < ResFetchTopCollections > {
        const collectionEntities = await this.collectionService.findTopCollections(reqFetchTopCollections.timestampFrom, reqFetchTopCollections.timestampTo, req.transaction);
        return new ResFetchTopCollections(collectionEntities);
    }

    @Post('details')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @Throttle(20, 30)
    async getDetails(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqFetchCollectionDetails: ReqFetchCollectionDetails,
    ): Promise<ResFetchCollectionDetails> {
        const collectionIds = reqFetchCollectionDetails.collectionIds;

        const getCollectionDetails = collectionIds.map(async (collectionId) => this.collectionService.getDetails(parseInt(collectionId), req.transaction))
        const collectionDetails = await Promise.all(getCollectionDetails)

        return new ResFetchCollectionDetails(collectionDetails);
    }

    @UseGuards(RoleGuard([AccountType.ADMIN, AccountType.SUPER_ADMIN]))
    @UseInterceptors(TransactionInterceptor)
    @Put()
    @HttpCode(200)
    @Throttle(5, 30)
    async creditCollection(
        @Req() req: AppRequest,
        @Body() reqCreditCollection: ReqCreditCollection,
    ): Promise<ResCreditCollection> {
        this.isCreatorOrSuperAdminGuard.canActivate(req, reqCreditCollection);
        this.isFarmApprovedGuard.canActivate(req, reqCreditCollection);

        const { collectionDto, nftDtos } = reqCreditCollection
        const collectionEntity = CollectionEntity.fromJson(collectionDto);
        const nftEntities = nftDtos.map((nftDto) => NftEntity.fromJson(nftDto));

        const collectionId = collectionEntity.id;

        const miningFarmDb = await this.farmService.findMiningFarmById(collectionEntity.farmId, req.transaction);
        const collectionOwnerAccountId = miningFarmDb.accountId;

        try {
            collectionEntity.bannerImage = await this.dataService.trySaveUri(collectionOwnerAccountId, collectionEntity.bannerImage);
            collectionEntity.mainImage = await this.dataService.trySaveUri(collectionOwnerAccountId, collectionEntity.mainImage);
            const uniqueUrlsMap = new Map < string, string >();
            for (let i = nftEntities.length; i-- > 0;) {
                const nftEntity = nftEntities[i];
                if (this.dataService.isUrlUploadedImage(nftEntity.uri) === true) {
                    if (uniqueUrlsMap.has(nftEntity.uri) === false) {
                        const response = await this.httpService.axiosRef.get(nftEntity.uri, { responseType: 'arraybuffer' });
                        const base64 = Buffer.from(response.data, 'binary').toString('base64');
                        const uri = `data:image/png;base64,${base64}`;
                        uniqueUrlsMap.set(nftEntity.uri, uri);
                    }
                    nftEntity.uri = uniqueUrlsMap.get(nftEntity.uri);
                }
            }
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
        const { nftEntities: collectionNftDbEntities } = await this.nftService.findByFilter(null, nftFilterEntity, req.transaction, req.transaction.LOCK.UPDATE);

        let oldUris = [];
        if (collectionDbEntity !== null) {
            if (collectionEntity.isNew() === true) {
                throw new CollectionCreationError(); // cannot be new and with a db ref at the same time
            }

            // if collection is still queued, we can change the denomId
            if (collectionDbEntity.isQueued()) {
                collectionEntity.denomId = collectionEntity.name.toLowerCase().replace(/ /g, '');
            } else {
                collectionEntity.denomId = collectionDbEntity.denomId; // to ensure that denomId is not changed once the collection is created
            }

            oldUris = [collectionDbEntity.mainImage, collectionDbEntity.bannerImage];
            collectionNftDbEntities.forEach((nft) => {
                oldUris.push(nft.uri);
            });
        } else {
            if (collectionEntity.isNew() === false) {
                throw new CollectionCreationError(); // cannot be old and without a db ref at the same time
            }

            collectionEntity.denomId = collectionEntity.name.toLowerCase().replace(/ /g, '');

            const collectionEntityByDenomId = await this.collectionService.findFirstByDenomId(collectionEntity.denomId, req.transaction, req.transaction.LOCK.UPDATE);
            if (collectionEntityByDenomId !== null) {
                throw new CollectionDenomExistsError();
            }
        }

        const newUris = [collectionEntity.mainImage, collectionEntity.bannerImage];
        nftEntities.forEach((nftEntity) => {
            newUris.push(nftEntity.uri);
        });

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
                const { nftEntities: collectionDbNftEntities } = await this.nftService.findByFilter(null, tempNftFilterEntity, req.transaction, req.transaction.LOCK.UPDATE);

                // DELETE nfts in db but not in reques
                nftsToDelete = collectionDbNftEntities.filter((nft) => nftEntities.findIndex((item) => item.id === nft.id) === -1);
                await this.nftService.deleteMany(nftsToDelete, req.transaction);

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

    @UseGuards(RoleGuard([AccountType.ADMIN, AccountType.SUPER_ADMIN]))
    @UseInterceptors(TransactionInterceptor)
    @Put('editCollection')
    @HttpCode(200)
    @Throttle(5, 30)
    async edit(
        @Req() req: AppRequest,
        @Body() reqEditCollection: ReqEditCollection,
    ): Promise<ResEditCollection> {
        this.isCreatorOrSuperAdminGuard.canActivate(req, reqEditCollection);
        this.isFarmApprovedGuard.canActivate(req, reqEditCollection);

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
    @SkipThrottle()
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
            const chainMarketplaceCollectionEntitiesByDenoms = await this.graphqlService.fetchMarketplaceCollectionsByDenomIds(denomIds);
            const chainMarketplaceCollectionEntitiesByIds = await this.graphqlService.fetchMarketplaceCollectionsByIds(collectionIds);

            if (chainMarketplaceCollectionEntitiesByDenoms.length !== denomIds.length) {
                throw new Error(`BDJuno is updated but marketpalce collections are missing (fetch by denomIds) looking for ${denomIds.join(', ')} found ${chainMarketplaceCollectionEntitiesByDenoms.join(', ')}`);
            }
            if (chainMarketplaceCollectionEntitiesByIds.length !== collectionIds.length) {
                throw new Error(`BDJuno is updated but marketpalce collections are missing (fetch by collectionIds) looking for ${collectionIds.join(', ')} found ${chainMarketplaceCollectionEntitiesByIds.join(', ')}`);
            }

            // map is used to filter by denom ids so we don't make duplicated queries later
            const chainMarketplaceCollectionEntitiesMap = new Map();
            const chainMarketplaceCollectionEntities = [];
            chainMarketplaceCollectionEntitiesByDenoms.forEach((chainMarketplaceCollectionEntity) => {
                if (chainMarketplaceCollectionEntity.isPlatformCollection() === true) {
                    chainMarketplaceCollectionEntitiesMap.set(chainMarketplaceCollectionEntity.denomId, chainMarketplaceCollectionEntity);
                }
            });
            chainMarketplaceCollectionEntitiesByIds.forEach((chainMarketplaceCollectionEntity) => {
                if (chainMarketplaceCollectionEntity.isPlatformCollection() === true) {
                    chainMarketplaceCollectionEntitiesMap.set(chainMarketplaceCollectionEntity.denomId, chainMarketplaceCollectionEntity);
                }
            });
            chainMarketplaceCollectionEntitiesMap.forEach((chainMarketplaceCollectionEntity) => {
                chainMarketplaceCollectionEntities.push(chainMarketplaceCollectionEntity);
            });

            for (let i = 0; i < chainMarketplaceCollectionEntities.length; i++) {
                const chainMarketplaceCollectionEntity = chainMarketplaceCollectionEntities[i];
                const denomId = chainMarketplaceCollectionEntity.denomId;

                const collectionEntity = await this.collectionService.findFirstByDenomId(denomId, req.transaction, req.transaction.LOCK.UPDATE);
                if (!collectionEntity) {
                    return;
                }

                if (collectionEntity.isRejected() === false) {
                    collectionEntity.status = chainMarketplaceCollectionEntity.verified === true ? CollectionStatus.APPROVED : CollectionStatus.DELETED;
                    await this.collectionService.updateOneByIdAndDenomId(denomId, collectionEntity, req.transaction);
                }
            }
        } else if (module === ModuleName.NFT) {
            const chainNftCollectionEntities = await this.graphqlService.fetchNftCollectionsByDenomIds(denomIds);

            if (chainNftCollectionEntities.length !== denomIds.length) {
                throw new Error('BDJuno is updated but nft collection entities are missing');
            }

            for (let i = 0; i < chainNftCollectionEntities.length; i++) {
                const chainNftCollectionEntity = chainNftCollectionEntities[i];

                if (chainNftCollectionEntity.isPlatformCollection() === false) {
                    continue;
                }

                const denomId = chainNftCollectionEntity.id;
                const collectionEntity = await this.collectionService.findFirstByDenomId(denomId, req.transaction, req.transaction.LOCK.UPDATE);

                if (!collectionEntity) {
                    return;
                }

                collectionEntity.name = chainNftCollectionEntity.name;
                collectionEntity.description = chainNftCollectionEntity.description;

                await this.collectionService.updateOneByIdAndDenomId(denomId, collectionEntity, req.transaction);
            }
        }
    }
}
