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
    Request,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CollectionDto } from './dto/collection.dto';
import { CollectionService } from './collection.service';
import { Collection } from './collection.model';
import { NFTService } from '../nft/nft.service';
import { NFT } from '../nft/nft.model';
import RoleGuard from '../auth/guards/role.guard';
import { Role } from '../user/roles';
import { IsCreatorGuard } from './guards/is-creator.guard';
import { UpdateCollectionStatusDto } from './dto/update-collection-status.dto';
import { IsFarmApprovedGuard } from './guards/is-farm-approved.guard';
import { CollectionDetailsResponseDto } from './dto/collection-details-response.dto';
import { NftStatus } from '../nft/nft.types';
import CollectionFilterModel from './dto/collection-filter.model';
import NftFilterModel from '../nft/dto/nft-filter.model';
import { RequestWithSessionUser } from '../auth/interfaces/request.interface';
import DataService from '../data/data.service';
import { ModuleName, UpdateCollectionChainDataRequestDto } from './dto/update-collection-chain-data-request.dto';
import { IntBoolValue } from '../common/utils';
import { CollectionStatus } from './utils';

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
    @UseGuards(RoleGuard([Role.FARM_ADMIN, Role.SUPER_ADMIN]), IsCreatorGuard, IsFarmApprovedGuard)
    @Put()
    async createOrEdit(
        @Request() req: RequestWithSessionUser,
        @Body() collectionDto: CollectionDto,
    ): Promise<{collection: Collection, nfts: NFT[], deletedNfts: number}> {
        const { id, nfts: nftArray, ...collectionRest } = collectionDto

        collectionRest.banner_image = await this.dataService.trySaveUri(req.sessionUser.id, collectionRest.banner_image);
        collectionRest.main_image = await this.dataService.trySaveUri(req.sessionUser.id, collectionRest.main_image);
        for (let i = nftArray.length; i-- > 0;) {
            nftArray[i].uri = await this.dataService.trySaveUri(req.sessionUser.id, nftArray[i].uri);
        }

        const collectionDb = await this.collectionService.findOne(id);
        const collectionNftsDb = await this.nftService.findByCollectionId(id)

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
                collection = await this.collectionService.createOne(collectionRest, req.sessionUser.id);

                const nfts = nftArray.map(async (nft) => {
                    const { id: tempId, uri, ...nftRest } = nft
                    nftRest.uri = uri;
                    const createdNft = await this.nftService.createOne({ ...nftRest, collection_id: collection.id }, req.sessionUser.id)

                    return createdNft
                })

                nftResults = await Promise.all(nfts)
            } else {

                collection = await this.collectionService.updateOne(id, collectionRest);
                const collectionNfts = await this.nftService.findByCollectionId(id)

                const nftsToDelete = collectionNfts.filter((nft) => nftArray.findIndex((item) => item.id === nft.id))
                const deleteNfts = nftsToDelete.map(async (nft) => { return nft.destroy() })
                deletedNfts = await Promise.all(deleteNfts)

                const nftsToCreateOrEdit = nftArray.map(async (nft) => {
                    if (!Number(nft.id)) {
                        return this.nftService.updateOne(nft.id, nft)
                    }

                    return this.nftService.createOne({ ...nft, collection_id: collection.id }, req.sessionUser.id)
                })

                nftResults = await Promise.all(nftsToCreateOrEdit)
            }
            this.dataService.cleanUpOldUris(oldUris, newUris);
        } catch (ex) {
            this.dataService.cleanUpNewUris(oldUris, newUris);
            throw ex;
        }
        return {
            collection,
            nfts: nftResults,
            deletedNfts: deletedNfts.length,
        }
    }

    @Put('trigger-updates')
    async updateCollectionsChainData(
        @Body() updateCollectionChainDataRequestDto: UpdateCollectionChainDataRequestDto,
    ): Promise<void> {
        const denomIds = updateCollectionChainDataRequestDto.denomIds;
        const module = updateCollectionChainDataRequestDto.module;

        if (module === ModuleName.MARKETPLACE) {
            const chainMarketplaceCollectionDtos = await this.collectionService.getChainMarketplaceCollectionsByDenomIds(denomIds);
            for (let i = 0; i < chainMarketplaceCollectionDtos.length; i++) {
                const chainMarketplaceCollectionDto = chainMarketplaceCollectionDtos[i];
                const denomId = chainMarketplaceCollectionDto.denomId;
                const collection = new Collection();

                // those shouldnt be changeable?
                // collection.denom_id = denomId;
                // collection.royalties = chainMarketplaceCollectionDto.;
                // collection.creator = chainMarketplaceCollectionDto.creator;

                collection.status = chainMarketplaceCollectionDto.verified === IntBoolValue.TRUE ? CollectionStatus.APPROVED : CollectionStatus.REJECTED;

                await this.collectionService.updateOneByDenomId(denomId, collection);
            }
        } else if (module === ModuleName.NFT) {
            const chainNftCollectionDtos = await this.collectionService.getChainNftCollectionsByDenomIds(denomIds);
            for (let i = 0; i < chainNftCollectionDtos.length; i++) {
                const chainNftCollectionDto = chainNftCollectionDtos[i];
                const denomId = chainNftCollectionDto.id;

                const collection = new Collection();
                collection.name = chainNftCollectionDto.name;
                collection.description = chainNftCollectionDto.description;
                collection.denom_id = denomId;
                collection.description = chainNftCollectionDto.description;
                collection.updatedAt = Date.now();

                await this.collectionService.updateOneByDenomId(denomId, collection);
            }
        }
    }

    @ApiBearerAuth('access-token')
    @UseGuards(RoleGuard([Role.SUPER_ADMIN]))
    @Patch(':id/status')
    async updateStatus(
        @Req() req: RequestWithSessionUser,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCollectionStatusDto: UpdateCollectionStatusDto,
    ): Promise<void> {
        await this.collectionService.updateStatus(
            id,
            updateCollectionStatusDto.status,
        );

        const nftFilterModel = new NftFilterModel();
        nftFilterModel.collectionIds = [id.toString()];
        const { nftEntities } = await this.nftService.findByFilter(req.sessionUser, nftFilterModel);
        const nftsToApprove = nftEntities.map(async (nft) => this.nftService.updateStatus(nft.id, NftStatus.APPROVED))

        await Promise.all(nftsToApprove)
    }

    @ApiBearerAuth('access-token')
    @UseGuards(RoleGuard([Role.FARM_ADMIN]), IsCreatorGuard)
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number): Promise<Collection> {
        return this.collectionService.deleteOne(id);
    }
}
