import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Put,
    Request,
    UseGuards,
    Patch,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CollectionService } from '../collection/collection.service';
import { Collection } from '../collection/collection.model';
import RoleGuard from '../auth/guards/role.guard';
import { Role } from '../user/roles';
import { FarmDto } from './dto/farm.dto';
import { UpdateFarmStatusDto } from './dto/update-status.dto';
import { Farm } from './farm.model';
import { FarmService } from './farm.service';
import { IsCreatorGuard } from './guards/is-creator.guard';
import { FarmFilters } from './utils';
import { ParseFarmQueryPipe } from './pipes/farm-query.pipe';

@ApiTags('Farm')
@Controller('farm')
export class FarmController {
    constructor(
    private farmService: FarmService,
    private collectionService: CollectionService,
    ) { }

  @Get()
    async findAll(@Query(ParseFarmQueryPipe) filters: FarmFilters): Promise<Farm[]> {
        console.log(filters)
        return this.farmService.findAll({ ...filters });
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
  @UseGuards(RoleGuard([Role.FARM_ADMIN]), IsCreatorGuard)
  @Put()
  async creditFarm(
    @Request() req,
    @Body() farmDto: FarmDto,
  ): Promise<Farm> {
      const { id, ...farm } = farmDto

      if (id > 0) {
          return this.farmService.updateOne(id, farm);
      }

      return this.farmService.createOne(farm, req.user.id)

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
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() updateFarmStatusDto: UpdateFarmStatusDto): Promise<Farm> {
      return this.farmService.updateStatus(id, updateFarmStatusDto.status);
  }
}
