import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
    UseInterceptors,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CollectionDto } from './dto/collection.dto';
import { CollectionService } from './collection.service';
import { Collection } from './collection.model';
import { NFTService } from '../nft/nft.service';
import { NFT } from '../nft/nft.model';
import RoleGuard from '../auth/guards/role.guard';
import { IsCreatorOrSuperAdminGuard } from './guards/is-creator-or-super-admin.guard';
import { UpdateCollectionStatusDto } from './dto/update-collection-status.dto';
import { IsFarmApprovedGuard } from './guards/is-farm-approved.guard';
import { CollectionDetailsResponseDto } from './dto/collection-details-response.dto';
import CollectionFilterModel from './dto/collection-filter.model';
import DataService from '../data/data.service';
import { ModuleName, UpdateCollectionChainDataRequestDto } from './dto/update-collection-chain-data-request.dto';
import { CollectionStatus } from './utils';
import { AppRequest } from '../common/commont.types';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AccountType } from '../account/account.types';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CollectionCreationError, DataServiceError, ERROR_TYPES } from '../common/errors/errors';
import { NOT_EXISTS_INT } from '../common/utils';

@ApiTags('Collection')
@Controller('collection')
export class CollectionController {
    constructor(
        private collectionService: CollectionService,
        private nftService: NFTService,
        private dataService: DataService,
    ) {}

    @Post()
    async findAll(
        @Body(new ValidationPipe({ transform: true })) collectionFilterModel: CollectionFilterModel,
    ): Promise < { collectionEntities: Collection[], total: number } > {
        return this.collectionService.findByFilter(collectionFilterModel);
    }

    @Get('details')
    async getDetails(@Query('ids') ids: string): Promise<CollectionDetailsResponseDto[]> {
        const collectionIds = ids === '' ? [] : ids.split(',').map((id) => Number(id))

        const getCollectionDetails = collectionIds.map(async (collectionId) => this.collectionService.getDetails(collectionId))
        const collectionDetails = await Promise.all(getCollectionDetails)

        return collectionDetails
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<Collection> {
        return this.collectionService.findOne(id);
    }

    @Get(':id/nfts')
    async findNfts(@Param('id', ParseIntPipe) id: number): Promise<NFT[]> {
        return this.nftService.findByCollectionId(id);
    }

    @ApiBearerAuth('access-token')
    @UseGuards(RoleGuard([AccountType.ADMIN, AccountType.SUPER_ADMIN]), IsCreatorOrSuperAdminGuard, IsFarmApprovedGuard)
    @UseInterceptors(TransactionInterceptor)
    @Put()
    async createOrEdit(
        @Req() req: AppRequest,
        @Body() collectionDto: CollectionDto,
    ): Promise<{collection: Collection, nfts: NFT[], deletedNfts: number}> {
        const { id, nfts: nftArray, ...collectionRest } = collectionDto

        try {
            collectionRest.banner_image = await this.dataService.trySaveUri(req.sessionAccountEntity.accountId, collectionRest.banner_image);
            collectionRest.main_image = await this.dataService.trySaveUri(req.sessionAccountEntity.accountId, collectionRest.main_image);
            for (let i = nftArray.length; i-- > 0;) {
                nftArray[i].uri = await this.dataService.trySaveUri(req.sessionAccountEntity.accountId, nftArray[i].uri);
            }
        } catch (e) {
            throw new DataServiceError();
        }

        const collectionDb = await this.collectionService.findOne(id, req.transaction, req.transaction.LOCK.UPDATE);
        const collectionNftsDb = await this.nftService.findByCollectionId(id, req.transaction, req.transaction.LOCK.UPDATE)

        let oldUris = [];
        if (collectionDb !== null) {
            oldUris = [collectionDb.main_image, collectionDb.banner_image];
            collectionNftsDb.forEach((nft) => {
                oldUris.push(nft.uri);
            });
        }

        const newUris = [collectionRest.main_image, collectionRest.banner_image];
        nftArray.forEach((nft) => {
            newUris.push(nft.uri);
        });

        let collection, nftResults, deletedNfts = [];
        try {
            if (id < 0) {
                collection = await this.collectionService.createOne(collectionRest, req.sessionAdminEntity.accountId, req.transaction);

                const nfts = nftArray.map(async (nft) => {
                    const { id: tempId, uri, ...nftRest } = nft
                    nftRest.uri = uri;
                    nftRest.marketplace_nft_id = NOT_EXISTS_INT;
                    const createdNft = await this.nftService.createOne({ ...nftRest, collection_id: collection.id }, req.sessionAdminEntity.accountId, req.transaction)

                    return createdNft
                })

                nftResults = await Promise.all(nfts)
            } else {

                collection = await this.collectionService.updateOne(id, collectionRest, req.transaction);
                const collectionNfts = await this.nftService.findByCollectionId(id, req.transaction, req.transaction.LOCK.UPDATE)

                const nftsToDelete = collectionNfts.filter((nft) => nftArray.findIndex((item) => item.id === nft.id))
                const deleteNfts = nftsToDelete.map(async (nft) => { return nft.destroy() })
                deletedNfts = await Promise.all(deleteNfts)

                const nftsToCreateOrEdit = nftArray.map(async (nft) => {
                    if (!Number(nft.id)) {
                        return this.nftService.updateOne(nft.id, nft, req.transaction)
                    }

                    return this.nftService.createOne({ ...nft, collection_id: collection.id }, req.sessionAccountEntity.accountId, req.transaction)
                })

                nftResults = await Promise.all(nftsToCreateOrEdit)
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

        return {
            collection,
            nfts: nftResults,
            deletedNfts: deletedNfts.length,
        }
    }

    @Put('trigger-updates')
    @UseInterceptors(TransactionInterceptor)
    async updateCollectionsChainData(
        @Req() req: AppRequest,
        @Body() updateCollectionChainDataRequestDto: UpdateCollectionChainDataRequestDto,
    ): Promise<void> {
        const denomIds = updateCollectionChainDataRequestDto.denomIds;
        const module = updateCollectionChainDataRequestDto.module;

        if (module === ModuleName.MARKETPLACE) {
            const chainMarketplaceCollectionDtos = await this.collectionService.getChainMarketplaceCollectionsByDenomIds(denomIds);

            if (chainMarketplaceCollectionDtos.length !== denomIds.length) {
                throw new Error('Collections not yet found in BDJuno');
            }

            for (let i = 0; i < chainMarketplaceCollectionDtos.length; i++) {
                const chainMarketplaceCollectionDto = chainMarketplaceCollectionDtos[i];
                const denomId = chainMarketplaceCollectionDto.denomId;
                const updateCollectionDto = new UpdateCollectionDto();

                // TODO: those shouldnt be changeable?
                // updateCollectionDto.denom_id = denomId;
                // updateCollectionDto.royalties = chainMarketplaceCollectionDto.;
                // updateCollectionDto.creator = chainMarketplaceCollectionDto.creator;
                updateCollectionDto.status = chainMarketplaceCollectionDto.verified === true ? CollectionStatus.APPROVED : CollectionStatus.DELETED;

                await this.collectionService.updateOneByDenomId(denomId, updateCollectionDto, req.transaction);
            }
        } else if (module === ModuleName.NFT) {
            const chainNftCollectionDtos = await this.collectionService.getChainNftCollectionsByDenomIds(denomIds);

            if (chainNftCollectionDtos.length !== denomIds.length) {
                throw new Error('Collections not yet found in BDJuno');
            }

            for (let i = 0; i < chainNftCollectionDtos.length; i++) {
                const chainNftCollectionDto = chainNftCollectionDtos[i];
                const denomId = chainNftCollectionDto.id;

                const collection = new UpdateCollectionDto();
                collection.name = chainNftCollectionDto.name;
                collection.description = chainNftCollectionDto.description;
                collection.denom_id = denomId;
                collection.description = chainNftCollectionDto.description;

                await this.collectionService.updateOneByDenomId(denomId, collection, req.transaction);
            }
        }
    }

    @ApiBearerAuth('access-token')
    @UseGuards(RoleGuard([AccountType.SUPER_ADMIN]))
    @UseInterceptors(TransactionInterceptor)
    @Patch(':id/status')
    async updateStatus(
        @Req() req: AppRequest,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCollectionStatusDto: UpdateCollectionStatusDto,
    ): Promise<void> {
        await this.collectionService.updateStatus(
            id,
            updateCollectionStatusDto.status,
            req.transaction,
        );

        // const nftFilterModel = new NftFilterModel();
        // nftFilterModel.collectionIds = [id.toString()];
        // const { nftEntities } = await this.nftService.findByFilter(req.sessionUser, nftFilterModel);
        // const nftsToApprove = nftEntities.map(async (nft) => this.nftService.updateStatus(nft.id, NftStatus.APPROVED))

        // await Promise.all(nftsToApprove)
    }

    @ApiBearerAuth('access-token')
    @UseGuards(RoleGuard([AccountType.ADMIN]), IsCreatorOrSuperAdminGuard)
    @UseInterceptors(TransactionInterceptor)
    @Delete(':id')
    async delete(
        @Req() req: AppRequest,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<Collection> {
        return this.collectionService.deleteOne(id, req.transaction);
    }
}
