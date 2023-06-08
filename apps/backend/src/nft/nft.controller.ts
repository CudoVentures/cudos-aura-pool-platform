import { Body, Controller, Get, Param, Post, ValidationPipe, Req, Put, UseInterceptors, HttpCode, Inject, forwardRef, NotFoundException, UseGuards } from '@nestjs/common';
import { NFTService } from './nft.service';
import { GraphqlService } from '../graphql/graphql.service';
import { NftStatus } from './nft.types';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import { ReqCreditPurchaseTransactionEntities, ReqFetchPurchaseTransactions, ReqNftsByFilter, ReqUpdateNftChainData, ReqUpdateNftCudosPrice } from './dto/requests.dto';
import NftFilterEntity from './entities/nft-filter.entity';
import { ResFetchNftsByFilter, ResFetchPresaleAmounts, ResFetchPurchaseTransactions, ResUpdateNftCudosPrice } from './dto/responses.dto';
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
import ApiKeyGuard from '../auth/guards/api-key.guard';
import PurchaseTransactionEntity from './entities/purchase-transaction-entity';
import PurchaseTransactionsFilterEntity from './entities/purchase-transaction-filter-entity';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

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
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @Throttle(40, 1)
    async fetchByFilter(
        @Req() req: AppRequest,
        @Body(new ValidationPipe({ transform: true })) reqNftsByFilter: ReqNftsByFilter,
    ): Promise < ResFetchNftsByFilter > {
        const nftFilterEntity = NftFilterEntity.fromJson(reqNftsByFilter.nftFilterJson);
        const { nftEntities, total } = await this.nftService.findByFilter(req.sessionUserEntity, nftFilterEntity, req.transaction);

        if (nftFilterEntity.inOnlyForSessionAccount() === true && req.sessionUserEntity === null) {
            req.logger.info('Request for session nfts without logged account');
        }

        return new ResFetchNftsByFilter(nftEntities, total);
    }

    // used by on-demand-minting
    @Get('on-demand-minting-nft/:id/:recipient/:paidAmountAcudosStr')
    @UseInterceptors(TransactionInterceptor)
    @UseGuards(ApiKeyGuard)
    @SkipThrottle()
    @HttpCode(200)
    async findOne(
        @Req() req: AppRequest,
        @Param('id') id: string,
        @Param('recipient') recipient: string,
        @Param('paidAmountAcudosStr') paidAmountAcudosStr: string,
    ): Promise<any> {
        const paidAmountAcudos = new BigNumber(paidAmountAcudosStr);
        const userEntity = await this.accountService.findUserByCudosWalletAddress(recipient, req.transaction);
        if (userEntity === null) {
            console.log('Getting NFT from OnDemandMinting', 'user not found', recipient);
            req.logger.info(`Getting NFT from OnDemandMinting user not found ${recipient}`);
            throw new NotFoundException();
        }

        const accountEntity = await this.accountService.findAccountById(userEntity.accountId, req.transaction);
        let nftEntity: NftEntity;

        if (id === 'presale') {
            const presaleEndTimestamp = this.configService.getOrThrow<number>('APP_PRESALE_END_TIMESTAMP');
            if (presaleEndTimestamp < Date.now()) {
                console.log('Getting NFT from OnDemandMinting', 'presale has ended at', presaleEndTimestamp);
                req.logger.info(`Getting NFT from OnDemandMinting presale has ended at ${presaleEndTimestamp}`);
                throw new Error('Presale ended.')
            }

            const respectAllowlist = this.configService.getOrThrow<string>('APP_RESPECT_ALLOWLIST');
            if (respectAllowlist === 'true') {
                const allowlistUser = this.allowlistService.getAllowlistUserByAddress(recipient, req.transaction);
                if (allowlistUser === null) {
                    console.log('Getting NFT from OnDemandMinting', `Address ${recipient} not found in allowlist`);
                    req.logger.info(`Getting NFT from OnDemandMinting Address ${recipient} not found in allowlist`);
                    throw new Error('Recipient not in allowlist.')
                }
            }

            nftEntity = await this.nftService.getRandomPresaleNft(paidAmountAcudos, req.transaction, req.transaction.LOCK.UPDATE);
            if (nftEntity !== null) {
                nftEntity = await this.nftService.updatePremintNftPrice(nftEntity, paidAmountAcudos, req.transaction);
            }
        } else {
            const presaleEndTimestamp = this.configService.getOrThrow<number>('APP_PRESALE_END_TIMESTAMP');
            if (presaleEndTimestamp > Date.now()) {
                console.log('Getting NFT from OnDemandMinting', 'public sale has not started yet', presaleEndTimestamp);
                req.logger.info(`Getting NFT from OnDemandMinting public sale has not started yet ${presaleEndTimestamp}`);
                throw new Error('Presale ended.')
            }

            nftEntity = await this.nftService.findOne(id, req.transaction, req.transaction.LOCK.UPDATE);

            const presaleExpectedPriceEpsilon = this.configService.getOrThrow<number>('APP_PRESALE_EXPECTED_PRICE_EPSILON');
            const expectedAcudosEpsilonAbsolute = paidAmountAcudos.multipliedBy(presaleExpectedPriceEpsilon);
            const expectedAcudosLowerBand = expectedAcudosEpsilonAbsolute.minus(expectedAcudosEpsilonAbsolute);
            const expectedAcudosUpperband = expectedAcudosEpsilonAbsolute.plus(expectedAcudosEpsilonAbsolute);

            if (nftEntity.acudosPrice.lt(expectedAcudosLowerBand) === true && nftEntity.acudosPrice.gt(expectedAcudosUpperband) === true) {
                console.log('Getting NFT from OnDemandMinting', 'not enough funds', expectedAcudosLowerBand, nftEntity.acudosPrice, expectedAcudosUpperband);
                req.logger.info(`Getting NFT from OnDemandMinting not enough funds ${expectedAcudosLowerBand} ${nftEntity.acudosPrice} ${expectedAcudosUpperband}`);
                nftEntity = null;
            }
        }

        if (nftEntity === null) {
            console.log('Getting NFT from OnDemandMinting', 'Nft is null');
            req.logger.info('Getting NFT from OnDemandMinting Nft is null');
            throw new NotFoundException();
        }

        if (nftEntity.hasPrice() === false) {
            console.log('Getting NFT from OnDemandMinting', 'nft does not have price in acudos');
            req.logger.info('Getting NFT from OnDemandMinting nft does not have price in acudos');
            throw new NotFoundException();
        }

        if (nftEntity.isPriceInAcudosValidForMinting() === false) {
            console.log('Getting NFT from OnDemandMinting', 'price not valid for minting');
            req.logger.info('Getting NFT from OnDemandMinting price not valid for minting');
            throw new NotFoundException();
        }

        if (nftEntity.isQueued() === false) {
            console.log('Getting NFT from OnDemandMinting', 'is not queued');
            req.logger.info('Getting NFT from OnDemandMinting is not queued');
            throw new NotFoundException();
        }

        const canBuyNft = await this.kycService.canBuyAnNft(accountEntity, userEntity, nftEntity, req.transaction);
        if (canBuyNft === false) {
            console.log('Getting NFT from OnDemandMinting', 'The user does not meet KYC creteria');
            req.logger.info('Getting NFT from OnDemandMinting The user does not meet KYC creteria');
            throw new NotFoundException();
        }

        const collectionEntity = await this.collectionService.findOne(nftEntity.collectionId, req.transaction);
        if (collectionEntity === null || collectionEntity.isApproved() === false) {
            console.log('Getting NFT from OnDemandMinting', 'wrong collection', nftEntity.collectionId);
            req.logger.info(`Getting NFT from OnDemandMinting wrong collection ${nftEntity.collectionId}`);
            throw new NotFoundException();
        }

        const miningFarmEntity = await this.miningFarmService.findMiningFarmById(collectionEntity.farmId, req.transaction);
        if (miningFarmEntity === null || miningFarmEntity.isApproved() === false) {
            console.log('Getting NFT from OnDemandMinting', 'wrong mining farm', collectionEntity.farmId);
            req.logger.info(`Getting NFT from OnDemandMinting wrong mining farm ${collectionEntity.farmId}`);
            throw new NotFoundException();
        }

        if (nftEntity.expirationDateTimestamp < Date.now()) {
            console.log('Getting NFT from OnDemandMinting', 'expired nft');
            req.logger.info('Getting NFT from OnDemandMinting expired nft');
            throw new NotFoundException();
        }

        return { ...NftEntity.toJson(nftEntity),
            denomId: collectionEntity.denomId,
            data: JSON.stringify({
                expiration_date: nftEntity.expirationDateTimestamp,
                hash_rate_owned: nftEntity.hashingPower,
                artist_name: nftEntity.artistName,
            }) };
    }

    // used by the chain-ibserver
    @Put('trigger-updates')
    @UseInterceptors(TransactionInterceptor)
    @UseGuards(ApiKeyGuard)
    @SkipThrottle()
    @HttpCode(200)
    async updateNftsChainData(
        @Req() req: AppRequest,
        @Body() reqUpdateNftChainData: ReqUpdateNftChainData,
    ): Promise<void> {
        const { nftDtos: nftDataJsons, height } = reqUpdateNftChainData;
        console.log(`Height: ${height} -> nft.controller | ${JSON.stringify(nftDataJsons)}`);

        const bdJunoParsedHeight = await this.graphqlService.fetchLastParsedHeight();

        if (height > bdJunoParsedHeight) {
            throw new Error(`BDJuno not yet on block:  ${height}`);
        }

        // const denomIds = nftDataJsons.map((nftJson) => nftJson.denomId).filter((denomId, index, self) => self.indexOf(denomId) === index);
        const denomIds = Array.from(new Set(nftDataJsons.map((nftJson) => nftJson.denomId)));
        console.log('Filtered denoms', denomIds);

        let chainMarketplaceNftEntities: ChainMarketplaceNftEntity[] = [];
        for (let i = 0; i < denomIds.length; i++) {
            const denomId = denomIds[i];
            let tokenIds = nftDataJsons.filter((nftDataJson) => nftDataJson.denomId === denomId).map((nftDataJson) => nftDataJson.tokenId);
            tokenIds = Array.from(new Set(tokenIds)); // filter unique entries

            const marketplaceNftDtos = await this.graphqlService.fetchMarketplaceNftsByTokenIds(tokenIds, denomId);
            if (marketplaceNftDtos.length !== tokenIds.length) {
                throw new Error(`BDJuno is updated but nft entities are missing. Looking for ${tokenIds.join(', ')} found ${JSON.stringify(marketplaceNftDtos)}`);
            }

            chainMarketplaceNftEntities = chainMarketplaceNftEntities.concat(marketplaceNftDtos);
        }

        // fetch nfts
        const nftFilterEntity = new NftFilterEntity();
        nftFilterEntity.nftIds = chainMarketplaceNftEntities.filter((entity) => validate(entity.uid)).map((entity) => entity.uid);
        const { nftEntities } = await this.nftService.findByFilter(null, nftFilterEntity, req.transaction, req.transaction.LOCK.UPDATE);
        for (let i = 0; i < nftEntities.length; i++) {
            const nftEntity = nftEntities[i];
            const chainMarketplaceNftEntity = chainMarketplaceNftEntities.find((dto) => dto.uid === nftEntity.id);

            // nftEntity.data = chainMarketplaceNftEntity.data;
            nftEntity.name = chainMarketplaceNftEntity.name;
            nftEntity.currentOwner = chainMarketplaceNftEntity.owner;
            nftEntity.uri = chainMarketplaceNftEntity.uri;
            nftEntity.acudosPrice = chainMarketplaceNftEntity.acudosPrice ?? new BigNumber(0);
            nftEntity.tokenId = chainMarketplaceNftEntity.tokenId;
            nftEntity.status = chainMarketplaceNftEntity.burned === true ? NftStatus.REMOVED : NftStatus.MINTED;
            nftEntity.marketplaceNftId = chainMarketplaceNftEntity.hasMarketplaceNftId() === true ? chainMarketplaceNftEntity.marketplaceNftId.toString() : '';

            console.log('updating nft with id: ', nftEntity.id);
            await this.nftService.updateOneWithStatus(nftEntity.id, nftEntity, req.transaction);
        }
    }

    @Post('updatePrice')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @Throttle(4, 1)
    async updatePrice(
        @Req() req: AppRequest,
        @Body() reqUpdateNftCudosPrice: ReqUpdateNftCudosPrice,
    ): Promise<ResUpdateNftCudosPrice> {
        const nftEntity = await this.nftService.updateNftCudosPrice(reqUpdateNftCudosPrice.id, req.transaction);
        return new ResUpdateNftCudosPrice(nftEntity);
    }

    @Get('fetchPresaleAmounts')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @Throttle(4, 1)
    async fetchPresaleAmounts(
        @Req() req: AppRequest,
    ): Promise<ResFetchPresaleAmounts> {
        const { totalPresaleNftCount, presaleMintedNftCount } = await this.nftService.fetchPresaleAmounts(req.transaction);
        return new ResFetchPresaleAmounts(totalPresaleNftCount, presaleMintedNftCount);
    }

    @Put('creditPurchaseTransactions')
    @UseGuards(ApiKeyGuard)
    @SkipThrottle()
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    async creditPurchaseTransactions(
        @Req() req: AppRequest,
        @Body() reqCreditPurchaseTransactionEntities: ReqCreditPurchaseTransactionEntities,
    ): Promise<void> {
        const purcahseTransactionEntities = reqCreditPurchaseTransactionEntities.purchaseTransactionEntitiesJson.map((purchaseTransactionEntityJson) => PurchaseTransactionEntity.fromJson(purchaseTransactionEntityJson));

        await this.nftService.creditPurchaseTransactions(purcahseTransactionEntities, req.transaction);
    }

    @Put('fetchPurchaseTransactions')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @Throttle(4, 1)
    async fetchPurchaseTransactions(
        @Req() req: AppRequest,
        @Body() reqFetchPurchaseTransactionEntities: ReqFetchPurchaseTransactions,
    ): Promise<ResFetchPurchaseTransactions> {
        const purchaseTransactionEntitiesFilterEntity = PurchaseTransactionsFilterEntity.fromJson(reqFetchPurchaseTransactionEntities.purchaseTransactionsFilterJson)
        const unsavedPurchaseTransactionEntities = reqFetchPurchaseTransactionEntities.sessionStoragePurchaseTransactionEntitiesJson.map((purchaseTransactionEntityJson) => PurchaseTransactionEntity.fromJson(purchaseTransactionEntityJson));
        const { purchaseTransactionEntities, total } = await this.nftService.fetchPurchaseTransactions(req.sessionUserEntity.cudosWalletAddress, purchaseTransactionEntitiesFilterEntity, unsavedPurchaseTransactionEntities, req.transaction);

        return new ResFetchPurchaseTransactions(purchaseTransactionEntities, total);
    }
}
