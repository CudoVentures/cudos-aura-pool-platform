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
import { CollectionFilters } from './utils';
import { ParseCollectionQueryPipe } from './pipes/collection-query.pipe';
import { IsFarmApprovedGuard } from './guards/is-farm-approved.guard';
import { NftStatus } from '../nft/utils';
import CollectionFilterModel from './dto/collection-filter.model';

@ApiTags('Collection')
@Controller('collection')
export class CollectionController {
    constructor(
    private collectionService: CollectionService,
    private nftService: NFTService,
    ) {}

    @Post()
    async findAll(
        @Body(new ValidationPipe({ transform: true })) collectionFilterModel: CollectionFilterModel,
    ): Promise < { collectionEntities: Collection[], total: number } > {
        return this.collectionService.findByFilter(collectionFilterModel);
    }

    @Get('details')
    async getDetails(@Query('ids') ids: string): Promise<any> {
        const collectionIds = ids.split(',').map((id) => Number(id))

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
        @Request() req,
        @Body() collectionDto: CollectionDto,
    ): Promise<{collection: Collection, nfts: NFT[], deletedNfts: number}> {
        const { id, nfts: nftArray, ...collectionRest } = collectionDto

        // Collection doesn't exist
        if (id < 0) {
            const collection = await this.collectionService.createOne(collectionRest, req.user.id);

            const nfts = nftArray.map(async (nft) => {
                const { id: tempId, uri, ...nftRest } = nft
                nftRest.uri = uri;
                const createdNft = await this.nftService.createOne({ ...nftRest, collection_id: collection.id }, req.user.id)

                return createdNft
            })

            const nftsResult = await Promise.all(nfts)

            return {
                collection,
                nfts: nftsResult,
                deletedNfts: 0,
            }
        }

        const collection = await this.collectionService.updateOne(id, collectionRest);
        const collectionNfts = await this.nftService.findByCollectionId(id)

        const nftsToDelete = collectionNfts.filter((nft) => nftArray.findIndex((item) => item.id === nft.id))
        const deleteNfts = nftsToDelete.map(async (nft) => { return nft.destroy() })
        const deletedResult = await Promise.all(deleteNfts)

        const nftsToCreateOrEdit = nftArray.map(async (nft) => {
            if (!Number(nft.id)) {
                return this.nftService.updateOne(nft.id, nft)
            }

            return this.nftService.createOne({ ...nft, collection_id: collection.id }, req.user.id)
        })

        const creditedNfts = await Promise.all(nftsToCreateOrEdit)

        return {
            collection,
            nfts: creditedNfts,
            deletedNfts: deletedResult.length,
        }
    }

    @ApiBearerAuth('access-token')
    @UseGuards(RoleGuard([Role.SUPER_ADMIN]))
    @Patch(':id/status')
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCollectionStatusDto: UpdateCollectionStatusDto,
    ): Promise<void> {
        await this.collectionService.updateStatus(
            id,
            updateCollectionStatusDto.status,
        );

        const nftsToUpdate = await this.nftService.findByFilter({ collection_id: id })
        const nftsToApprove = nftsToUpdate.map(async (nft) => this.nftService.updateStatus(nft.id, NftStatus.APPROVED))

        await Promise.all(nftsToApprove)
    }

    @ApiBearerAuth('access-token')
    @UseGuards(RoleGuard([Role.FARM_ADMIN]), IsCreatorGuard)
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number): Promise<Collection> {
        return this.collectionService.deleteOne(id);
    }
}
