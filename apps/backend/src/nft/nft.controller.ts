import { Body, Controller, Get, Param, Post, ValidationPipe, Req, Put, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NFTService } from './nft.service';
import { GraphqlService } from '../graphql/graphql.service';
import { ChainMarketplaceNftDto } from './dto/chain-marketplace-nft.dto';
import { NftJsonValidator, NftStatus } from './nft.types';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import { ReqNftsByFilter, ReqUpdateNftChainData } from './dto/requests.dto';
import NftFilterEntity from './entities/nft-filter.entity';
import { ResFetchNftsByFilter } from './dto/responses.dto';
import NftEntity from './entities/nft.entity';
import CollectionFilterEntity from '../collection/entities/collection-filter.entity';
import { CollectionService } from '../collection/collection.service';

@ApiTags('NFT')
@Controller('nft')
export class NFTController {
    constructor(
        private nftService: NFTService,
        private collectionService: CollectionService,
        private graphqlService: GraphqlService,
    // eslint-disable-next-line no-empty-function
    ) {}

    @Post()
    async fetchByFilter(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqNftsByFilter: ReqNftsByFilter,
    ): Promise < ResFetchNftsByFilter > {
        const nftFilterEntity = NftFilterEntity.fromJson(reqNftsByFilter.nftFilterJson);

        const { nftEntities, total } = await this.nftService.findByFilter(req.sessionAccountEntity, nftFilterEntity);

        return new ResFetchNftsByFilter(nftEntities, total);
    }

    //-------------------------------------------------------------
    // GET DETAILS PREVIOUSLY IN GET BY FILTER FUNCTION
    //-------------------------------------------------------------
    // if (nftEntity.isMinted() === true) {
    //     const nftDetails = await this.graphqlService.fetchNft(nftEntity.id)
    //     if (nftDetails?.marketplace_nft?.length === 1) {
    //         const details = nftDetails.marketplace_nft[0];
    //         nftEntity.price = details.price;
    //         nftEntity.creatorAddress = details.creator;
    //     }
    // }
    // const nftDetails = nftEntities.map(async (nftEntity) => {
    // if (nft.status !== NftStatus.MINTED || !nft.token_id) {
    //     return {
    //         ...nft.toJSON(),
    //         listed_status: NftStatus.APPROVED ? 2 : 1,
    //     }
    // }
    // const [nftDetails] = await this.graphqlService.fetchNft(nft.id)
    // return {
    //     ...nft.toJSON(),
    //     listed_status: nftDetails.price ? 2 : 1,
    //     price: nftDetails.price,
    //     creator_address: nftDetails.creator,
    //     current_owner_address: nftDetails.nft_nft.owner,
    // }
    // })
    //-----------------------------------------------------------------------------------

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<NftJsonValidator> {
        const nftFilterEntity = new NftFilterEntity();
        nftFilterEntity.nftIds = [id];

        const { nftEntities } = await this.nftService.findByFilter(null, nftFilterEntity);

        return NftEntity.toJson(nftEntities[0]);
    }

    @UseInterceptors(TransactionInterceptor)
    @Put('trigger-updates')
    async updateNftsChainData(
        @Req() req: AppRequest,
        @Body() reqUpdateNftChainData: ReqUpdateNftChainData,
    ): Promise<void> {
        const nftDataJsons = reqUpdateNftChainData.nftDataJsons;
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

        if (chainMarketplaceNftDtos.length !== nftDataJsons.length) {
            throw new Error('NFTs not yet found in BDJuno');
        }

        // fetch collections by denom ids so we can get their collection ids
        const collectionFitlerEntity = new CollectionFilterEntity();
        collectionFitlerEntity.denomIds = denomIds;
        const { collectionEntities } = await this.collectionService.findByFilter(collectionFitlerEntity)

        // fetch nfts
        const nftFilterEntity = new NftFilterEntity();
        nftFilterEntity.collectionIds = collectionEntities.map((entity) => entity.id.toString());
        nftFilterEntity.tokenIds = nftDataJsons.map((nftDataJson) => nftDataJson.tokenId);
        const { nftEntities } = await this.nftService.findByFilter(null, nftFilterEntity);

        for (let i = 0; i < chainMarketplaceNftDtos.length; i++) {
            const chainMarketplaceNftDto: ChainMarketplaceNftDto = chainMarketplaceNftDtos[i];
            const collectionEntity = collectionEntities.find((entity) => entity.denomId === chainMarketplaceNftDto.denomId)
            const nftEntity = nftEntities.find((entity) => entity.collectionId === collectionEntity.id && entity.tokenId === chainMarketplaceNftDto.tokenId)

            nftEntity.data = chainMarketplaceNftDto.data;
            nftEntity.name = chainMarketplaceNftDto.name;
            nftEntity.currentOwner = chainMarketplaceNftDto.owner;
            nftEntity.uri = chainMarketplaceNftDto.uri;
            nftEntity.price = chainMarketplaceNftDto.price;
            nftEntity.tokenId = chainMarketplaceNftDto.tokenId;
            nftEntity.status = chainMarketplaceNftDto.burned === true ? NftStatus.REMOVED : NftStatus.MINTED;
            nftEntity.marketplaceNftId = chainMarketplaceNftDto.marketplaceNftId;

            await this.nftService.updateOneWithStatus(chainMarketplaceNftDto.uid, nftEntity, req.transaction);
        }
    }
}
