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
import { ReqCreditMiningFarm } from './dto/requests.dto';
import MiningFarmEntity from './entities/mining-farm.entity';
import { ResCreditMiningFarm } from './dto/responses.dto';
import { FarmStatus } from './farm.types';

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
    ): Promise < { miningFarmEntities: MiningFarmEntity[], total: number } > {
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

    @ApiBearerAuth('access-token')
    @UseGuards(RoleGuard([AccountType.ADMIN, AccountType.SUPER_ADMIN]), IsCreatorOrSuperAdminGuard)
    @UseInterceptors(TransactionInterceptor)
    @Put()
    async creditFarm(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqCreditMiningFarm: ReqCreditMiningFarm,
    ): Promise < ResCreditMiningFarm > {
        let miningFarmEntity = MiningFarmEntity.fromJson(reqCreditMiningFarm.miningFarmEntity);
        if (req.sessionAccountEntity.isAdmin() === true) {
            miningFarmEntity.accountId = req.sessionAccountEntity.accountId;
            miningFarmEntity.status = FarmStatus.QUEUED;
        }

        miningFarmEntity = await this.farmService.creditMiningFarm(miningFarmEntity, req.sessionAccountEntity !== null, req.transaction);

        return new ResCreditMiningFarm(miningFarmEntity);
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
