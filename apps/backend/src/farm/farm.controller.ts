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
import { Farm } from './models/farm.model';
import { FarmService } from './farm.service';
import { IsCreatorGuard } from './guards/is-creator.guard';
import { FarmFilters } from './utils';
import { ParseFarmQueryPipe } from './pipes/farm-query.pipe';
import { EnergySource } from './models/energy-source.model';
import { Manufacturer } from './models/manufacturer.model';
import { Miner } from './models/miner.model';
import { MinerDto } from './dto/miner.dto';
import { EnergySourceDto } from './dto/energy-source.dto';
import { ManufacturerDto } from './dto/manufacturer.dto';

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

    @Get('miners')
    async findMiners(): Promise<Miner[]> {
        return this.farmService.findMiners();
    }

    @Get('energy-sources')
    async findEnergySources(): Promise<EnergySource[]> {
        return this.farmService.findEnergySources();
    }

    @Get('manufacturers')
    async findManufacturers(): Promise<Manufacturer[]> {
        return this.farmService.findManufacturers();
    }

    @Put('miners')
    async creditMiners(minerDto: MinerDto): Promise<Miner> {
        const { id } = minerDto

        if (!id) {
            return this.farmService.createMiner(minerDto)
        }

        return this.farmService.updateMiner(minerDto)
    }

    @Put('energy-sources')
    async creditEnergySources(energySourceDto: EnergySourceDto): Promise<EnergySource> {
        const { id } = energySourceDto

        if (!id) {
            return this.farmService.createEnergySource(energySourceDto)
        }

        return this.farmService.updateEnergySource(energySourceDto)
    }

    @Put('manufacturers')
    async creditManufacturers(manufacturerDto: ManufacturerDto): Promise<Manufacturer> {
        const { id } = manufacturerDto

        if (!id) {
            return this.farmService.createManufacturer(manufacturerDto)
        }

        return this.farmService.updateManufacturer(manufacturerDto)
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
