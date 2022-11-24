import {
    Get,
    Param,
    Controller,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { GraphqlService } from '../graphql/graphql.service';
import { TransferHistoryEntry } from './dto/transfer-history.dto';
import { ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { NFTService } from '../nft/nft.service';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
    constructor(
        private graphqlService: GraphqlService,
        private statisticsService: StatisticsService,
        private nftService: NFTService,
    ) {}

    @Get('history/nft/:uid')
    async getTransferHistory(@Param('uid') uid: string): Promise<TransferHistoryEntry[]> {
        const { token_id, collection } = await this.nftService.findOne(uid)
        const { denom_id } = collection

        const nftTransferHistory = await this.graphqlService.fetchNftTransferHistory(token_id, denom_id);
        const nftTradeHistory = await this.graphqlService.fetchMarketplaceNftTradeHistory(token_id, denom_id);

        const history: TransferHistoryEntry[] = [];

        nftTransferHistory.forEach((transfer) => {
            let eventType = 'transfer';
            if (transfer.old_owner == '0x0') {
                eventType = 'mint';
            }

            history.push({
                from: transfer.old_owner,
                to: transfer.new_owner,
                timestamp: transfer.timestamp,
                eventType,
            });
        });

        nftTradeHistory.forEach((trade) => {
            let eventType = 'sale';
            if (trade.seller = '0x0') {
                eventType = 'mint';
            }

            history.push({
                from: trade.seller,
                to: trade.buyer,
                timestamp: trade.timestamp,
                btcPrice: trade.btc_price,
                usdPrice: trade.usd_price,
                eventType,
            });
        });

        history.sort((a, b) => ((a.timestamp > b.timestamp) ? 1 : -1))

        return history;
    }

    @Get('earnings/nft/:id')
    async getNftEarnings(@Param('id') id: string, @Query('timestampFrom') timestampFrom: string, @Query('timestampTo') timestampTo: string): Promise<any> {
        const nftEarnings = await this.statisticsService.fetchNftEarnings(id, { timestampFrom, timestampTo });

        return { earningsPerDayInBtc: nftEarnings };
    }

    @Get('earnings/address/:cudosAddress')
    async getAddressEarnings(@Param('cudosAddress') cudosAddress: string, @Query('timestampFrom') timestampFrom: string, @Query('timestampTo') timestampTo: string): Promise <any> {
        const addressEarnings = await this.statisticsService.fetchAddressEarnings(cudosAddress, { timestampFrom, timestampTo })

        return addressEarnings
    }

    @Get('earnings/farm/:farmId')
    async getFarmEarnings(@Param('farmId', ParseIntPipe) farmId: number, @Query('timestampFrom') timestampFrom: string, @Query('timestampTo') timestampTo: string): Promise <any> {
        const farmEarnings = await this.statisticsService.fetchFarmEarnings(farmId, { timestampFrom, timestampTo })

        return farmEarnings
    }
}
