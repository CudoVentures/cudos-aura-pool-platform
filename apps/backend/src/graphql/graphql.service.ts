import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { print } from 'graphql';
import { AxiosResponse } from 'axios';
import {
    MarketplaceNftsByDenomIdQuery,
    MarketplaceNftsByDenomIdDocument,
    MarketplaceNftTradeHistoryByUniqueIdsQuery,
    MarketplaceNftTradeHistoryByUniqueIdsDocument,
    MarketplaceNftPriceSumByDenomIdQuery,
    MarketplaceNftPriceSumByDenomIdDocument,
    MarketplaceNftCountByOwnerQuery,
    MarketplaceNftCountByOwnerDocument,
    MarketplaceCollectionsByDenomIdsDocument,
    NftCollectionsByDenomIdsQuery,
    NftCollectionsByDenomIdsDocument,
    MarketplaceNftsByTokenIdsQuery,
    MarketplaceNftsByTokenIdsDocument,
    MarketplaceNftPriceSumTotalQuery,
    MarketplaceNftPriceSumTotalDocument,
    LastParsedHeightDocument,
    NftTransferHistoryByUniqueIdsQuery,
    NftTransferHistoryByUniqueIdsDocument,
    MarketplaceCollectionsByDenomIdsQuery,
    MarketplaceNftTradeHistoryByDenomIdsQuery,
    MarketplaceNftTradeHistoryByDenomIdsDocument,
    MarketplaceCollectionsByIdsQuery,
    MarketplaceCollectionsByIdsDocument,
    NftTransferHistoryByNewOwnerAddressAndTimestampQuery,
    NftTransferHistoryByOldOwnerAddressAndTimestampDocument,
    NftTransferHistoryByNewOwnerAddressAndTimestampDocument,
    NftTransferHistoryByOldOwnerAddressAndTimestampQuery,
    MarketplaceNftTradeHistoryByBuyerAddressAndTimestampQuery,
    MarketplaceNftTradeHistoryByBuyerAddressAndTimestampDocument,
    MarketplaceNftTradeHistoryBySellerAddressAndTimestampQuery,
    MarketplaceNftTradeHistoryBySellerAddressAndTimestampDocument,
    MarketplaceNftTradeHistoryByUniqueIdsAndTimestampQuery,
    MarketplaceNftTradeHistoryByUniqueIdsAndTimestampDocument,
    NftTransferHistoryByUniqueIdsAndTimestampQuery,
    NftTransferHistoryByUniqueIdsAndTimestampDocument,
    NftTransferHistoryByDenomIdsQuery,
    NftTransferHistoryByDenomIdsDocument,
} from './types';
import NftModuleNftTransferHistoryEntity from './entities/nft-module-nft-transfer-history';
import NftMarketplaceTradeHistoryEntity from './entities/nft-marketplace-trade-history.entity';
import BigNumber from 'bignumber.js';
import ChainMarketplaceCollectionEntity from '../collection/entities/chain-marketplace-collection.entity';
import { NOT_EXISTS_INT } from '../common/utils';
import { ChainMarketplaceNftEntity } from './entities/nft-marketplace.entity';
import { DataServiceError } from '../common/errors/errors';
import ChainNftCollectionEntity from '../collection/entities/chain-nft-collection.entity';

@Injectable()
export class GraphqlService {
    constructor(private readonly httpService: HttpService) {}

    async fetchLastParsedHeight(): Promise<number> {
        const res = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(LastParsedHeightDocument),
        });

        if (!res.data?.data?.block_aggregate) {
            throw new DataServiceError();
        }

        return parseInt(res.data.data.block_aggregate?.aggregate?.max?.height || NOT_EXISTS_INT);
    }

    async fetchNftsByDenomId(
        denomIds: string[],
    ): Promise<ChainMarketplaceNftEntity[]> {
        const res: AxiosResponse<{ data: MarketplaceNftsByDenomIdQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftsByDenomIdDocument),
            variables: { denomIds },
        });

        if (!res.data?.data?.marketplace_nft) {
            throw new DataServiceError();
        }

        return res.data.data.marketplace_nft.map((json) => ChainMarketplaceNftEntity.fromGraphQl(json)) || [];
    }

    async fetchMarketplaceCollectionsByDenomIds(denomIds: string[]): Promise< ChainMarketplaceCollectionEntity[] > {
        const res: AxiosResponse<{ data: MarketplaceCollectionsByDenomIdsQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceCollectionsByDenomIdsDocument),
            variables: { denomIds },
        });

        if (!res.data?.data?.marketplace_collection) {
            throw new DataServiceError();
        }

        const chainMarketplaceCollectionEntitiess = res.data.data.marketplace_collection.map((queryCollection) => ChainMarketplaceCollectionEntity.fromGraphQl(queryCollection));

        return chainMarketplaceCollectionEntitiess;
    }

    async fetchMarketplaceCollectionsByIds(ids: number[]): Promise< ChainMarketplaceCollectionEntity[] > {
        const res: AxiosResponse<{ data: MarketplaceCollectionsByIdsQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceCollectionsByIdsDocument),
            variables: { ids },
        });

        if (!res.data?.data?.marketplace_collection) {
            throw new DataServiceError();
        }

        const chainMarketplaceCollectionEntitiess = res.data.data.marketplace_collection.map((queryCollection) => ChainMarketplaceCollectionEntity.fromGraphQl(queryCollection));

        return chainMarketplaceCollectionEntitiess;
    }

    async fetchNftCollectionsByDenomIds(denomIds: string[]): Promise< ChainNftCollectionEntity[] > {
        const res: AxiosResponse<{ data: NftCollectionsByDenomIdsQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(NftCollectionsByDenomIdsDocument),
            variables: { denomIds },
        });

        if (!res.data?.data?.nft_denom) {
            throw new DataServiceError();
        }

        const chainNftModuleCollectionEntitiess = res.data.data.nft_denom.map((queryCollection) => ChainNftCollectionEntity.fromGraphQl(queryCollection));

        return chainNftModuleCollectionEntitiess;
    }

    async fetchMarketplaceNftsByTokenIds(tokenIds: string[], denomId: string): Promise< ChainMarketplaceNftEntity[] > {
        const res: AxiosResponse<{ data: MarketplaceNftsByTokenIdsQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftsByTokenIdsDocument),
            variables: { tokenIds, denomId },
        });

        if (!res.data?.data?.marketplace_nft) {
            throw new DataServiceError();
        }

        return res.data.data.marketplace_nft.map((json) => ChainMarketplaceNftEntity.fromGraphQl(json)) || [];
    }

    async fetchNftTransferHistoryByUniqueIds(uniqIds: string[]): Promise<NftModuleNftTransferHistoryEntity[]> {
        const res: AxiosResponse<{ data: NftTransferHistoryByUniqueIdsQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(NftTransferHistoryByUniqueIdsDocument),
            variables: { uniqIds },
        });

        if (!res.data?.data?.nft_transfer_history) {
            throw new DataServiceError();
        }

        const nftTransferHistoryEntities = res.data.data?.nft_transfer_history?.map((json) => NftModuleNftTransferHistoryEntity.fromGraphQl(json));

        return nftTransferHistoryEntities || [];
    }

    async fetchNftTransferHistoryByUniqueIdsAndTimestamp(timestampFrom: number, timestampTo: number, uniqIds: string[]): Promise<NftModuleNftTransferHistoryEntity[]> {
        const res: AxiosResponse<{ data: NftTransferHistoryByUniqueIdsAndTimestampQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(NftTransferHistoryByUniqueIdsAndTimestampDocument),
            variables: { uniqIds, timestampFrom, timestampTo },
        });

        if (!res.data?.data?.nft_transfer_history) {
            throw new DataServiceError();
        }

        const nftTransferHistoryEntities = res.data.data?.nft_transfer_history?.map((json) => NftModuleNftTransferHistoryEntity.fromGraphQl(json));

        return nftTransferHistoryEntities || [];
    }

    async fetchNftTransferHistoryByAddressAndTimestamp(timestampFrom: number, timestampTo: number, address: string): Promise<NftModuleNftTransferHistoryEntity[]> {
        const res: AxiosResponse<{ data: NftTransferHistoryByNewOwnerAddressAndTimestampQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(NftTransferHistoryByNewOwnerAddressAndTimestampDocument),
            variables: { timestampFrom, timestampTo, address },
        });

        const res2: AxiosResponse<{ data: NftTransferHistoryByOldOwnerAddressAndTimestampQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(NftTransferHistoryByOldOwnerAddressAndTimestampDocument),
            variables: { timestampFrom, timestampTo, address },
        });

        if (!res.data?.data?.nft_transfer_history) {
            throw new DataServiceError();
        }

        if (!res2.data?.data?.nft_transfer_history) {
            throw new DataServiceError();
        }

        const nftTransferHistoryEntities = res.data.data?.nft_transfer_history?.map((json) => NftModuleNftTransferHistoryEntity.fromGraphQl(json))
            .concat(res2.data.data?.nft_transfer_history?.map((json) => NftModuleNftTransferHistoryEntity.fromGraphQl(json)));

        return nftTransferHistoryEntities || [];
    }

    async fetchMarketplaceNftTradeHistoryByUniqueIds(uniqIds: string[]): Promise<NftMarketplaceTradeHistoryEntity[]> {
        const res: AxiosResponse<{ data: MarketplaceNftTradeHistoryByUniqueIdsQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftTradeHistoryByUniqueIdsDocument),
            variables: { uniqIds },
        });

        if (!res.data?.data?.marketplace_nft_buy_history) {
            throw new DataServiceError();
        }

        const nftMarketplaceTradeHistoryEntity = res.data.data?.marketplace_nft_buy_history?.map((json) => NftMarketplaceTradeHistoryEntity.fromGraphQl(json));

        return nftMarketplaceTradeHistoryEntity || [];
    }

    async fetchMarketplaceNftTradeHistoryByUniqueIdsAndTimestamp(timestampFrom: number, timestampTo: number, uniqIds: string[]): Promise<NftMarketplaceTradeHistoryEntity[]> {
        const res: AxiosResponse<{ data: MarketplaceNftTradeHistoryByUniqueIdsAndTimestampQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftTradeHistoryByUniqueIdsAndTimestampDocument),
            variables: { uniqIds, timestampFrom, timestampTo },
        });

        if (!res.data?.data?.marketplace_nft_buy_history) {
            throw new DataServiceError();
        }

        const nftMarketplaceTradeHistoryEntity = res.data.data?.marketplace_nft_buy_history?.map((json) => NftMarketplaceTradeHistoryEntity.fromGraphQl(json));

        return nftMarketplaceTradeHistoryEntity || [];
    }

    async fetchMarketplaceNftTradeHistoryByAddressAndTimestamp(timestampFrom: number, timestampTo: number, address: string): Promise<NftMarketplaceTradeHistoryEntity[]> {
        const res: AxiosResponse<{ data: MarketplaceNftTradeHistoryByBuyerAddressAndTimestampQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftTradeHistoryByBuyerAddressAndTimestampDocument),
            variables: { timestampFrom, timestampTo, address },
        });

        const res2: AxiosResponse<{ data: MarketplaceNftTradeHistoryBySellerAddressAndTimestampQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftTradeHistoryBySellerAddressAndTimestampDocument),
            variables: { timestampFrom, timestampTo, address },
        });

        if (!res.data?.data?.marketplace_nft_buy_history) {
            throw new DataServiceError();
        }

        if (!res2.data?.data?.marketplace_nft_buy_history) {
            throw new DataServiceError();
        }

        const nftMarketplaceTradeHistoryEntity = res.data.data?.marketplace_nft_buy_history?.map((json) => NftMarketplaceTradeHistoryEntity.fromGraphQl(json))
            .concat(res2.data.data?.marketplace_nft_buy_history?.map((json) => NftMarketplaceTradeHistoryEntity.fromGraphQl(json)));

        return nftMarketplaceTradeHistoryEntity || [];
    }

    async fetchMarketplaceNftTradeHistoryByDenomIds(denomIds: string[]): Promise<NftMarketplaceTradeHistoryEntity[]> {
        const res: AxiosResponse<{ data: MarketplaceNftTradeHistoryByDenomIdsQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftTradeHistoryByDenomIdsDocument),
            variables: { denomIds },
        });

        if (!res.data?.data?.marketplace_nft_buy_history) {
            throw new DataServiceError();
        }

        const nftMarketplaceTradeHistoryEntity = res.data.data?.marketplace_nft_buy_history?.map((json) => NftMarketplaceTradeHistoryEntity.fromGraphQl(json));

        return nftMarketplaceTradeHistoryEntity || [];
    }

    async fetchNftTransferHistoryByDenomIds(denomIds: string[]): Promise<NftModuleNftTransferHistoryEntity[]> {
        const res: AxiosResponse<{ data: NftTransferHistoryByDenomIdsQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(NftTransferHistoryByDenomIdsDocument),
            variables: { denomIds },
        });

        if (!res.data?.data?.nft_transfer_history) {
            throw new DataServiceError();
        }

        const nftTransferHistoryEntities = res.data.data?.nft_transfer_history?.map((json) => NftModuleNftTransferHistoryEntity.fromGraphQl(json));

        return nftTransferHistoryEntities || [];
    }

    async fetchCollectionTotalSales(denomIds: string[]): Promise<{ salesInAcudos: BigNumber, salesInBtc: BigNumber, salesInUsd: number }> {
        const res: AxiosResponse<{ data: MarketplaceNftPriceSumByDenomIdQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftPriceSumByDenomIdDocument),
            variables: { denomIds },
        });

        if (!res.data?.data?.marketplace_nft_buy_history_aggregate) {
            throw new DataServiceError();
        }

        return {
            salesInAcudos: new BigNumber(res.data.data.marketplace_nft_buy_history_aggregate.aggregate.sum.price),
            salesInBtc: new BigNumber(res.data.data.marketplace_nft_buy_history_aggregate.aggregate.sum.btc_price),
            salesInUsd: res.data.data.marketplace_nft_buy_history_aggregate.aggregate.sum.usd_price,
        };
    }

    async fetchTotalPlatformSales(): Promise<{saledInUsd: number, salesInBtc: BigNumber, salesInAcudos: BigNumber}> {
        const res: AxiosResponse<{ data: MarketplaceNftPriceSumTotalQuery }> = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftPriceSumTotalDocument),
        });

        if (!res.data?.data?.marketplace_nft_buy_history_aggregate) {
            throw new DataServiceError();
        }

        const totalSales = res.data?.data?.marketplace_nft_buy_history_aggregate?.aggregate?.sum;

        return {
            saledInUsd: parseFloat(totalSales.usd_price || 0),
            salesInBtc: new BigNumber(totalSales.btc_price || 0),
            salesInAcudos: new BigNumber(totalSales.price || 0),
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
