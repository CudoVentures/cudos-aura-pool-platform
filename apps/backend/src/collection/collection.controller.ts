import {
    Body,
    Controller,
    Get,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
    UseInterceptors,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ModuleName, ReqCreditCollection, ReqFetchCollectionDetails, ReqFetchCollectionsByFilter, ReqUpdateCollectionChainData } from './dto/requests.dto';
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
import { ResFetchCollectionsByFilter, ResCreditCollection, ResFetchCollectionDetails } from './dto/responses.dto';
import CollectionFilterEntity from './entities/collection-filter.entity';
import NftFilterEntity from '../nft/entities/nft-filter.entity';

@ApiTags('Collection')
@Controller('collection')
export class CollectionController {
    constructor(
        private collectionService: CollectionService,
        private nftService: NFTService,
        private dataService: DataService,
    // eslint-disable-next-line no-empty-function
    ) {}

    @Post()
    async findAll(
        @Body(new ValidationPipe({ transform: true })) reqFetchCollectionsByFilter: ReqFetchCollectionsByFilter,
    ): Promise < ResFetchCollectionsByFilter > {
        const collectionFilterEntity = CollectionFilterEntity.fromJson(reqFetchCollectionsByFilter.collectionFilter);

        const { collectionEntities, total } = await this.collectionService.findByFilter(collectionFilterEntity);

        return new ResFetchCollectionsByFilter(collectionEntities, total);
    }

    @Post('details')
    async getDetails(@Query('ids') req: ReqFetchCollectionDetails): Promise<ResFetchCollectionDetails> {
        const collectionIds = req.collectionIds;

        const getCollectionDetails = collectionIds.map(async (collectionId) => this.collectionService.getDetails(parseInt(collectionId)))
        const collectionDetails = await Promise.all(getCollectionDetails)

        return new ResFetchCollectionDetails(collectionDetails);
    }

    @ApiBearerAuth('access-token')
    @UseGuards(RoleGuard([AccountType.ADMIN, AccountType.SUPER_ADMIN]), IsCreatorOrSuperAdminGuard, IsFarmApprovedGuard)
    @UseInterceptors(TransactionInterceptor)
    @Put()
    async createOrEdit(
        @Req() req: AppRequest,
        @Body() reqCreditCollection: ReqCreditCollection,
    ): Promise<ResCreditCollection> {
        const { collectionDto, nftDtos } = reqCreditCollection
        const collectionEntity = CollectionEntity.fromJson(collectionDto);
        const nftEntities = nftDtos.map((nftDto) => NftEntity.fromJson(nftDto));

        const collectionId = collectionEntity.id;

        try {
            collectionEntity.bannerImage = await this.dataService.trySaveUri(req.sessionAccountEntity.accountId, collectionEntity.bannerImage);
            collectionEntity.mainImage = await this.dataService.trySaveUri(req.sessionAccountEntity.accountId, collectionEntity.mainImage);
            for (let i = nftEntities.length; i-- > 0;) {
                nftEntities[i].uri = await this.dataService.trySaveUri(req.sessionAccountEntity.accountId, nftEntities[i].uri);
            }
        } catch (e) {
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

        let collectionEntityResult: CollectionEntity, nftEntityResults: NftEntity[] = [], nftsToDelete: NftEntity[] = [];
        try {
            if (collectionId < 0) {
                collectionEntity.creatorId = req.sessionAdminEntity.accountId;
                collectionEntityResult = await this.collectionService.createOne(collectionEntity, req.transaction);

                const nfts = nftEntities.map(async (nftEntity) => {
                    nftEntity.collectionId = collectionEntityResult.id;
                    nftEntity.creatorId = req.sessionAdminEntity.accountId;
                    const createdNftEntity = await this.nftService.createOne(nftEntity, req.transaction);
                    return createdNftEntity
                })

                nftEntityResults = await Promise.all(nfts)
            } else {
                collectionEntityResult = await this.collectionService.updateOne(collectionId, collectionEntity, req.transaction);
                const tempNftFilterEntity = new NftFilterEntity();
                tempNftFilterEntity.collectionIds = [collectionId.toString()];
                const { nftEntities: collectionDbNftEntities } = await this.nftService.findByFilter(null, tempNftFilterEntity);

                // DELETE nfts in db but not in reques
                nftsToDelete = collectionDbNftEntities.filter((nft) => nftEntities.findIndex((item) => item.id === nft.id) === -1);
                await this.nftService.deleteMany(nftsToDelete);

                // CREATE OR UPDATE rest
                const nftsToCreateOrEdit = nftEntities.map(async (nftEntity) => {
                    // not a new nftEntity
                    if (!nftEntity.isNew()) {
                        return this.nftService.updateOne(nftEntity.id, nftEntity, req.transaction)
                    }

                    nftEntity.collectionId = collectionEntityResult.id;
                    nftEntity.creatorId = req.sessionAccountEntity.accountId;
                    return this.nftService.createOne(nftEntity, req.transaction)
                })

                nftEntityResults = await Promise.all(nftsToCreateOrEdit)
            }

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

        return new ResCreditCollection(collectionEntityResult, nftEntityResults, nftsToDelete.length);
    }

    @Put('trigger-updates')
    @UseInterceptors(TransactionInterceptor)
    async updateCollectionsChainData(
        @Req() req: AppRequest,
        @Body() reqUpdateCollectionChainData: ReqUpdateCollectionChainData,
    ): Promise<void> {
        const denomIds = reqUpdateCollectionChainData.denomIds;
        const module = reqUpdateCollectionChainData.module;

        if (module === ModuleName.MARKETPLACE) {
            const chainMarketplaceCollectionDtos = await this.collectionService.getChainMarketplaceCollectionsByDenomIds(denomIds);

            if (chainMarketplaceCollectionDtos.length !== denomIds.length) {
                throw new Error('Collections not yet found in BDJuno');
            }

            for (let i = 0; i < chainMarketplaceCollectionDtos.length; i++) {
                const chainMarketplaceCollectionDto = chainMarketplaceCollectionDtos[i];
                const denomId = chainMarketplaceCollectionDto.denomId;

                const collectionEntity = await this.collectionService.findOneByDenomId(denomId);

                // TODO: those shouldnt be changeable?
                // updateCollectionDto.denom_id = denomId;
                // updateCollectionDto.royalties = chainMarketplaceCollectionDto.;
                // updateCollectionDto.creator = chainMarketplaceCollectionDto.creator;
                collectionEntity.status = chainMarketplaceCollectionDto.verified === true ? CollectionStatus.APPROVED : CollectionStatus.DELETED;

                await this.collectionService.updateOneByDenomId(denomId, collectionEntity, req.transaction);
            }
        } else if (module === ModuleName.NFT) {
            const chainNftCollectionDtos = await this.collectionService.getChainNftCollectionsByDenomIds(denomIds);

            if (chainNftCollectionDtos.length !== denomIds.length) {
                throw new Error('Collections not yet found in BDJuno');
            }

            for (let i = 0; i < chainNftCollectionDtos.length; i++) {
                const chainNftCollectionDto = chainNftCollectionDtos[i];
                const denomId = chainNftCollectionDto.id;
                const collectionEntity = await this.collectionService.findOneByDenomId(denomId);

                collectionEntity.name = chainNftCollectionDto.name;
                collectionEntity.description = chainNftCollectionDto.description;

                await this.collectionService.updateOneByDenomId(denomId, collectionEntity, req.transaction);
            }
        }
    }
}
