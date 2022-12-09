import {
    Body,
    Controller,
    Get,
    Put,
    UseGuards,
    Query,
    Post,
    ValidationPipe,
    Req,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import RoleGuard from '../auth/guards/role.guard';
import { FarmService } from './farm.service';
import { IsCreatorOrSuperAdminGuard } from './guards/is-creator-or-super-admin.guard';
import MiningFarmFilterModel from './dto/farm-filter.mdel';
import DataService from '../data/data.service';
import { AppRequest } from '../common/commont.types';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AccountType } from '../account/account.types';
import { ReqCreditEnergySource, ReqCreditManufacturer, ReqCreditMiner, ReqCreditMiningFarm } from './dto/requests.dto';
import MiningFarmEntity from './entities/mining-farm.entity';
import { ResCreditEnergySource, ResCreditManufacturer, ResCreditMiner, ResCreditMiningFarm, ResFetchEnergySources, ResFetchManufacturers, ResFetchMiners } from './dto/responses.dto';
import { FarmStatus } from './farm.types';
import EnergySourceEntity from './entities/energy-source.entity';
import MinerEntity from './entities/miner.entity';
import ManufacturerEntity from './entities/manufacturer.entity';

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
    async findMiners(): Promise < ResFetchMiners > {
        const minerEntities = await this.farmService.findMiners();
        return new ResFetchMiners(minerEntities);
    }

    @Get('energy-sources')
    async findEnergySources(): Promise < ResFetchEnergySources > {
        const energySourceEntities = await this.farmService.findEnergySources();
        return new ResFetchEnergySources(energySourceEntities);
    }

    @Get('manufacturers')
    async findManufacturers(): Promise < ResFetchManufacturers > {
        const manufacturerEntities = await this.farmService.findManufacturers();
        return new ResFetchManufacturers(manufacturerEntities);
    }

    @UseInterceptors(TransactionInterceptor)
    @Put('miners')
    async creditMiners(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqCreditMiner: ReqCreditMiner,
    ): Promise < ResCreditMiner > {
        let minerEntity = MinerEntity.fromJson(reqCreditMiner.minerEntity);
        minerEntity = await this.farmService.creditMiner(minerEntity, req.transaction);
        return new ResCreditMiner(minerEntity);
    }

    @UseInterceptors(TransactionInterceptor)
    @Put('energy-sources')
    async creditEnergySources(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqCreditEnergySource: ReqCreditEnergySource,
    ): Promise < ResCreditEnergySource > {
        let energySourceEntity = EnergySourceEntity.fromJson(reqCreditEnergySource.energySourceEntity);
        energySourceEntity = await this.farmService.creditEnergySource(energySourceEntity, req.transaction);
        return new ResCreditEnergySource(energySourceEntity);
    }

    @UseInterceptors(TransactionInterceptor)
    @Put('manufacturers')
    async creditManufacturers(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqCreditManufacturer: ReqCreditManufacturer,
    ): Promise < ResCreditManufacturer > {
        let manufacturerEntity = ManufacturerEntity.fromJson(reqCreditManufacturer.manufacturerEntity);
        manufacturerEntity = await this.farmService.creditManufacturer(manufacturerEntity, req.transaction);
        return new ResCreditManufacturer(manufacturerEntity);
    }
}
