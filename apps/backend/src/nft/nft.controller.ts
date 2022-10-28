import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  Request,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import RoleGuard from '../auth/guards/role.guard';
import { Role } from '../user/roles';
import { CreateNFTDto } from './dto/create-nft.dto';
import { UpdateNFTDto } from './dto/update-nft.dto';
import { UpdateNFTStatusDto } from './dto/update-nft-status';
import { NFT } from './nft.model';
import { NFTService } from './nft.service';
import { IsCreatorGuard } from './guards/is-creator.guard';
import { NftFilters, MarketplaceNftFilters, NftStatus } from './utils';
import { ParseNftQueryPipe } from './pipes/nft-query.pipe';
import { GraphqlService } from '../graphql/graphql.service';
import { MarketplaceNftQuery } from '../graphql/types';
import { CheckStatusDto } from './dto/check-status.dto';
import { CollectionService } from '../collection/collection.service';
import { CollectionStatus } from '../collection/utils';
import { Collection } from '../collection/collection.model';

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
    const result = await this.nftService.findAll(filters);

    return result;
  }

  @Get('minted')
  async findMinted(
    @Query() filters: Partial<MarketplaceNftFilters>,
  ): Promise<MarketplaceNftQuery> {
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

    const uuid = await this.nftService.getTokenId(tx_hash);

    return this.nftService.updateStatus(uuid, NftStatus.MINTED);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<NFT> {
    return this.nftService.findOne(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(RoleGuard([Role.FARM_ADMIN]))
  @Post()
  async create(
    @Request() req,
    @Body() createNFTDto: CreateNFTDto,
  ): Promise<NFT> {
    const collection = await this.collectionService.findOne(
      createNFTDto.collection_id,
    );

    if (!collection) {
      throw new NotFoundException('Collection does not exist');
    }

    return this.nftService.createOne(createNFTDto, req.user.id);
  }

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
