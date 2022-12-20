import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { print } from 'graphql';
import { AxiosResponse } from 'axios';
import {
    MarketplaceNftsByDenomIdQuery,
    MarketplaceNftsByDenomIdDocument,
    MarketplaceCollectionQuery,
    MarketplaceCollectionDocument,
    GetNftByTxHashQuery,
    GetNftByTxHashDocument,
    MarketplaceNftTradeHistoryByUniqueIdsQuery,
    MarketplaceNftTradeHistoryByUniqueIdsDocument,
    MarketplaceNftPriceSumByDenomIdQuery,
    MarketplaceNftPriceSumByDenomIdDocument,
    MarketplaceNftCountByOwnerQuery,
    MarketplaceNftCountByOwnerDocument,
    MarketplaceCollectionsByDenomIdsDocument,
    MarketplaceCollectionsByDenomIdsQuery,
    NftCollectionsByDenomIdsQuery,
    NftCollectionsByDenomIdsDocument,
    MarketplaceNftsByTokenIdsQuery,
    MarketplaceNftsByTokenIdsDocument,
    NftNftsByTokenIdsQuery,
    NftNftsByTokenIdsDocument,
    MarketplaceNftPriceSumTotalQuery,
    MarketplaceNftPriceSumTotalDocument,
    LastParsedHeightDocument,
    LastParsedHeightQuery,
    NftPlatformTransferHistoryQuery,
    NftPlatformTransferHistoryDocument,
    NftTransferHistoryByUniqueIdsQuery,
    NftTransferHistoryByUniqueIdsDocument,
    MarketplaceNftPlatformTradeHistoryQuery,
    MarketplaceNftPlatformTradeHistoryDocument,
} from './types';
import { MarketplaceNftFilters } from '../nft/nft.types';
import NftModuleNftTransferHistoryEntity from './entities/nft-module-nft-transfer-history';
import NftMarketplaceTradeHistoryEntity from './entities/nft-marketplace-trade-history.entity';

@Injectable()
export class GraphqlService {
    constructor(private readonly httpService: HttpService) {}

    async fetchLastParsedHeight(): Promise<LastParsedHeightQuery> {
        const res = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(LastParsedHeightDocument),
        });

        return res.data.data;
    }

    async fetchNftsByDenomId(
        filters: Partial<MarketplaceNftFilters>,
    ): Promise<MarketplaceNftsByDenomIdQuery> {
        const res = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftsByDenomIdDocument),
            variables: { ...filters },
        });

        return res.data.data;
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

    async fetchMarketplaceNftsByTokenIds(tokenIds: string[], denomId: string): Promise< MarketplaceNftsByTokenIdsQuery > {
        const res = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftsByTokenIdsDocument),
            variables: { tokenIds, denomId },
        });

        return res.data.data;
    }

    async fetchNftNftsByTokenIds(tokenIds: string[], denomId: string): Promise< NftNftsByTokenIdsQuery > {
        const res = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(NftNftsByTokenIdsDocument),
            variables: { tokenIds, denomId },
        });

        return res.data.data;
    }

    async fetchNftTransferHistoryByUniqueIds(uniqIds: string[]): Promise<NftModuleNftTransferHistoryEntity[]> {
        const res: AxiosResponse<{ data: NftTransferHistoryByUniqueIdsQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(NftTransferHistoryByUniqueIdsDocument),
            variables: { uniqIds },
        });

        const nftTransferHistoryEntities = res.data.data?.nft_transfer_history?.map((json) => NftModuleNftTransferHistoryEntity.fromGraphQl(json));

        return nftTransferHistoryEntities || [];
    }

    async fetchMarketplaceNftTradeHistoryByUniqueIds(uniqIds: string[]): Promise<NftMarketplaceTradeHistoryEntity[]> {
        const res: AxiosResponse<{ data: MarketplaceNftTradeHistoryByUniqueIdsQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftTradeHistoryByUniqueIdsDocument),
            variables: { uniqIds },
        });

        const nftMarketplaceTradeHistoryEntity = res.data.data?.marketplace_nft_buy_history?.map((json) => NftMarketplaceTradeHistoryEntity.fromGraphQl(json));

        return nftMarketplaceTradeHistoryEntity || [];
    }

    async fetchNftPlatformTransferHistory(): Promise<NftModuleNftTransferHistoryEntity[]> {
        const res: AxiosResponse<{ data: NftPlatformTransferHistoryQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(NftPlatformTransferHistoryDocument),
        });

        const nftTransferHistoryEntities = res.data.data?.nft_transfer_history?.map((json) => NftModuleNftTransferHistoryEntity.fromGraphQl(json));

        return nftTransferHistoryEntities || [];
    }

    async fetchMarketplacePlatformNftTradeHistory(): Promise<NftMarketplaceTradeHistoryEntity[]> {
        const res: AxiosResponse<{ data: MarketplaceNftPlatformTradeHistoryQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftPlatformTradeHistoryDocument),
        });

        const nftMarketplaceTradeHistoryEntity = res.data.data?.marketplace_nft_buy_history?.map((json) => NftMarketplaceTradeHistoryEntity.fromGraphQl(json));

        return nftMarketplaceTradeHistoryEntity || [];
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

    async fetchTotalPlatformSales(): Promise<MarketplaceNftPriceSumTotalQuery> {
        const res: AxiosResponse<{ data: MarketplaceNftPriceSumTotalQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftPriceSumTotalDocument),
        });

        return res.data.data;
    }

    async fetchTotalNftsByAddress(address: string): Promise<number> {
        const res: AxiosResponse<{ data: MarketplaceNftCountByOwnerQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftCountByOwnerDocument),
            variables: { ownerAddress: address },
        });

        return res.data.data.marketplace_nft_aggregate.aggregate.count;
    }
}
