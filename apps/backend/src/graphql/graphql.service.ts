import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { print } from 'graphql';
import { AxiosResponse } from 'axios';
import {
    MarketplaceNftsByDenomIdQuery,
    MarketplaceNftsByDenomIdDocument,
    MarketplaceNftByUidQuery,
    MarketplaceNftByUidDocument,
    MarketplaceCollectionQuery,
    MarketplaceCollectionDocument,
    GetNftByTxHashQuery,
    GetNftByTxHashDocument,
    NftTransferHistoryQuery,
    NftTransferHistoryDocument,
    MarketplaceNftTradeHistoryQuery,
    MarketplaceNftTradeHistoryDocument,
} from './types';
import { MarketplaceNftFilters } from '../nft/utils';

@Injectable()
export class GraphqlService {
    constructor(private readonly httpService: HttpService) {}

    async fetchNfts(
        filters: Partial<MarketplaceNftFilters>,
    ): Promise<MarketplaceNftsByDenomIdQuery> {
        const res = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftsByDenomIdDocument),
            variables: { ...filters },
        });

        console.log('ei ti ot hasura', res.data)

        return res.data.data.marketplace_nft;
    }

    async fetchNft(uid: string): Promise<MarketplaceNftByUidQuery> {
        const res = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftByUidDocument),
            variables: { uid },
        })

        return res.data.data.marketplace_nft
    }

    async getMintedNftUuid(tx_hash: string): Promise<{ uuid: string }> {
        const res: AxiosResponse<{ data: GetNftByTxHashQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(GetNftByTxHashDocument),
            variables: { tx_hash },
        });

        if (!res.data.data.nft_nft.length) {
            throw new NotFoundException();
        }

        const [nft] = res.data.data.nft_nft;

        const memo = JSON.parse(nft.transaction.memo);

        return { uuid: memo.uuid };
    }

    async fetchCollection(): Promise<MarketplaceCollectionQuery> {
        const res = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceCollectionDocument),
        });

        return res.data;
    }

    async fetchNftTransferHistory(tokenId: string, denomId: string): Promise<{ old_owner: string, new_owner: string, timestamp: number }[]> {
        const res: AxiosResponse<{ data: NftTransferHistoryQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(NftTransferHistoryDocument),
            variables: { tokenId, denomId },
        });

        return res.data.data.nft_transfer_history;
    }

    async fetchMarketplaceNftTradeHistory(tokenId: string, denomId: string): Promise<{ btc_price: number, price: number, usd_price: number, timestamp: number, seller: string, buyer: string }[]> {
        const res: AxiosResponse<{ data: MarketplaceNftTradeHistoryQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftTradeHistoryDocument),
            variables: { tokenId, denomId },
        });

        return res.data.data.marketplace_nft_buy_history;
    }
}
