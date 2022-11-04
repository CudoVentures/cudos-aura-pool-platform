import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { filter } from 'rxjs';
import { Collection } from '../collection/collection.model';
import { NftOwnersPayoutHistory } from './models/nft-owners-payout-history.model';
import { NftPayoutHistory } from './models/nft-payout-history.model';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(NftPayoutHistory)
    private nftPayoutHistoryModel: typeof NftPayoutHistory,
    @InjectModel(NftOwnersPayoutHistory)
    private nftOwnersPayoutHistory: typeof NftOwnersPayoutHistory,
    @InjectModel(Collection)
    private collectionModel: typeof Collection,
  ) {}

  async getRevenue(
    collectionId: number,
    nftId: number | null,
    from: Date,
    to: Date,
  ): Promise<NftPayoutHistory[]> {
    const collection = await this.collectionModel.findByPk(collectionId);

    if (!collection) {
      throw new NotFoundException();
    }

    const query = {
      denom_id: collection.denom_id,
    };
    if (nftId) {
      query['token_id'] = nftId;
    }

    const allPayouts = await this.nftPayoutHistoryModel.findAll({
      where: query,
    });

    const fromDate = Math.floor(from.getTime() / 1000);
    const toDate = Math.floor(to.getTime() / 1000);
    const filteredPayouts = allPayouts.filter(
      (payout) =>
        payout.payout_period_start >= fromDate &&
        payout.payout_period_end <= toDate,
    );

    const result = filteredPayouts.map(async (payout) => {
      const ownersHistory = await this.nftOwnersPayoutHistory.findAll({
        where: { nft_payout_history_id: payout.id },
      });

      const owners = ownersHistory.map((payout) => payout.owner);
      return {
        ...payout,
        owners,
      };
    });

    return result as unknown as NftPayoutHistory[];
  }
}
