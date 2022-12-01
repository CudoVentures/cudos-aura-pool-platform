import {
    Get,
    Param,
    Controller,
    Query,
    ParseIntPipe,
    Req,
    Post,
    Body,
} from '@nestjs/common';
import { GraphqlService } from '../graphql/graphql.service';
import { TransferHistoryEntry } from './dto/transfer-history.dto';
import { ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { NFTService } from '../nft/nft.service';
import { AppRequest } from '../common/commont.types';
import { NftEventFilterDto } from './dto/event-history-filter.dto';
import { NOT_EXISTS_INT } from '../common/utils';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
    constructor(
        private graphqlService: GraphqlService,
        private statisticsService: StatisticsService,
        private nftService: NFTService,
    ) {}

    @Post('history/nft')
    async getTransferHistory(@Body() nftEventFilterDto: NftEventFilterDto): Promise<{ nftEventDtos: TransferHistoryEntry[], total: number }> {
        // const { nftEventEntities, total } = await this.statisticsService.fetchNftEventsByFilter(nftEventFilterDto);

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

        return { nftEventDtos: [], total: 0 };
    }

    @Get('earnings/nft/:id')
    async getNftEarnings(@Param('id') id: string, @Query('timestampFrom') timestampFrom: string, @Query('timestampTo') timestampTo: string): Promise<{userEarningsDto: string[]}> {
        const userEarningsDto = await this.statisticsService.fetchNftEarnings(id, { timestampFrom, timestampTo });

        return { userEarningsDto };
    }

    @Get('earnings/session-account')
    async getAddressEarnings(@Req() req: AppRequest, @Query('timestampFrom') timestampFrom: string, @Query('timestampTo') timestampTo: string): Promise <{userEarningsDto}> {
        const cudosAddress = req.sessionUserEntity.cudosWalletAddress
        const userEarningsDto = await this.statisticsService.fetchAddressEarnings(cudosAddress, { timestampFrom, timestampTo })

        return { userEarningsDto }
    }

    @Get('earnings/farm/:farmId')
    async getFarmEarnings(@Param('farmId', ParseIntPipe) farmId: number, @Query('timestampFrom') timestampFrom: string, @Query('timestampTo') timestampTo: string): Promise <any> {
        const farmEarnings = await this.statisticsService.fetchFarmEarnings(farmId, { timestampFrom, timestampTo })

        return farmEarnings
    }
}
