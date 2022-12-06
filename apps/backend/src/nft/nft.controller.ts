import { Body, Controller, Get, Param, Post, ValidationPipe, Req, Put, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NFT } from './nft.model';
import { NFTService } from './nft.service';
import { GraphqlService } from '../graphql/graphql.service';
import NftFilterModel from './dto/nft-filter.model';
import { UpdateNftChainDataRequestDto } from './dto/update-nft-chain-data-request.dto';
import { ChainMarketplaceNftDto } from './dto/chain-marketplace-nft.dto';
import { NftStatus } from './nft.types';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import AccountService from '../account/account.service';

@ApiTags('NFT')
@Controller('nft')
export class NFTController {
    constructor(
        private nftService: NFTService,
        private accountService: AccountService,
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

            const { adminEntity } = await this.accountService.findAccounts(nftEntity.creator_id);
            nftEntity.creatorAddress = adminEntity.cudosWalletAddress;
            // if (nftEntity.isMinted() === true) {
            //     const nftDetails = await this.graphqlService.fetchNft(nftEntity.id)
            //     if (nftDetails?.marketplace_nft?.length === 1) {
            //         const details = nftDetails.marketplace_nft[0];
            //         nftEntity.price = details.price;
            //         nftEntity.creatorAddress = details.creator;
            //     }
            // }
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
        const priceCoin = { amount: nft.getDataValue('price'), denom: 'acudos' };
        const response = {
            ...nft.toJSON(),
            denom_id: nft.collection.denom_id,
            nft_data: 'CudosAuraMintService',
            price_coin: priceCoin,
            data: {
                expiration_date: Math.floor(nft.expiration_date.getTime() / 1000),
                hash_rate_owned: nft.hashing_power,
            },
        }

        return response;
    }

    //   @ApiBearerAuth('access-token')
    //   @ApiBody({ type: [NFTDto] })
    //   @UseGuards(RoleGuard([AccountType.ADMIN]))
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
    //     @UseGuards(RoleGuard([AccountType.ADMIN]), IsCreatorOrSuperAdminGuard)
    //     @Put(':id')
    //   async update(
    //             @Param('id') id: string,
    //             @Body() updateNFTDto: UpdateNFTDto,
    //   ): Promise<NFT> {
    //       return this.nftService.updateOne(id, updateNFTDto);
    //   }

    //   @ApiBearerAuth('access-token')
    //   @UseGuards(RoleGuard([AccountType.SUPER_ADMIN]))
    //   @Patch(':id/status')
    //     async updateStatus(
    //     @Param('id') id: string,
    //     @Body() updateNftStatusDto: UpdateNFTStatusDto,
    //     ): Promise<NFT> {
    //         return this.nftService.updateStatus(id, updateNftStatusDto.status);
    //     }

    //   @ApiBearerAuth('access-token')
    //   @UseGuards(RoleGuard([AccountType.ADMIN]), IsCreatorOrSuperAdminGuard)
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
        const nftDtos = updateNftChainDataRequestDto.nftDtos;
        const denomIds = nftDtos.map((nftDto) => nftDto.denomId).filter((denomId, index, self) => self.indexOf(denomId) === index);

        let chainMarketplaceNftDtos = [];
        for (let i = 0; i < denomIds.length; i++) {
            const denomId = denomIds[i];
            const tokenIds = nftDtos.filter((nftDto) => nftDto.denomId === denomId).map((nftDto) => nftDto.tokenId);
            const marketplaceNftDtos = await this.nftService.getChainMarketplaceNftsByTokenIds(tokenIds, denomId);
            chainMarketplaceNftDtos = chainMarketplaceNftDtos.concat(marketplaceNftDtos);
        }

        if (chainMarketplaceNftDtos.length !== nftDtos.length) {
            throw new Error('NFTs not yet found in BDJuno');
        }

        for (let i = 0; i < chainMarketplaceNftDtos.length; i++) {
            const chainMarketplaceNftDto: ChainMarketplaceNftDto = chainMarketplaceNftDtos[i];

            // TODO: make better
            const nftDto = {
                data: chainMarketplaceNftDto.data,
                name: chainMarketplaceNftDto.name,
                current_owner: chainMarketplaceNftDto.owner,
                uri: chainMarketplaceNftDto.uri,
                price: chainMarketplaceNftDto.price,
                token_id: chainMarketplaceNftDto.tokenId,
                status: chainMarketplaceNftDto.burned === true ? NftStatus.REMOVED : NftStatus.MINTED,
                marketplace_nft_id: chainMarketplaceNftDto.marketplaceNftId,
            }

            await this.nftService.updateOneWithStatus(chainMarketplaceNftDto.uid, nftDto, req.transaction);
        }
    }
}
