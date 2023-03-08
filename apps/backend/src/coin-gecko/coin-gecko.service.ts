import { Injectable } from '@nestjs/common';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { CURRENCY_DECIMALS } from 'cudosjs';
import { BIG_NUMBER_0, FIFTEEN_MINUTES_IN_MILIS, NOT_EXISTS_INT } from '../common/utils';
import NftEntity from '../nft/entities/nft.entity';
import CoingeckoEntity from './entities/coingecko.entity';

@Injectable()
export default class CoinGeckoService {

    static coinGeckoCudosApiUrl = 'https://api.coingecko.com/api/v3/coins/cudos?tickers=false&community_data=false&developer_data=false&sparkline=false'

    cachedCoingeckoEntity: CoingeckoEntity = null;
    fetchedCachedCoingeckoEntityTimestamp = NOT_EXISTS_INT;

    async fetchCudosPrice(): Promise < CoingeckoEntity > {
        const resultJson = await axios.get(CoinGeckoService.coinGeckoCudosApiUrl);

        return new CoingeckoEntity(resultJson.data.market_data.current_price.usd, resultJson.data.market_data.current_price.eth);
    }

    async getCachedCudosPrice(): Promise < CoingeckoEntity > {
        if (this.fetchedCachedCoingeckoEntityTimestamp + FIFTEEN_MINUTES_IN_MILIS < Date.now() || this.cachedCoingeckoEntity === null) {
            this.cachedCoingeckoEntity = await this.fetchCudosPrice();
            this.fetchedCachedCoingeckoEntityTimestamp = Date.now();
        }

        return this.cachedCoingeckoEntity;
    }

    async getNftPriceInAcudos(nftEntity: NftEntity): Promise < BigNumber > {
        if (nftEntity.isMinted() === true && nftEntity.hasPrice() === true) {
            return nftEntity.acudosPrice;
        }

        if (nftEntity.isMinted() === false && nftEntity.priceUsd !== NOT_EXISTS_INT) {
            const coingeckoEntity = await this.getCachedCudosPrice();
            return new BigNumber(nftEntity.priceUsd).dividedBy(coingeckoEntity.cudosUsdPrice).shiftedBy(CURRENCY_DECIMALS);
        }

        return BIG_NUMBER_0;
    }

    async getFloorPriceOfNftEntities(nftEntities: NftEntity[]): Promise < BigNumber > {
        let floorPriceInAcudos = null;
        for (let i = nftEntities.length; i-- > 0;) {
            const priceInAcudos = await this.getNftPriceInAcudos(nftEntities[i]);
            if (priceInAcudos.lte(BIG_NUMBER_0)) {
                continue;
            }

            if (floorPriceInAcudos === null || priceInAcudos.lt(floorPriceInAcudos)) {
                floorPriceInAcudos = priceInAcudos;
            }
        }

        return floorPriceInAcudos ?? BIG_NUMBER_0;
    }
}
