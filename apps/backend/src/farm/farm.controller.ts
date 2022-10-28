import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
  Patch
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CollectionService } from '../collection/collection.service';
import { Collection } from '../collection/collection.model';
import RoleGuard from '../auth/guards/role.guard';
import { Role } from '../user/roles';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { UpdateFarmStatusDto } from './dto/update-status.dto';
import { Farm } from './farm.model';
import { FarmService } from './farm.service';
import { IsCreatorGuard } from './guards/is-creator.guard';

@ApiTags('Farm')
@Controller('farm')
export class FarmController {
  constructor(
    private farmService: FarmService,
    private collectionService: CollectionService,
  ) { }

  @Get()
  async findAll(): Promise<Farm[]> {
    return this.farmService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Farm> {
    return this.farmService.findOne(id);
  }

  @Get(':id/collections')
  async findCollections(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Collection[]> {
    return this.collectionService.findByFarmId(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(RoleGuard([Role.FARM_ADMIN]))
  @Post()
  async create(
    @Request() req,
    @Body() createFarmDto: CreateFarmDto,
  ): Promise<Farm> {
    return this.farmService.createOne(createFarmDto, req.user.id);
  }

  //@TODO farm update should be possible only if farm is in given status
  @ApiBearerAuth('access-token')
  @UseGuards(RoleGuard([Role.FARM_ADMIN]), IsCreatorGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFarmDto: UpdateFarmDto,
  ): Promise<Farm> {
    return this.farmService.updateOne(id, updateFarmDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(RoleGuard([Role.FARM_ADMIN]), IsCreatorGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<Farm> {
    return this.farmService.deleteOne(id);
  }


  @ApiBearerAuth('access-token')
  @UseGuards(RoleGuard([Role.SUPER_ADMIN]))
  @Patch(':id/status')
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() updateFarmStatusDto: UpdateFarmStatusDto,): Promise<Farm> {
    return this.farmService.updateStatus(id, updateFarmStatusDto.status);
  }
}
