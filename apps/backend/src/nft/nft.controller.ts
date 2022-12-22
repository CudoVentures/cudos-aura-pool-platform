import { Body, Controller, Get, Param, Post, ValidationPipe, Req, Put, UseInterceptors, HttpCode, Inject, forwardRef } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NFTService } from './nft.service';
import { GraphqlService } from '../graphql/graphql.service';
import { NftStatus } from './nft.types';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import { ReqNftsByFilter, ReqUpdateNftChainData } from './dto/requests.dto';
import NftFilterEntity from './entities/nft-filter.entity';
import { ResFetchNftsByFilter } from './dto/responses.dto';
import NftEntity from './entities/nft.entity';
import { CollectionService } from '../collection/collection.service';
import BigNumber from 'bignumber.js';
import { NOT_EXISTS_INT } from '../common/utils';
import { ChainMarketplaceNftEntity } from '../graphql/entities/nft-marketplace.entity';

@ApiTags('NFT')
@Controller('nft')
export class NFTController {
    constructor(
        private nftService: NFTService,
        @Inject(forwardRef(() => CollectionService))
        private collectionService: CollectionService,
        private graphqlService: GraphqlService,
    // eslint-disable-next-line no-empty-function
    ) {}

    @Post()
    @HttpCode(200)
    async fetchByFilter(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqNftsByFilter: ReqNftsByFilter,
    ): Promise < ResFetchNftsByFilter > {
        const nftFilterEntity = NftFilterEntity.fromJson(reqNftsByFilter.nftFilterJson);
        const { nftEntities, total } = await this.nftService.findByFilter(req.sessionUserEntity, nftFilterEntity);

        return new ResFetchNftsByFilter(nftEntities, total);
    }

    // used by on-demand-minting
    @Get(':id')
    @HttpCode(200)
    async findOne(@Param('id') id: string): Promise<any> {
        const nftFilterEntity = new NftFilterEntity();
        nftFilterEntity.nftIds = [id];

        const { nftEntities } = await this.nftService.findByFilter(null, nftFilterEntity);
        const nftEntity = nftEntities[0];
        const collectionEntity = await this.collectionService.findOne(nftEntity.collectionId);
        return { ...NftEntity.toJson(nftEntity),
            denomId: collectionEntity.denomId,
            data: JSON.stringify({
                expiration_date: nftEntity.expirationDateTimestamp,
                hash_rate_owned: nftEntity.hashingPower,
            }) };
    }

    @UseInterceptors(TransactionInterceptor)
    @Put('trigger-updates')
    @HttpCode(200)
    async updateNftsChainData(
        @Req() req: AppRequest,
        @Body() reqUpdateNftChainData: ReqUpdateNftChainData,
    ): Promise<void> {
        const { nftDtos: nftDataJsons, height } = reqUpdateNftChainData;

        const bdJunoParsedHeight = await this.graphqlService.fetchLastParsedHeight();

        if (height > bdJunoParsedHeight) {
            throw new Error(`BDJuno not yet on block:  ${height}`);
        }

        const denomIds = nftDataJsons.map((nftJson) => nftJson.denomId)
            .filter((denomId, index, self) => self.indexOf(denomId) === index);

        let chainMarketplaceNftEntities: ChainMarketplaceNftEntity[] = [];
        for (let i = 0; i < denomIds.length; i++) {
            const denomId = denomIds[i];
            const tokenIds = nftDataJsons.filter((nftDataJson) => nftDataJson.denomId === denomId).map((nftDataJson) => nftDataJson.tokenId);

            const marketplaceNftDtos = await this.graphqlService.fetchMarketplaceNftsByTokenIds(tokenIds, denomId);
            chainMarketplaceNftEntities = chainMarketplaceNftEntities.concat(marketplaceNftDtos);
        }

        // fetch nfts
        const nftFilterEntity = new NftFilterEntity();
        nftFilterEntity.nftIds = chainMarketplaceNftEntities.map((entity) => entity.uid);
        const { nftEntities } = await this.nftService.findByFilter(null, nftFilterEntity);

        for (let i = 0; i < chainMarketplaceNftEntities.length; i++) {
            const nftEntity = nftEntities[i];
            const chainMarketplaceNftEntity = chainMarketplaceNftEntities.find((dto) => dto.uid === nftEntity.id);

            nftEntity.data = chainMarketplaceNftEntity.data;
            nftEntity.name = chainMarketplaceNftEntity.name;
            nftEntity.currentOwner = chainMarketplaceNftEntity.owner;
            nftEntity.uri = chainMarketplaceNftEntity.uri;
            nftEntity.acudosPrice = chainMarketplaceNftEntity.acudosPrice || new BigNumber(NOT_EXISTS_INT);
            nftEntity.tokenId = chainMarketplaceNftEntity.tokenId;
            nftEntity.status = chainMarketplaceNftEntity.burned === true ? NftStatus.REMOVED : NftStatus.MINTED;
            nftEntity.marketplaceNftId = chainMarketplaceNftEntity.marketplaceNftId.toString();

            await this.nftService.updateOneWithStatus(nftEntity.id, nftEntity, req.transaction);
        }
    }
}
