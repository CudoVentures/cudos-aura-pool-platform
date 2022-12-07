import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Put,
    UseGuards,
    Patch,
    Query,
    Post,
    ValidationPipe,
    Req,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import RoleGuard from '../auth/guards/role.guard';
import { FarmDto } from './dto/farm.dto';
import { UpdateFarmStatusDto } from './dto/update-status.dto';
import { Farm } from './models/farm.model';
import { FarmService } from './farm.service';
import { IsCreatorOrSuperAdminGuard } from './guards/is-creator-or-super-admin.guard';
import { EnergySource } from './models/energy-source.model';
import { Manufacturer } from './models/manufacturer.model';
import { Miner } from './models/miner.model';
import { MinerDto } from './dto/miner.dto';
import { EnergySourceDto } from './dto/energy-source.dto';
import { ManufacturerDto } from './dto/manufacturer.dto';
import MiningFarmFilterModel from './dto/farm-filter.mdel';
import DataService from '../data/data.service';
import { AppRequest } from '../common/commont.types';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AccountType } from '../account/account.types';
import { DataServiceError, FarmCreationError } from '../common/errors/errors';

@ApiTags('Farm')
@Controller('farm')
export class FarmController {
    constructor(
        private farmService: FarmService,
        private dataService: DataService,
    ) { }

    @Post()
    async findAll(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) miningFarmFilterModel: MiningFarmFilterModel,
    ): Promise < { miningFarmEntities: Farm[], total: number } > {
        return this.farmService.findByFilter(req.sessionAccountEntity, miningFarmFilterModel);
    }

    @Get('details')
    async getDetails(@Query('ids') ids: string): Promise<any> {
        const farmIds = ids.split(',').map((id) => Number(id))

        const getFarmsDetails = farmIds.map(async (farmId) => this.farmService.getDetails(farmId))
        const farmsDetails = await Promise.all(getFarmsDetails)

        return Promise.all(farmsDetails.map(async (details) => {
            const { activeWorkersCount, averageHashRateH1 } = await this.farmService.getFoundryFarmWorkersDetails(details.subAccountName);
            return { ...details, activeWorkersCount, averageHashRateH1 };
        }));
    }

    // @Get(':id')
    // async findOne(@Param('id', ParseIntPipe) id: number): Promise<Farm> {
    //     return this.farmService.findOne(id);
    // }

    //   @Get(':id/collections')
    //     async findCollections(
    //     @Param('id', ParseIntPipe) id: number,
    //     ): Promise<Collection[]> {
    //         return this.collectionService.findByFarmId(id);
    //     }

    @ApiBearerAuth('access-token')
    @UseGuards(RoleGuard([AccountType.ADMIN, AccountType.SUPER_ADMIN]), IsCreatorOrSuperAdminGuard)
    @UseInterceptors(TransactionInterceptor)
    @Put()
    async creditFarm(
        @Req() req: AppRequest,
        @Body() farmDto: FarmDto,
    ): Promise<Farm> {
        const { id, ...farm } = farmDto

        // save images
        let farmModel;
        try {
            farm.cover_img = await this.dataService.trySaveUri(req.sessionAccountEntity.accountId, farm.cover_img);
            farm.profile_img = await this.dataService.trySaveUri(req.sessionAccountEntity.accountId, farm.profile_img);
            for (let i = farm.images.length; i-- > 0;) {
                farm.images[i] = await this.dataService.trySaveUri(req.sessionAccountEntity.accountId, farm.images[i]);
            }

        } catch (e) {
            throw new DataServiceError();
        }

        const farmModelDb = await this.farmService.findOne(id, req.transaction, req.transaction.LOCK.UPDATE);
        const oldUris = farmModelDb === null ? [] : [farmModelDb.cover_img, farmModelDb.profile_img].concat(farmModelDb.images);
        const newUris = [farm.cover_img, farm.profile_img].concat(farm.images);

        try {
            if (id > 0) {
                farmModel = await this.farmService.updateOne(id, farm, req.transaction);
            } else {
                farmModel = await this.farmService.createOne(farm, req.sessionAccountEntity.accountId, req.transaction)
            }
            this.dataService.cleanUpOldUris(oldUris, newUris);
        } catch (ex) {
            this.dataService.cleanUpNewUris(oldUris, newUris);
            const errMessage = ex.response?.message;
            switch (errMessage) {
                default:
                    throw new FarmCreationError();
            }
        }

        return farmModel
    }

    @ApiBearerAuth('access-token')
    @UseGuards(RoleGuard([AccountType.SUPER_ADMIN]))
    @UseInterceptors(TransactionInterceptor)
    @Patch(':id/status')
    async updateStatus(
        @Req() req: AppRequest,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateFarmStatusDto: UpdateFarmStatusDto,
    ): Promise<Farm> {
        console.log(updateFarmStatusDto);
        console.log(updateFarmStatusDto);
        console.log(updateFarmStatusDto);
        console.log(updateFarmStatusDto);
        console.log(updateFarmStatusDto);
        console.log(updateFarmStatusDto);
        console.log(updateFarmStatusDto);
        console.log(updateFarmStatusDto);
        console.log(updateFarmStatusDto);
        console.log(updateFarmStatusDto);

        return this.farmService.updateStatus(id, updateFarmStatusDto, req.transaction);
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

    @UseInterceptors(TransactionInterceptor)
    @Put('miners')
    async creditMiners(
        @Req() req: AppRequest,
        @Body() minerDto: MinerDto,
    ): Promise<Miner> {

        if (MinerDto.isNew(minerDto)) {
            return this.farmService.createMiner(minerDto, req.transaction)
        }

        return this.farmService.updateMiner(minerDto, req.transaction)
    }

    @UseInterceptors(TransactionInterceptor)
    @Put('energy-sources')
    async creditEnergySources(
        @Req() req: AppRequest,
        @Body() energySourceDto: EnergySourceDto,
    ): Promise<EnergySource> {

        if (EnergySourceDto.isNew(energySourceDto)) {
            return this.farmService.createEnergySource(energySourceDto, req.transaction);
        }

        return this.farmService.updateEnergySource(energySourceDto, req.transaction);
    }

    @UseInterceptors(TransactionInterceptor)
    @Put('manufacturers')
    async creditManufacturers(
        @Req() req: AppRequest,
        @Body() manufacturerDto: ManufacturerDto,
    ): Promise<Manufacturer> {

        if (ManufacturerDto.isNew(manufacturerDto)) {
            return this.farmService.createManufacturer(manufacturerDto, req.transaction)
        }

        return this.farmService.updateManufacturer(manufacturerDto, req.transaction)
    }
}
