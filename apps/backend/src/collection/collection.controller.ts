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
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
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
import { IsApprovedGuard } from './guards/is-approved.guard';

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
    return this.collectionService.findAll(filters);
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
  @UseGuards(RoleGuard([Role.FARM_ADMIN]), IsApprovedGuard)
  @Post()
  async create(
    @Request() req,
    @Body() createCollectionDto: CreateCollectionDto,
  ): Promise<Collection> {
    return this.collectionService.createOne(createCollectionDto, req.user.id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(RoleGuard([Role.FARM_ADMIN]), IsCreatorGuard, IsApprovedGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ): Promise<Collection> {
    return this.collectionService.updateOne(id, updateCollectionDto);
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
  @UseGuards(RoleGuard([Role.FARM_ADMIN]), IsCreatorGuard, IsApprovedGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<Collection> {
    return this.collectionService.deleteOne(id);
  }
}
