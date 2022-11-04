import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NftPayoutHistory } from './models/nft-payout-history.model';
import { ParseStatisticsQueryPipe } from './pipes/statistics-query.pipe';
import { StatisticsService } from './statistics.service';
import { NFTStatisticsFilters, CollectionStatisticsFilters } from './utils';
@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get('nft/:id')
  async getNFTRevenue(
    @Param('id', ParseIntPipe) id: number,
    @Query(ParseStatisticsQueryPipe) filters: NFTStatisticsFilters,
  ): Promise<NftPayoutHistory[]> {
    return this.statisticsService.getRevenue(
      filters.collection_id,
      id,
      filters.from,
      filters.to,
    );
  }

  @Get('collection/:id')
  async getCollectionRevenue(
    @Param('id', ParseIntPipe) id: number,
    @Query(ParseStatisticsQueryPipe) filters: CollectionStatisticsFilters,
  ): Promise<NftPayoutHistory[]> {
    return this.statisticsService.getRevenue(
      id,
      null,
      filters.from,
      filters.to,
    );
  }
}
