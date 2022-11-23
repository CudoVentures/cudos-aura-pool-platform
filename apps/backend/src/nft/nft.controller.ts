import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Put,
    UseGuards,
    Delete,
    Query,
    Post,
    ValidationPipe,
    Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import RoleGuard from '../auth/guards/role.guard';
import { Role } from '../user/roles';
import { UpdateNFTDto } from './dto/update-nft.dto';
import { UpdateNFTStatusDto } from './dto/update-nft-status';
import { NFT } from './nft.model';
import { NFTService } from './nft.service';
import { IsCreatorGuard } from './guards/is-creator.guard';
import { MarketplaceNftFilters, NftStatus } from './utils';
// import { ParseNftQueryPipe } from './pipes/nft-query.pipe';
import { GraphqlService } from '../graphql/graphql.service';
import { MarketplaceNftsByDenomIdQuery } from '../graphql/types';
import { CheckStatusDto } from './dto/check-status.dto';
import { CollectionService } from '../collection/collection.service';
import { CollectionStatus, CollectionStatusWithAny } from '../collection/utils';
import { Collection } from '../collection/collection.model';
import NftFilterModel from './dto/nft-filter.model';
import CollectionFilterModel from '../collection/dto/collection-filter.model';

@ApiTags('NFT')
@Controller('nft')
export class NFTController {
    constructor(
        private nftService: NFTService,
        private graphqlService: GraphqlService,
        private collectionService: CollectionService,
    ) {}

    @Post()
    async findAll(
        @Req() req,
        @Body(new ValidationPipe({ transform: true })) nftFilterModel: NftFilterModel,
    ): Promise< { nftEntities: NFT[], total: number } > {
        const { nftEntities, total } = await this.nftService.findByFilter(req.sessionUser, nftFilterModel);

        for (let i = nftEntities.length; i-- > 0;) {
            const nftEntity = nftEntities[i];

            if (nftEntity.isApproved() === true) {
                const nftDetails = await this.graphqlService.fetchNft(nftEntity.id)
                if (nftDetails?.marketplace_nft?.length === 1) {
                    const details = nftDetails.marketplace_nft[0];
                    nftEntity.price = details.price;
                    nftEntity.creatorAddress = details.creator;
                    nftEntity.currentOwnerAddress = details.nft_nft.owner ?? '';
                }
            }
        }

        // const nftDetails = nftEntities.map(async (nftEntity) => {
        // if (nft.status !== NftStatus.MINTED || !nft.token_id) {
        //     return {
        //         ...nft.toJSON(),
        //         listed_status: NftStatus.APPROVED ? 2 : 1,
        //     }
        // }

        // const [nftDetails] = await this.graphqlService.fetchNft(nft.id)

        // return {
        //     ...nft.toJSON(),
        //     listed_status: nftDetails.price ? 2 : 1,
        //     price: nftDetails.price,
        //     creator_address: nftDetails.creator,
        //     current_owner_address: nftDetails.nft_nft.owner,
        // }
        // })

        return {
            nftEntities,
            total,
        };
    }

    @Get('minted')
    async findMinted(
        @Query() filters: Partial<MarketplaceNftFilters>,
    ): Promise < MarketplaceNftsByDenomIdQuery > {
        const collectionFilterModel = new CollectionFilterModel();
        collectionFilterModel.status = CollectionStatusWithAny.APPROVED;

        const { collectionEntities } = await this.collectionService.findByFilter(collectionFilterModel);
        const denomIds = collectionEntities.map((collection: Collection) => collection.denom_id);

        return this.graphqlService.fetchNft({
            denom_ids: denomIds,
        });
    }

  @Put('minted/check-status')
    async mint(@Body() checkStatusDto: CheckStatusDto): Promise<NFT> {
        const { tx_hash } = checkStatusDto;

        const { token_id, uuid } = await this.nftService.getNftAttributes(tx_hash);

        await this.nftService.updateStatus(uuid, NftStatus.MINTED);
        return this.nftService.updateTokenId(uuid, token_id)
    }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
      const nft = await this.nftService.findOne(id);

      // TODO uri will crash minting service until we make it a normal uri
      const response = {
          ...nft.dataValues,
          denom_id: nft.collection.denom_id,
          nft_data: 'CudosAuraMintService',
          price_coin: { amount: '123', denom: 'acudos' },
          data: {
              expiration_date: Math.floor(nft.expiration_date.getTime() / 1000),
              hash_rate_owned: nft.hashing_power,
          },
      }

      return response;
  }

  //   @ApiBearerAuth('access-token')
  //   @ApiBody({ type: [NFTDto] })
  //   @UseGuards(RoleGuard([Role.FARM_ADMIN]))
  //   @Post()
  //   async create(
  //     @Request() req,
  //     @Body() nfts: NFTDto[],
  //   ): Promise<NFT[]> {
  // const createdNfts = nfts.map(async (nft) => {
  //     const collection = await this.collectionService.findOne(
  //         nft.collection_id,
  //     );

  //     if (!collection) {
  //         throw new NotFoundException('Collection does not exist');
  //     }

  //     const createdNft = this.nftService.createOne(nft, req.user.id)
  //     return createdNft
  // })

  // const result = await Promise.all(createdNfts)

  //       return result
  //   }

    @ApiBearerAuth('access-token')
    @UseGuards(RoleGuard([Role.FARM_ADMIN]), IsCreatorGuard)
    @Put(':id')
  async update(
            @Param('id') id: string,
            @Body() updateNFTDto: UpdateNFTDto,
  ): Promise<NFT> {
      return this.nftService.updateOne(id, updateNFTDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(RoleGuard([Role.SUPER_ADMIN]))
  @Patch(':id/status')
    async updateStatus(
    @Param('id') id: string,
    @Body() updateNftStatusDto: UpdateNFTStatusDto,
    ): Promise<NFT> {
        return this.nftService.updateStatus(id, updateNftStatusDto.status);
    }

  @ApiBearerAuth('access-token')
  @UseGuards(RoleGuard([Role.FARM_ADMIN]), IsCreatorGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<NFT> {
      return this.nftService.deleteOne(id);
  }
}
