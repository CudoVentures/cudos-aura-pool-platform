import { Body, Controller, Get, Param, Post, ValidationPipe, Req, Put, UseInterceptors, HttpCode, Inject, forwardRef, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NFTService } from './nft.service';
import { GraphqlService } from '../graphql/graphql.service';
import { NftStatus } from './nft.types';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import { ReqMintPresaleNfts, ReqNftsByFilter, ReqUpdateNftChainData, ReqUpdateNftCudosPrice } from './dto/requests.dto';
import NftFilterEntity from './entities/nft-filter.entity';
import { ResFetchNftsByFilter, ResFetchPresaleAmounts, ResMintPresaleNfts, ResUpdateNftCudosPrice } from './dto/responses.dto';
import NftEntity from './entities/nft.entity';
import { CollectionService } from '../collection/collection.service';
import BigNumber from 'bignumber.js';
import { ChainMarketplaceNftEntity } from '../graphql/entities/nft-marketplace.entity';
import { FarmService } from '../farm/farm.service';
import { validate } from 'uuid';
import { ConfigService } from '@nestjs/config';
import AccountService from '../account/account.service';
import AllowlistService from '../allowlist/allowlist.service';
import { KycService } from '../kyc/kyc.service';
import AddressMintDataEntity from './entities/adress-mint-data.entity';
import { AuthGuard } from '@nestjs/passport';
import { AccountType } from '../account/account.types';
import RoleGuard from '../auth/guards/role.guard';

@ApiTags('NFT')
@Controller('nft')
export class NFTController {
    constructor(
        private nftService: NFTService,
        @Inject(forwardRef(() => CollectionService))
        private collectionService: CollectionService,
        private graphqlService: GraphqlService,
        @Inject(forwardRef(() => FarmService))
        private miningFarmService: FarmService,
        private configService: ConfigService,
        private accountService: AccountService,
        private allowlistService: AllowlistService,
        private kycService: KycService,
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
    @Get('on-demand-minting-nft/:id/:recipient/:paidAmountAcudosStr')
    @HttpCode(200)
    async findOne(
        @Param('id') id: string,
        @Param('recipient') recipient: string,
        @Param('paidAmountAcudosStr') paidAmountAcudosStr: string,
    ): Promise<any> {
        const paidAmountAcudos = new BigNumber(paidAmountAcudosStr);
        const userEntity = await this.accountService.findUserByCudosWalletAddress(recipient);
        if (userEntity === null) {
            console.log('Getting NFT from OnDemandMinting', 'user not found', recipient);
            throw new NotFoundException();
        }

        const accountEntity = await this.accountService.findAccountById(userEntity.accountId);
        let nftEntity: NftEntity;

        if (id === 'presale') {
            const presaleEndTimestamp = this.configService.get<number>('APP_PRESALE_END_TIMESTAMP');
            if (presaleEndTimestamp < Date.now()) {
                console.log('Getting NFT from OnDemandMinting', 'presale has ended at', presaleEndTimestamp);
                throw new Error('Presale ended.')
            }

            const allowlistUser = this.allowlistService.getAllowlistUserByAddress(recipient);

            if (allowlistUser === null) {
                console.log(`Address ${recipient} not found in allowlist`);
                throw new Error('Recipient not in allowlist.')
            }

            nftEntity = await this.nftService.getRandomPresaleNft(paidAmountAcudos);
            if (nftEntity !== null) {
                nftEntity = await this.nftService.updatePremintNftPrice(nftEntity, paidAmountAcudos);
            }
        } else {
            const presaleEndTimestamp = this.configService.get<number>('APP_PRESALE_END_TIMESTAMP');
            if (presaleEndTimestamp > Date.now()) {
                console.log('Getting NFT from OnDemandMinting', 'public sale has not started yet', presaleEndTimestamp);
                throw new Error('Presale ended.')
            }

            nftEntity = await this.nftService.findOne(id);

            const presaleExpectedPriceEpsilon = this.configService.get<number>('APP_PRESALE_EXPECTED_PRICE_EPSILON');
            const expectedAcudosEpsilonAbsolute = paidAmountAcudos.multipliedBy(presaleExpectedPriceEpsilon);
            const expectedAcudosLowerBand = expectedAcudosEpsilonAbsolute.minus(expectedAcudosEpsilonAbsolute);
            const expectedAcudosUpperband = expectedAcudosEpsilonAbsolute.plus(expectedAcudosEpsilonAbsolute);

            if (nftEntity.acudosPrice.lt(expectedAcudosLowerBand) === true && nftEntity.acudosPrice.gt(expectedAcudosUpperband) === true) {
                console.log('Getting NFT from OnDemandMinting', 'not enough funds', expectedAcudosLowerBand, nftEntity.acudosPrice, expectedAcudosUpperband);
                nftEntity = null
            }
        }

        if (nftEntity === null) {
            console.log('Nft is null');
            throw new NotFoundException();
        }

        if (nftEntity.hasPrice() === false) {
            console.log('nft does not have price in acudos');
            throw new NotFoundException();
        }

        const canBuyNft = await this.kycService.canBuyAnNft(accountEntity, userEntity, nftEntity);
        if (canBuyNft === false) {
            console.log('The user does not meet KYC creteria');
            throw new NotFoundException();
        }

        if (nftEntity.isPriceInAcudosValidForMinting() === false) {
            console.log('Getting NFT from OnDemandMinting', 'price not valid for minting');
            throw new NotFoundException();
        }

        if (nftEntity.isQueued() === false) {
            console.log('Getting NFT from OnDemandMinting', 'is not queued');
            throw new NotFoundException();
        }

        const collectionEntity = await this.collectionService.findOne(nftEntity.collectionId);
        if (collectionEntity === null || collectionEntity.isApproved() === false) {
            console.log('Getting NFT from OnDemandMinting', 'wrong collection', nftEntity.collectionId);
            throw new NotFoundException();
        }

        const miningFarmEntity = await this.miningFarmService.findMiningFarmById(collectionEntity.farmId);
        if (miningFarmEntity === null || miningFarmEntity.isApproved() === false) {
            console.log('Getting NFT from OnDemandMinting', 'wrong mining farm', collectionEntity.farmId);
            throw new NotFoundException();
        }

        if (nftEntity.expirationDateTimestamp < Date.now()) {
            console.log('Getting NFT from OnDemandMinting', 'expired nft');
            throw new NotFoundException();
        }

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
        nftFilterEntity.nftIds = chainMarketplaceNftEntities.filter((entity) => validate(entity.uid)).map((entity) => entity.uid);
        const { nftEntities } = await this.nftService.findByFilter(null, nftFilterEntity);

        for (let i = 0; i < nftEntities.length; i++) {
            const nftEntity = nftEntities[i];
            const chainMarketplaceNftEntity = chainMarketplaceNftEntities.find((dto) => dto.uid === nftEntity.id);

            nftEntity.data = chainMarketplaceNftEntity.data;
            nftEntity.name = chainMarketplaceNftEntity.name;
            nftEntity.currentOwner = chainMarketplaceNftEntity.owner;
            nftEntity.uri = chainMarketplaceNftEntity.uri;
            nftEntity.acudosPrice = chainMarketplaceNftEntity.acudosPrice ?? new BigNumber(0);
            nftEntity.tokenId = chainMarketplaceNftEntity.tokenId;
            nftEntity.status = chainMarketplaceNftEntity.burned === true ? NftStatus.REMOVED : NftStatus.MINTED;
            nftEntity.marketplaceNftId = chainMarketplaceNftEntity.marketplaceNftId ? chainMarketplaceNftEntity.marketplaceNftId.toString() : '';

            await this.nftService.updateOneWithStatus(nftEntity.id, nftEntity, req.transaction);
        }
    }

    @ApiBearerAuth('access-token')
    @Post('updatePrice')
    @HttpCode(200)
    async updatePrice(@Body() req: ReqUpdateNftCudosPrice): Promise<ResUpdateNftCudosPrice> {
        const nftEntity = await this.nftService.updateNftCudosPrice(req.id);

        return new ResUpdateNftCudosPrice(nftEntity);
    }

    @Get('fetchPresaleAmounts')
    @HttpCode(200)
    async fetchPresaleAmounts(): Promise<ResFetchPresaleAmounts> {
        const { totalPresaleNftCount, presaleMintedNftCount } = await this.nftService.fetchPresaleAmounts();

        return new ResFetchPresaleAmounts(totalPresaleNftCount, presaleMintedNftCount);
    }
}
