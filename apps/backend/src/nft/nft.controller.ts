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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import RoleGuard from '../auth/guards/role.guard';
import { Role } from '../user/roles';
import { UpdateNFTDto } from './dto/update-nft.dto';
import { UpdateNFTStatusDto } from './dto/update-nft-status';
import { NFT } from './nft.model';
import { NFTService } from './nft.service';
import { IsCreatorGuard } from './guards/is-creator.guard';
import { NftFilters, MarketplaceNftFilters, NftStatus } from './utils';
import { ParseNftQueryPipe } from './pipes/nft-query.pipe';
import { GraphqlService } from '../graphql/graphql.service';
import { MarketplaceNftsByDenomIdQuery } from '../graphql/types';
import { CheckStatusDto } from './dto/check-status.dto';
import { CollectionService } from '../collection/collection.service';
import { CollectionStatus } from '../collection/utils';
import { Collection } from '../collection/collection.model';
import { NFTResponseDto } from './dto/nft-response.dto';

@ApiTags('NFT')
@Controller('nft')
export class NFTController {
    constructor(
    private nftService: NFTService,
    private graphqlService: GraphqlService,
    private collectionService: CollectionService,
    ) {}

  @Get()
    async findAll(@Query(ParseNftQueryPipe) filters: NftFilters): Promise<NFT[]> {
        const nfts = await this.nftService.findAll(filters);

        const nftDetails = nfts.map(async (nft) => {
            if (nft.status !== NftStatus.MINTED || !nft.token_id) {
                return {
                    ...nft.toJSON(),
                    listed_status: NftStatus.APPROVED ? 2 : 1,
                }
            }

            const [nftDetails] = await this.graphqlService.fetchNft(nft.id)

            return {
                ...nft.toJSON(),
                listed_status: nftDetails.price ? 2 : 1,
                price: nftDetails.price,
                creator_address: nftDetails.creator,
                current_owner_address: nftDetails.nft_nft.owner,
            }
        })

        const result = await Promise.all(nftDetails)
        return result;
    }

  @Get('minted')
  async findMinted(
    @Query() filters: Partial<MarketplaceNftFilters>,
  ): Promise<MarketplaceNftsByDenomIdQuery> {
      const collections = await this.collectionService.findAll({
          status: CollectionStatus.APPROVED,
      });
      const denom_ids = collections.map(
          (collection: Collection) => collection.denom_id,
      );

      return this.graphqlService.fetchNft({ denom_ids });
  }

  @Put('minted/check-status')
  async mint(@Body() checkStatusDto: CheckStatusDto): Promise<NFT> {
      const { tx_hash } = checkStatusDto;

      const { token_id, uuid } = await this.nftService.getNftAttributes(tx_hash);

      await this.nftService.updateStatus(uuid, NftStatus.MINTED);
      return this.nftService.updateTokenId(uuid, token_id)
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<NFTResponseDto> {
      const nft = await this.nftService.findOne(id);

      const response: NFTResponseDto = {
          ...nft,
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
