import {
    Get,
    Controller,
    Req,
    Post,
    Body,
    HttpCode,
    ValidationPipe,
    forwardRef,
    Inject,
    UseGuards,
} from '@nestjs/common';
import { GraphqlService } from '../graphql/graphql.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { NFTService } from '../nft/nft.service';
import { AppRequest } from '../common/commont.types';
import { ReqFetchNftEarningsByMiningFarmId, ReqFetchNftEarningsByNftId, ReqFetchNftEarningsBySessionAccount, ReqFetchTotalNftEarnings, ReqMegaWalletEventsByFilter, ReqNftEventsByFilter } from './dto/requests.dto';
import { ResFetchNftEarningsByMiningFarmId, ResFetchNftEarningsByNftId, ResFetchNftEarningsBySessionAccount, ResFetchTotalNftEarnings, ResMegaWalletEventsByFilter, ResNftEventsByFilter } from './dto/responses.dto';
import NftEventFilterEntity from './entities/nft-event-filter.entity';
import { AccountType } from '../account/account.types';
import RoleGuard from '../auth/guards/role.guard';
import MegaWalletEventFilterEntity from './entities/mega-wallet-event-filter.entity';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
    constructor(
        private graphqlService: GraphqlService,
        @Inject(forwardRef(() => StatisticsService))
        private statisticsService: StatisticsService,
        private nftService: NFTService,
    // eslint-disable-next-line no-empty-function
    ) {}

    @Post('events/nft')
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
    @HttpCode(200)
    async getMegaWalletEvents(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqMegaWalletEventsByFilter: ReqMegaWalletEventsByFilter,
    ): Promise<ResMegaWalletEventsByFilter> {
        const eventFilterEntity = MegaWalletEventFilterEntity.fromJson(reqMegaWalletEventsByFilter.megaWalletEventFilterEntity);

        const { megaWalletEventEntities, nftEntities, total } = await this.statisticsService.fetchMegaWalletEventsByFilter(req.sessionSuperAdminEntity, eventFilterEntity);

        return new ResMegaWalletEventsByFilter(megaWalletEventEntities, nftEntities, total);
    }

    @ApiBearerAuth('access-token')
    @Post('fetchNftEarningsBySessionAccount')
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
    @HttpCode(200)
    async fetchNftEarningsByNftId(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqFetchNftEarningsByNftId: ReqFetchNftEarningsByNftId,
    ): Promise < ResFetchNftEarningsByNftId > {
        const nftEarningsEntity = await this.statisticsService.fetchEarningsByNftId(reqFetchNftEarningsByNftId.nftId, reqFetchNftEarningsByNftId.timestampFrom, reqFetchNftEarningsByNftId.timestampTo);
        return new ResFetchNftEarningsByNftId(nftEarningsEntity);
    }

    @Post('fetchNftEarningsByMiningFarmId')
    @HttpCode(200)
    async fetchNftEarningsByMiningFarmId(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqFetchNftEarningsByNftId: ReqFetchNftEarningsByMiningFarmId,
    ): Promise < ResFetchNftEarningsByMiningFarmId > {
        const miningFarmEarningsEntity = await this.statisticsService.fetchEarningsByMiningFarmId(parseInt(reqFetchNftEarningsByNftId.miningFarmId), reqFetchNftEarningsByNftId.timestampFrom, reqFetchNftEarningsByNftId.timestampTo);
        return new ResFetchNftEarningsByMiningFarmId(miningFarmEarningsEntity);
    }

    @ApiBearerAuth('access-token')
    @Post('fetchPlatformEarnings')
    @HttpCode(200)
    @UseGuards(RoleGuard([AccountType.SUPER_ADMIN]))
    async fetchPlatformEarnings(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqFetchTotalNftEarnings: ReqFetchTotalNftEarnings,
    ): Promise <ResFetchTotalNftEarnings> {
        const totalEarningsEntity = await this.statisticsService.fetchPlatformEarnings(reqFetchTotalNftEarnings.timestampFrom, reqFetchTotalNftEarnings.timestampTo);
        return new ResFetchTotalNftEarnings(totalEarningsEntity);
    }
}
