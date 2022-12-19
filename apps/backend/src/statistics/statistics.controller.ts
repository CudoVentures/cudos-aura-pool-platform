import {
    Get,
    Param,
    Controller,
    Query,
    ParseIntPipe,
    Req,
    Post,
    Body,
    HttpCode,
    ValidationPipe,
} from '@nestjs/common';
import { GraphqlService } from '../graphql/graphql.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { NFTService } from '../nft/nft.service';
import { AppRequest } from '../common/commont.types';
import { NftEventFilterDto } from './dto/event-history-filter.dto';
import { NOT_EXISTS_INT } from '../common/utils';
import { ReqFetchNftEarningsByMiningFarmId, ReqFetchNftEarningsByNftId, ReqFetchNftEarningsBySessionAccount, ReqTransferHistory } from './dto/requests.dto';
import { ResFetchNftEarningsByMiningFarmId, ResFetchNftEarningsByNftId, ResFetchNftEarningsBySessionAccount, ResTransferHistory } from './dto/responses.dto';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
    constructor(
        private graphqlService: GraphqlService,
        private statisticsService: StatisticsService,
        private nftService: NFTService,
    // eslint-disable-next-line no-empty-function
    ) {}

    @Post('history/nft')
    @HttpCode(200)
    async getTransferHistory(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqTransferHistory: ReqTransferHistory,
    ): Promise<ResTransferHistory> {
        // const nftEventFilterEntity = reqTransferHistory.nftEventFilterEntity;

        // const { nftEventEntities, total } = await this.statisticsService.fetchNftEventsByFilter(nftEventFilterEntity);

        // const { token_id, collection } = await this.nftService.findOne(uid)
        // const { denom_id } = collection

        // const nftTransferHistory = await this.graphqlService.fetchNftTransferHistory(token_id, denom_id);
        // const nftTradeHistory = await this.graphqlService.fetchMarketplaceNftTradeHistory(token_id, denom_id);

        // const history: TransferHistoryEntry[] = [];

        // nftTransferHistory.forEach((transfer) => {
        //     let eventType = 'transfer';
        //     if (transfer.old_owner == '0x0') {
        //         eventType = 'mint';
        //     }

        //     history.push({
        //         nftId: uid,
        //         from: transfer.old_owner,
        //         to: transfer.new_owner,
        //         timestamp: transfer.timestamp,
        //         eventType,
        //     });
        // });

        // nftTradeHistory.forEach((trade) => {
        //     let eventType = 'sale';
        //     if (trade.seller = '0x0') {
        //         eventType = 'mint';
        //     }

        //     history.push({
        //         nftId: uid,
        //         from: trade.seller,
        //         to: trade.buyer,
        //         timestamp: trade.timestamp,
        //         btcPrice: trade.btc_price,
        //         usdPrice: trade.usd_price,
        //         acudosPrice: trade.price,
        //         eventType,
        //     });
        // });

        // history.sort((a, b) => ((a.timestamp > b.timestamp) ? 1 : -1))

        // return {
        //     nftEventEntities: history,
        //     total: history.length,
        // };

        return new ResTransferHistory([], 0);
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

    @Get('earnings/platform')
    @HttpCode(200)
    async getPlatformEarnings(): Promise <ResPlatformEarnings> {
        // get filter from req
        // fetch earnings
        // return res
        const platformEarnings = await this.statisticsService.fetchPlatformEarnings();

        return farmEarnings
    }
}
