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
    MarketplaceNftPriceSumByDenomIdQuery,
    MarketplaceNftPriceSumByDenomIdDocument,
    MarketplaceNftCountByOwnerQuery,
    MarketplaceNftCountByOwnerDocument,
    MarketplaceCollectionsByDenomIdsDocument,
    MarketplaceCollectionsByDenomIdsQuery,
    NftCollectionsByDenomIdsQuery,
    NftCollectionsByDenomIdsDocument,
    MarketplaceNftsByTokenIdQuery,
    MarketplaceNftsByTokenIdDocument,
    NftNftsByTokenIdsQuery,
    NftNftsByTokenIdsDocument,
} from './types';
import { MarketplaceNftFilters } from '../nft/nft.types';

@Injectable()
export class GraphqlService {
    constructor(private readonly httpService: HttpService) {}

    async fetchNftsByDenomId(
        filters: Partial<MarketplaceNftFilters>,
    ): Promise<MarketplaceNftsByDenomIdQuery> {
        const res = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftsByDenomIdDocument),
            variables: { ...filters },
        });

        return res.data.data;
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

        return res.data.data;
    }

    async fetchMarketplaceCollectionsByDenomIds(denomIds: string[]): Promise< MarketplaceCollectionsByDenomIdsQuery > {
        const res = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceCollectionsByDenomIdsDocument),
            variables: { denomIds },
        });

        return res.data.data;
    }

    async fetchNftCollectionsByDenomIds(denomIds: string[]): Promise< NftCollectionsByDenomIdsQuery > {
        const res = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(NftCollectionsByDenomIdsDocument),
            variables: { denomIds },
        });

        return res.data.data;
    }

    async fetchMarketplaceNftsByTokenIds(tokenIds: string[]): Promise< MarketplaceNftsByTokenIdQuery > {
        const res = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftsByTokenIdDocument),
            variables: { tokenIds },
        });

        return res.data.data;
    }

    async fetchNftNftsByTokenIds(tokenIds: string[]): Promise< NftNftsByTokenIdsQuery > {
        const res = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(NftNftsByTokenIdsDocument),
            variables: { tokenIds },
        });

        return res.data.data;
    }

    async fetchNftTransferHistory(tokenId: string, denomId: string): Promise<{ old_owner: string, new_owner: string, timestamp: number }[]> {
        const res: AxiosResponse<{ data: NftTransferHistoryQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(NftTransferHistoryDocument),
            variables: { tokenId, denomId },
        });

        return res.data.data?.nft_transfer_history || [];
    }

    async fetchMarketplaceNftTradeHistory(tokenId: string, denomId: string): Promise<{ btc_price: number, price: number, usd_price: number, timestamp: number, seller: string, buyer: string }[]> {
        const res: AxiosResponse<{ data: MarketplaceNftTradeHistoryQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftTradeHistoryDocument),
            variables: { tokenId, denomId },
        });

        return res.data.data?.marketplace_nft_buy_history || [];
    }

    async fetchCollectionTotalSales(denomIds: string[]): Promise<{ salesInAcudos: number, salesInBtc: number, salesInUsd: number }> {
        const res: AxiosResponse<{ data: MarketplaceNftPriceSumByDenomIdQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftPriceSumByDenomIdDocument),
            variables: { denomIds },
        });

        return {
            salesInAcudos: res.data.data.marketplace_nft_buy_history_aggregate.aggregate.sum.price,
            salesInBtc: res.data.data.marketplace_nft_buy_history_aggregate.aggregate.sum.btc_price,
            salesInUsd: res.data.data.marketplace_nft_buy_history_aggregate.aggregate.sum.usd_price,
        };
    }

    async fetchTotalNftsByAddress(address: string): Promise<number> {
        const res: AxiosResponse<{ data: MarketplaceNftCountByOwnerQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftCountByOwnerDocument),
            variables: { ownerAddress: address },
        });

        return res.data.data.marketplace_nft_aggregate.aggregate.count;
    }
}
