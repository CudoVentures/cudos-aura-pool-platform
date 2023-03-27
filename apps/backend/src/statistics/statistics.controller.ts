import {
    Controller,
    Req,
    Post,
    Body,
    HttpCode,
    ValidationPipe,
    forwardRef,
    Inject,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { AppRequest } from '../common/commont.types';
import { ReqFetchEarningsPerDay, ReqFetchMiningFarmTotalBtcEarnings, ReqFetchMiningFarmMaintenanceFee, ReqFetchMiningFarmTotalEarningsCudos, ReqFetchNftEarningsByNftId, ReqFetchNftEarningsBySessionAccount, ReqMegaWalletEventsByFilter, ReqNftEventsByFilter } from './dto/requests.dto';
import { ResFetchEarningsPerDay, ResFetchFarmTotalBtcEarnings, ResFetchMiningFarmMaintenanceFee, ResFetchMiningFarmTotalEarningsCudos, ResFetchNftEarningsByNftId, ResFetchNftEarningsBySessionAccount, ResFetchPlatformMaintenanceFee, ResFetchPlatformTotalEarningsBtc, ResFetchPlatformTotalEarningsCudos, ResMegaWalletEventsByFilter, ResNftEventsByFilter } from './dto/responses.dto';
import NftEventFilterEntity from './entities/nft-event-filter.entity';
import { AccountType } from '../account/account.types';
import RoleGuard from '../auth/guards/role.guard';
import MegaWalletEventFilterEntity from './entities/mega-wallet-event-filter.entity';
import EarningsPerDayFilterEntity from './entities/earnings-per-day-filter.entity';
import MiningFarmMaintenanceFeeEntity from './entities/mining-farm-maintenance-fees.entity';
import MiningFarmTotalEarningsBtcEntity from './entities/mining-farm-btc-earnings.entity';
import PlatformTotalEarningsBtcEntity from './entities/platform-total-earnings-btc.entity';
import PlatformMaintenanceFeeEntity from './entities/platform-maintenance-fee.entity';
import MiningFarmTotalEarningsCudosEntity from './entities/mining-farm-cudos-earnings.entity';
import PlatformTotalEarningsCudosEntity from './entities/platform-total-earnings-cudos.entity';
import CollectionPaymentAllocationStatisticsFilter, { BtcEarningsType } from './entities/collection-payment-allocation-statistics-filter.entity';
import { NOT_EXISTS_INT } from '../common/utils';
import { MiningFarmAggregatedStatisticsGuard } from './guards/mining-farm-aggregated-statistics.guard';
import { EarningsPerDayGuard } from './guards/earnings-per-day.guard';
import { TransactionInterceptor } from '../common/common.interceptors';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
    constructor(
        @Inject(forwardRef(() => StatisticsService))
        private statisticsService: StatisticsService,
    // eslint-disable-next-line no-empty-function
    ) {}

    @Post('events/nft')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    async getNftEvents(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqNftEventsByFilter: ReqNftEventsByFilter,
    ): Promise<ResNftEventsByFilter> {
        const eventFilterEntity = NftEventFilterEntity.fromJson(reqNftEventsByFilter.nftEventFilterEntity);
        const { nftEventEntities, nftEntities, total } = await this.statisticsService.fetchNftEventsByFilter(req.sessionUserEntity, eventFilterEntity);
        return new ResNftEventsByFilter(nftEventEntities, nftEntities, total);
    }

    @Post('events/mega-wallet')
    @UseInterceptors(TransactionInterceptor)
    @UseGuards(RoleGuard([AccountType.SUPER_ADMIN]))
    @HttpCode(200)
    async getMegaWalletEvents(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqMegaWalletEventsByFilter: ReqMegaWalletEventsByFilter,
    ): Promise<ResMegaWalletEventsByFilter> {
        const eventFilterEntity = MegaWalletEventFilterEntity.fromJson(reqMegaWalletEventsByFilter.megaWalletEventFilterEntity);

        const { megaWalletEventEntities, nftEntities, total } = await this.statisticsService.fetchMegaWalletEventsByFilter(eventFilterEntity);

        return new ResMegaWalletEventsByFilter(megaWalletEventEntities, nftEntities, total);
    }

    @ApiBearerAuth('access-token')
    @Post('fetchNftEarningsBySessionAccount')
    @UseInterceptors(TransactionInterceptor)@UseInterceptors(TransactionInterceptor)@UseInterceptors(TransactionInterceptor)@UseInterceptors(TransactionInterceptor)@UseInterceptors(TransactionInterceptor)@UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    async fetchNftEarningsBySessionAccount(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqFetchNftEarningsBySessionAccount: ReqFetchNftEarningsBySessionAccount,
    ): Promise < ResFetchNftEarningsBySessionAccount > {
        const cudosAddress = req.sessionUserEntity.cudosWalletAddress;
        const userEarningsEntity = await this.statisticsService.fetchEarningsByCudosAddress(cudosAddress, reqFetchNftEarningsBySessionAccount.timestampFrom, reqFetchNftEarningsBySessionAccount.timestampTo);
        return new ResFetchNftEarningsBySessionAccount(userEarningsEntity);
    }

    @Post('fetchNftEarningsByNftId')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    async fetchNftEarningsByNftId(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqFetchNftEarningsByNftId: ReqFetchNftEarningsByNftId,
    ): Promise < ResFetchNftEarningsByNftId > {
        const nftEarningsEntity = await this.statisticsService.fetchEarningsByNftId(reqFetchNftEarningsByNftId.nftId, reqFetchNftEarningsByNftId.timestampFrom, reqFetchNftEarningsByNftId.timestampTo);
        return new ResFetchNftEarningsByNftId(nftEarningsEntity);
    }

    @ApiBearerAuth('access-token')
    @Post('fetchEarningsPerDay')
    @UseInterceptors(TransactionInterceptor)
    @UseGuards(RoleGuard([AccountType.SUPER_ADMIN, AccountType.ADMIN]), EarningsPerDayGuard)
    @HttpCode(200)
    async fetchEarningsPerDay(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqFetchEarningsPerDay: ReqFetchEarningsPerDay,
    ): Promise <ResFetchEarningsPerDay> {
        const earningsPerDayEntity = EarningsPerDayFilterEntity.fromJson(reqFetchEarningsPerDay.earningsPerDayFilterEntity);

        const earningsEntity = await this.statisticsService.fetchEarningsPerDay(earningsPerDayEntity);

        return new ResFetchEarningsPerDay(earningsEntity);
    }

    @ApiBearerAuth('access-token')
    @Post('fetchFarmMaintenanceFee')
    @UseInterceptors(TransactionInterceptor)
    @UseGuards(RoleGuard([AccountType.SUPER_ADMIN, AccountType.ADMIN]), MiningFarmAggregatedStatisticsGuard)
    @HttpCode(200)
    async fetchFarmMaintenanceFee(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqFetchEarningsPerDay: ReqFetchMiningFarmMaintenanceFee,
    ): Promise <ResFetchMiningFarmMaintenanceFee> {
        const farmId = parseInt(reqFetchEarningsPerDay.miningFarmId);
        const collectionId = parseInt(reqFetchEarningsPerDay.collectionId);

        const collectionPaymentAllocationStatisticsFilter = new CollectionPaymentAllocationStatisticsFilter();
        if (farmId !== NOT_EXISTS_INT) {
            collectionPaymentAllocationStatisticsFilter.farmId = farmId;
        }

        if (collectionId !== NOT_EXISTS_INT) {
            collectionPaymentAllocationStatisticsFilter.collectionId = collectionId;
        }
        collectionPaymentAllocationStatisticsFilter.type = BtcEarningsType.MAINTENANCE_FEE;
        const totalFees = await this.statisticsService.fetchTotalBtcEarned(collectionPaymentAllocationStatisticsFilter);

        const miningFarmMaintenanceFeeEntity = new MiningFarmMaintenanceFeeEntity();
        miningFarmMaintenanceFeeEntity.maintenanceFeeInBtc = totalFees;

        return new ResFetchMiningFarmMaintenanceFee(miningFarmMaintenanceFeeEntity);
    }

    @ApiBearerAuth('access-token')
    @Post('fetchFarmTotalBtcEarnings')
    @UseInterceptors(TransactionInterceptor)
    @UseGuards(RoleGuard([AccountType.SUPER_ADMIN, AccountType.ADMIN]), MiningFarmAggregatedStatisticsGuard)
    @HttpCode(200)
    async fetchFarmTotalBtcEarnings(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqFetchFarmTotalBtcEarnings: ReqFetchMiningFarmTotalBtcEarnings,
    ): Promise <ResFetchFarmTotalBtcEarnings> {
        const farmId = parseInt(reqFetchFarmTotalBtcEarnings.miningFarmId);
        const collectionId = parseInt(reqFetchFarmTotalBtcEarnings.collectionId);

        const collectionPaymentAllocationStatisticsFilter = new CollectionPaymentAllocationStatisticsFilter();
        if (farmId) {
            collectionPaymentAllocationStatisticsFilter.farmId = farmId;
        }

        if (collectionId) {
            collectionPaymentAllocationStatisticsFilter.collectionId = collectionId;
        }
        collectionPaymentAllocationStatisticsFilter.type = BtcEarningsType.EARNINGS;
        const totalFees = await this.statisticsService.fetchTotalBtcEarned(collectionPaymentAllocationStatisticsFilter);

        const miningFarmMaintenanceFeeEntity = new MiningFarmTotalEarningsBtcEntity();
        miningFarmMaintenanceFeeEntity.unsoldNftsTotalEarningsInBtc = totalFees;

        return new ResFetchFarmTotalBtcEarnings(miningFarmMaintenanceFeeEntity);
    }

    @ApiBearerAuth('access-token')
    @Post('fetchFarmTotalCudosEarnings')
    @UseInterceptors(TransactionInterceptor)
    @UseGuards(RoleGuard([AccountType.SUPER_ADMIN, AccountType.ADMIN]), MiningFarmAggregatedStatisticsGuard)
    @HttpCode(200)
    async fetchFarmTotalCudosEarnings(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqFetchMiningFarmTotalEarningsCudos: ReqFetchMiningFarmTotalEarningsCudos,
    ): Promise <ResFetchMiningFarmTotalEarningsCudos> {
        const farmid = reqFetchMiningFarmTotalEarningsCudos.miningFarmId;
        const collectionId = reqFetchMiningFarmTotalEarningsCudos.collectionId;

        const { mintRoyalties, resaleRoyalties } = await this.statisticsService.fetchTotalCudosRoyalties(farmid, collectionId);

        const miningFarmMaintenanceFeeEntity = new MiningFarmTotalEarningsCudosEntity();
        miningFarmMaintenanceFeeEntity.soldNftsTotalEarningsInAcudos = mintRoyalties;
        miningFarmMaintenanceFeeEntity.resaleRoyaltiesTotalEarningsInAcudos = resaleRoyalties;

        return new ResFetchMiningFarmTotalEarningsCudos(miningFarmMaintenanceFeeEntity);
    }

    @ApiBearerAuth('access-token')
    @Post('fetchPlatformTotalBtcEarnings')
    @UseInterceptors(TransactionInterceptor)
    @UseGuards(RoleGuard([AccountType.SUPER_ADMIN]))
    @HttpCode(200)
    async fetchPlatformTotalBtcEarnings(
        @Req() req: AppRequest,
    ): Promise <ResFetchPlatformTotalEarningsBtc> {
        const collectionPaymentAllocationStatisticsFilter = new CollectionPaymentAllocationStatisticsFilter();

        collectionPaymentAllocationStatisticsFilter.type = BtcEarningsType.EARNINGS;
        const totalFees = await this.statisticsService.fetchTotalBtcEarned(collectionPaymentAllocationStatisticsFilter);

        const platformEarningsBtcEntity = new PlatformTotalEarningsBtcEntity();
        platformEarningsBtcEntity.nftFeesTotalEarningsInBtc = totalFees;

        return new ResFetchPlatformTotalEarningsBtc(platformEarningsBtcEntity);
    }

    @ApiBearerAuth('access-token')
    @Post('fetchPlatformMaintenanceFees')
    @UseInterceptors(TransactionInterceptor)
    @UseGuards(RoleGuard([AccountType.SUPER_ADMIN]))
    @HttpCode(200)
    async fetchPlatformMaintenanceFees(
        @Req() req: AppRequest,
    ): Promise <ResFetchPlatformMaintenanceFee> {
        const collectionPaymentAllocationStatisticsFilter = new CollectionPaymentAllocationStatisticsFilter();

        collectionPaymentAllocationStatisticsFilter.type = BtcEarningsType.MAINTENANCE_FEE;
        const totalFees = await this.statisticsService.fetchTotalBtcEarned(collectionPaymentAllocationStatisticsFilter);

        const platformMaintenanceFees = new PlatformMaintenanceFeeEntity();
        platformMaintenanceFees.maintenanceFeeInBtc = totalFees;

        return new ResFetchPlatformMaintenanceFee(platformMaintenanceFees);
    }

    @ApiBearerAuth('access-token')
    @Post('fetchPlatformTotalCudosEarnings')
    @UseInterceptors(TransactionInterceptor)
    @UseGuards(RoleGuard([AccountType.SUPER_ADMIN]))
    @HttpCode(200)
    async fetchPlatformTotalCudosEarnings(
        @Req() req: AppRequest,
    ): Promise <ResFetchPlatformTotalEarningsCudos> {
        const { mintRoyalties, resaleRoyalties } = await this.statisticsService.fetchTotalCudosRoyalties(null, null);

        const platformTotalEarningsCudosEntity = new PlatformTotalEarningsCudosEntity();
        platformTotalEarningsCudosEntity.soldNftsTotalEarningsInAcudos = mintRoyalties;
        platformTotalEarningsCudosEntity.resaleRoyaltiesTotalEarningsInAcudos = resaleRoyalties;

        return new ResFetchPlatformTotalEarningsCudos(platformTotalEarningsCudosEntity);
    }
}
