import { Body, Controller, Get, Param, Post, ValidationPipe, Req, Put, UseInterceptors, HttpCode } from '@nestjs/common';
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
    @HttpCode(200)
    async fetchByFilter(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqNftsByFilter: ReqNftsByFilter,
    ): Promise < ResFetchNftsByFilter > {
        const nftFilterEntity = NftFilterEntity.fromJson(reqNftsByFilter.nftFilterJson);
        const { nftEntities, total } = await this.nftService.findByFilter(req.sessionUserEntity, nftFilterEntity);

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
    @HttpCode(200)
    async findOne(@Param('id') id: string): Promise<any> {
        const nftFilterEntity = new NftFilterEntity();
        nftFilterEntity.nftIds = [id];

        const { nftEntities } = await this.nftService.findByFilter(null, nftFilterEntity);
        const nftEntity = nftEntities[0];
        const collectionEntity = await this.collectionService.findOne(nftEntities[0].collectionId);
        return { ...NftEntity.toJson(nftEntity), denomId: collectionEntity.denomId };
    }

    @UseInterceptors(TransactionInterceptor)
    @Put('trigger-updates')
    @HttpCode(200)
    async updateNftsChainData(
        @Req() req: AppRequest,
        @Body() reqUpdateNftChainData: ReqUpdateNftChainData,
    ): Promise<void> {
        const nftDataJsons = reqUpdateNftChainData.nftDtos;
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

        // fetch nfts
        const nftFilterEntity = new NftFilterEntity();
        nftFilterEntity.nftIds = chainMarketplaceNftDtos.map((entity) => entity.uid);
        const { nftEntities } = await this.nftService.findByFilter(null, nftFilterEntity);

        for (let i = 0; i < chainMarketplaceNftDtos.length; i++) {
            const chainMarketplaceNftDto: ChainMarketplaceNftDto = chainMarketplaceNftDtos[i];

            const nftEntity = nftEntities.find((entity) => entity.id === chainMarketplaceNftDto.uid)

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
