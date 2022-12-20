import { Body, Controller, Get, Param, Post, ValidationPipe, Req, Put, UseInterceptors, HttpCode, Inject, forwardRef } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NFTService } from './nft.service';
import { GraphqlService } from '../graphql/graphql.service';
import { ChainMarketplaceNftDto } from './dto/chain-marketplace-nft.dto';
import { NftStatus } from './nft.types';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import { ReqNftsByFilter, ReqUpdateNftChainData } from './dto/requests.dto';
import NftFilterEntity from './entities/nft-filter.entity';
import { ResFetchNftsByFilter } from './dto/responses.dto';
import NftEntity from './entities/nft.entity';
import { CollectionService } from '../collection/collection.service';

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
            data: {
                expiration_date: nftEntity.expirationDateTimestamp,
                hash_rate_owned: nftEntity.hashingPower,
            } };
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

        if (height > parseInt(bdJunoParsedHeight.block_aggregate.aggregate.max.height)) {
            throw new Error(`BDJuno not yet on block:  ${height}`);
        }
        const denomIds = nftDataJsons.map((nftJson) => nftJson.denomId)
            .filter((denomId, index, self) => self.indexOf(denomId) === index);

        let chainMarketplaceNftDtos = [];
        for (let i = 0; i < denomIds.length; i++) {
            const denomId = denomIds[i];
            const tokenIds = nftDataJsons.filter((nftDataJson) => nftDataJson.denomId === denomId).map((nftDataJson) => nftDataJson.tokenId);

            const queryRes = await this.graphqlService.fetchMarketplaceNftsByTokenIds(tokenIds, denomId);
            const marketplaceNftDtos = queryRes.marketplace_nft.map((queryNft) => ChainMarketplaceNftDto.fromQuery(queryNft));
            chainMarketplaceNftDtos = chainMarketplaceNftDtos.concat(marketplaceNftDtos);
        }

        // fetch nfts
        const nftFilterEntity = new NftFilterEntity();
        nftFilterEntity.nftIds = chainMarketplaceNftDtos.map((entity) => entity.uid);
        const { nftEntities } = await this.nftService.findByFilter(null, nftFilterEntity);

        for (let i = 0; i < chainMarketplaceNftDtos.length; i++) {
            const nftEntity = nftEntities[i];
            const chainMarketplaceNftDto = chainMarketplaceNftDtos.find((dto) => dto.uid === nftEntity.id);

            nftEntity.data = chainMarketplaceNftDto.data;
            nftEntity.name = chainMarketplaceNftDto.name;
            nftEntity.currentOwner = chainMarketplaceNftDto.owner;
            nftEntity.uri = chainMarketplaceNftDto.uri;
            nftEntity.price = chainMarketplaceNftDto.price;
            nftEntity.tokenId = chainMarketplaceNftDto.tokenId;
            nftEntity.status = chainMarketplaceNftDto.burned === true ? NftStatus.REMOVED : NftStatus.MINTED;
            nftEntity.marketplaceNftId = chainMarketplaceNftDto.marketplaceNftId.toString();

            await this.nftService.updateOneWithStatus(nftEntity.id, nftEntity, req.transaction);
        }
    }
}
