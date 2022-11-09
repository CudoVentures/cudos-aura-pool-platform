import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Put,
    Query,
    Request,
    UseGuards,
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

@ApiTags('Collection')
@Controller('collection')
export class CollectionController {
    constructor(
    private collectionService: CollectionService,
    private nftService: NFTService,
    ) {}

    @Get()
    async findAll(
        @Query(ParseCollectionQueryPipe) filters: CollectionFilters,
    ): Promise<Collection[]> {
        return this.collectionService.findAll({ ...filters });
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
    @UseGuards(RoleGuard([Role.FARM_ADMIN]), IsCreatorGuard, IsFarmApprovedGuard)
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
                const createdNft = await this.nftService.createOne({ ...nftRest, collection_id: collection.id }, req.user.id)

                return createdNft
            })

            const nftsResult = await Promise.all(nfts)

            return {
                collection,
                nfts: nftsResult,
                deletedNfts: [],
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
    ): Promise<Collection> {
        return this.collectionService.updateStatus(
            id,
            updateCollectionStatusDto.status,
        );
    }

    @ApiBearerAuth('access-token')
    @UseGuards(RoleGuard([Role.FARM_ADMIN]), IsCreatorGuard)
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number): Promise<Collection> {
        return this.collectionService.deleteOne(id);
    }
}
