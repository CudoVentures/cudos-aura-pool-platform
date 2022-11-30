import { Body, Controller, Get, Param, Post, ValidationPipe, Req, Put, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListStatus, NFT } from './nft.model';
import { NFTService } from './nft.service';
import { GraphqlService } from '../graphql/graphql.service';
import NftFilterModel from './dto/nft-filter.model';
import { UpdateNftChainDataRequestDto } from './dto/update-nft-chain-data-request.dto';
import { ModuleName } from '../collection/dto/update-collection-chain-data-request.dto';
import { ChainMarketplaceNftDto } from './dto/chain-marketplace-nft.dto';
import { NftStatus } from './nft.types';
import { ChainNftNftDto } from './dto/chain-nft-nft.dto';
import { IntBoolValue } from '../common/utils';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';

@ApiTags('NFT')
@Controller('nft')
export class NFTController {
    constructor(
        private nftService: NFTService,
        private graphqlService: GraphqlService,
    ) {}

    @Post()
    async findAll(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) nftFilterModel: NftFilterModel,
    ): Promise < { nftEntities: NFT[], total: number } > {
        const { nftEntities, total } = await this.nftService.findByFilter(req.sessionAccountEntity, nftFilterModel);

        for (let i = nftEntities.length; i-- > 0;) {
            const nftEntity = nftEntities[i];

            if (nftEntity.isMinted() === true) {
                const nftDetails = await this.graphqlService.fetchNft(nftEntity.id)
                if (nftDetails?.marketplace_nft?.length === 1) {
                    const details = nftDetails.marketplace_nft[0];
                    nftEntity.price = details.price;
                    nftEntity.creatorAddress = details.creator;
                    nftEntity.currentOwnerAddress = details.nft_nft.owner ?? '';
                }
            }
        }

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

        return {
            nftEntities,
            total,
        };
    }

    // @Get('minted')
    // async findMinted(
    //     @Query() filters: Partial<MarketplaceNftFilters>,
    // ): Promise < MarketplaceNftsByDenomIdQuery > {
    //     const collectionFilterModel = new CollectionFilterModel();
    //     collectionFilterModel.status = CollectionStatus.APPROVED;

    //     const { collectionEntities } = await this.collectionService.findByFilter(collectionFilterModel);
    //     const denomIds = collectionEntities.map((collection: Collection) => collection.denom_id);

    //     return this.graphqlService.fetchNft({
    //         denom_ids: denomIds,
    //     });
    // }

    //   @Put('minted/check-status')
    //     async mint(@Body() checkStatusDto: CheckStatusDto): Promise<NFT> {
    //         const { tx_hash } = checkStatusDto;

    //         const { token_id, uuid } = await this.nftService.getNftAttributes(tx_hash);

    //         await this.nftService.updateStatus(uuid, NftStatus.MINTED);
    //         return this.nftService.updateTokenId(uuid, token_id)
    //     }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<any> {
        const nft = await this.nftService.findOne(id);

        // TODO uri will crash minting service until we make it a normal uri
        const response = {
            ...nft.toJSON(),
            denom_id: nft.collection.denom_id,
            nft_data: 'CudosAuraMintService',
            price_coin: { amount: nft.getDataValue('price'), denom: 'acudos' },
            data: {
                expiration_date: Math.floor(nft.expiration_date.getTime() / 1000),
                hash_rate_owned: nft.hashing_power,
            },
        }

        return response;
    }

    //   @ApiBearerAuth('access-token')
    //   @ApiBody({ type: [NFTDto] })
    //   @UseGuards(RoleGuard([Role.FARM_ADMIN]))
    //   @Post()
    //   async create(
    //     @Request() req,
    //     @Body() nfts: NFTDto[],
    //   ): Promise<NFT[]> {
    // const createdNfts = nfts.map(async (nft) => {
    //     const collection = await this.collectionService.findOne(
    //         nft.collection_id,
    //     );

    //     if (!collection) {
    //         throw new NotFoundException('Collection does not exist');
    //     }

    //     const createdNft = this.nftService.createOne(nft, req.user.id)
    //     return createdNft
    // })

    // const result = await Promise.all(createdNfts)

    //       return result
    //   }

    //     @ApiBearerAuth('access-token')
    //     @UseGuards(RoleGuard([Role.FARM_ADMIN]), IsCreatorOrSuperAdminGuard)
    //     @Put(':id')
    //   async update(
    //             @Param('id') id: string,
    //             @Body() updateNFTDto: UpdateNFTDto,
    //   ): Promise<NFT> {
    //       return this.nftService.updateOne(id, updateNFTDto);
    //   }

    //   @ApiBearerAuth('access-token')
    //   @UseGuards(RoleGuard([Role.SUPER_ADMIN]))
    //   @Patch(':id/status')
    //     async updateStatus(
    //     @Param('id') id: string,
    //     @Body() updateNftStatusDto: UpdateNFTStatusDto,
    //     ): Promise<NFT> {
    //         return this.nftService.updateStatus(id, updateNftStatusDto.status);
    //     }

    //   @ApiBearerAuth('access-token')
    //   @UseGuards(RoleGuard([Role.FARM_ADMIN]), IsCreatorOrSuperAdminGuard)
    //   @Delete(':id')
    //   async delete(@Param('id') id: string): Promise<NFT> {
    //       return this.nftService.deleteOne(id);
    //   }

    @UseInterceptors(TransactionInterceptor)
    @Put('trigger-updates')
    async updateNftsChainData(
        @Req() req: AppRequest,
        @Body() updateNftChainDataRequestDto: UpdateNftChainDataRequestDto,
    ): Promise<void> {
        const tokenIds = updateNftChainDataRequestDto.tokenIds;
        const module = updateNftChainDataRequestDto.module;

        if (module === ModuleName.MARKETPLACE) {
            const chainMarketplaceNftDtos = await this.nftService.getChainMarketplaceNftsByTokenIds(tokenIds);
            for (let i = 0; i < chainMarketplaceNftDtos.length; i++) {
                const chainMarketplaceNftDto: ChainMarketplaceNftDto = chainMarketplaceNftDtos[i];

                const nft = new NFT();
                nft.price = chainMarketplaceNftDto.price;
                nft.listedStatus = chainMarketplaceNftDto.price ? ListStatus.LISTED : ListStatus.NOT_LISTED;

                await this.nftService.updateOneByTokenId(chainMarketplaceNftDto.tokenId, nft, req.transaction);
            }
        } else if (module === ModuleName.NFT) {
            const chainNftNftsDtos = await this.nftService.getChainNftNftsByTokenIds(tokenIds);
            for (let i = 0; i < chainNftNftsDtos.length; i++) {
                const chainNftNftDto: ChainNftNftDto = chainNftNftsDtos[i];

                const nft = new NFT();

                nft.status = chainNftNftDto.burned === IntBoolValue.TRUE ? NftStatus.REMOVED : null;
                nft.data = chainNftNftDto.data;
                nft.name = chainNftNftDto.name;
                nft.currentOwnerAddress = chainNftNftDto.owner;
                nft.uri = chainNftNftDto.uri;

                await this.nftService.updateOneByTokenId(chainNftNftDto.tokenId, nft, req.transaction);
            }
        }
    }

}
