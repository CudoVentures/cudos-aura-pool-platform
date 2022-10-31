import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { print } from 'graphql';
import { AxiosResponse } from 'axios';
import {
    MarketplaceNftQuery,
    MarketplaceNftDocument,
    MarketplaceCollectionQuery,
    MarketplaceCollectionDocument,
    GetNftByTxHashQuery,
    GetNftByTxHashDocument,
} from './types';
import { MarketplaceNftFilters } from '../nft/utils';

@Injectable()
export class GraphqlService {
    constructor(private readonly httpService: HttpService) {}

    async fetchNft(
        filters: Partial<MarketplaceNftFilters>,
    ): Promise<MarketplaceNftQuery> {
        const res = await this.httpService.axiosRef.post(process.env.App_Hasura_Url, {
            query: print(MarketplaceNftDocument),
            variables: { ...filters },
        });

        return res.data.data.marketplace_nft;
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
}
