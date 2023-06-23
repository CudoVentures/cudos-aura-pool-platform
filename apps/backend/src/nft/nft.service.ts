import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import sequelize, { LOCK, Op, Transaction } from 'sequelize';
import { v4 as uuid } from 'uuid';
import { CollectionService } from '../collection/collection.service';
import { VisitorService } from '../visitor/visitor.service';
import { NftRepo, NftRepoColumn } from './repos/nft.repo';
import { NftGroup, NftOrderBy, NftStatus } from './nft.types';
import NftEntity from './entities/nft.entity';
import NftFilterEntity from './entities/nft-filter.entity';
import UserEntity from '../account/entities/user.entity';
import AppRepo from '../common/repo/app.repo';
import CryptoCompareService from '../crypto-compare/crypto-compare.service';
import BigNumber from 'bignumber.js';
import { CURRENCY_DECIMALS } from 'cudosjs';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import { FIFTEEN_MINUTES_IN_MILIS, NOT_EXISTS_INT } from '../common/utils';
import PurchaseTransactionEntity from './entities/purchase-transaction-entity';
import { PurchaseTransactionRepo, PurchaseTransactionsRepoColumn } from './repos/purchase-transaction.repo';
import PurchaseTransactionsFilterEntity from './entities/purchase-transaction-filter-entity';

enum Tier {
    TIER_1 = 1, // cheapest
    TIER_2 = 2,
    TIER_3 = 3,
    TIER_4 = 4,
    TIER_5 = 5 // most expensive
}

const tierBorderMap = new Map<Tier, number>([
    [Tier.TIER_5, 9988],
    [Tier.TIER_4, 9939],
    [Tier.TIER_3, 9438],
    [Tier.TIER_2, 1911],
    [Tier.TIER_1, 0],
])

const tierPriceMap = new Map<Tier, number>([
    [Tier.TIER_1, 165],
    [Tier.TIER_2, 330],
    [Tier.TIER_3, 1100],
    [Tier.TIER_4, 3300],
    [Tier.TIER_5, 5500],
])

@Injectable()
export class NFTService {
    constructor(
        @InjectModel(NftRepo)
        private nftRepo: typeof NftRepo,
        @InjectModel(PurchaseTransactionRepo)
        private purchaseTransactionRepo: typeof PurchaseTransactionRepo,
        @Inject(forwardRef(() => CollectionService))
        private collectionService: CollectionService,
        private visitorService: VisitorService,
        private cryptoCompareService: CryptoCompareService,
        private configService: ConfigService,
    ) {}

    // controller functions
    async findByFilter(userEntity: UserEntity, nftFilterEntity: NftFilterEntity, dbTx: Transaction, dbLock: LOCK = undefined): Promise < { nftEntities: NftEntity[], total: number } > {
        let cudosPriceInUsd = NOT_EXISTS_INT;
        let whereClause: any = {};
        let orderByClause: any[] = null;
        let attributesClause: any = null;

        if (nftFilterEntity.hasNftIds() === true) {
            whereClause.id = nftFilterEntity.nftIds;
        }

        if (nftFilterEntity.hasCollectionStatus() === true) {
            whereClause.collection_id = await this.collectionService.findIdsByStatus(nftFilterEntity.getCollectionStatus(), dbTx);
        }

        if (nftFilterEntity.hasNftStatus() === true) {
            whereClause.status = nftFilterEntity.nftStatus;
        }

        if (nftFilterEntity.hasNftGroup() === true) {
            whereClause.group = nftFilterEntity.nftGroup;
        }

        if (nftFilterEntity.hasCollectionIds() === true) {
            if (whereClause.collection_id === undefined) {
                whereClause.collection_id = nftFilterEntity.collectionIds;
            } else {
                const set = new Set(whereClause.collection_id);
                whereClause.collection_id = nftFilterEntity.collectionIds.filter((colId) => {
                    return set.has(colId);
                });
            }
        }

        if (nftFilterEntity.inOnlyForSessionAccount() === true) {
            // if this function was called without user but with SessionAccount filter then then current_owner to some imaginary value in order to make an emtpy result
            whereClause.current_owner = userEntity?.cudosWalletAddress ?? '0x';
        }

        if (nftFilterEntity.hasHashRateMin() === true || nftFilterEntity.hasHashRateMax() === true) {
            whereClause[NftRepoColumn.HASHING_POWER] = {
                [Op.gte]: nftFilterEntity.hashRateMin,
                [Op.lte]: nftFilterEntity.hashRateMax,
            }
        }

        if (nftFilterEntity.hasExpiryMin() === true) {
            whereClause[NftRepoColumn.EXPIRATION_DATE] = {
                [Op.gte]: (new Date(nftFilterEntity.expiryMin)).toISOString(),
            }
        }

        if (nftFilterEntity.hasExpiryMax() === true) {
            if (whereClause[NftRepoColumn.EXPIRATION_DATE] === undefined) {
                whereClause[NftRepoColumn.EXPIRATION_DATE] = {}
            }
            whereClause[NftRepoColumn.EXPIRATION_DATE][Op.lte] = (new Date(nftFilterEntity.expiryMax)).toISOString();
        }

        if (nftFilterEntity.hasPriceMin() === true || nftFilterEntity.hasPriceMax() === true) {
            const cudosDataEntity = await this.cryptoCompareService.getCachedCudosData();
            if (cudosDataEntity != null) {
                let priceCudosMin: BigNumber, priceCudosMax: BigNumber, priceUsdMin: BigNumber, priceUsdMax: BigNumber;
                cudosPriceInUsd = cudosDataEntity.cudosUsdPrice;

                if (nftFilterEntity.isPriceFilterTypeCudos() === true) {
                    priceCudosMin = nftFilterEntity.priceMin;
                    priceCudosMax = nftFilterEntity.priceMax;
                    priceUsdMin = priceCudosMin.multipliedBy(new BigNumber(cudosPriceInUsd));
                    priceUsdMax = priceCudosMax.multipliedBy(new BigNumber(cudosPriceInUsd));
                } else {
                    priceUsdMin = nftFilterEntity.priceMin;
                    priceUsdMax = nftFilterEntity.priceMax;
                    priceCudosMin = priceUsdMin.dividedBy(new BigNumber(cudosPriceInUsd));
                    priceCudosMax = priceUsdMax.dividedBy(new BigNumber(cudosPriceInUsd));
                }

                whereClause[Op.or] = [
                    {
                        [NftRepoColumn.TOKEN_ID]: {
                            [Op.ne]: '',
                        },
                        [NftRepoColumn.PRICE]: {
                            [Op.gte]: priceCudosMin.toFixed(0),
                            [Op.lte]: priceCudosMax.toFixed(0),
                        },
                    },
                    {
                        [NftRepoColumn.TOKEN_ID]: '',
                        [NftRepoColumn.PRICE_USD]: {
                            [Op.gte]: priceUsdMin.toFixed(0),
                            [Op.lte]: priceUsdMax.toFixed(0),
                        },
                    },
                ];
            }
        }

        if (nftFilterEntity.hasSearchString() === true) {
            whereClause = [
                whereClause,
                sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), { [Op.like]: `%${nftFilterEntity.searchString.toLowerCase()}%` }),
            ]
        }

        switch (nftFilterEntity.orderBy) {
            case NftOrderBy.PRICE_ASC:
            case NftOrderBy.PRICE_DESC:
                if (cudosPriceInUsd === NOT_EXISTS_INT) {
                    const cudosDataEntity = await this.cryptoCompareService.getCachedCudosData();
                    if (cudosDataEntity !== null) {
                        cudosPriceInUsd = cudosDataEntity.cudosUsdPrice;
                    }
                }
                if (cudosPriceInUsd !== NOT_EXISTS_INT) {
                    attributesClause = {
                        include: [
                            [sequelize.literal(`(CASE WHEN ${NftRepoColumn.TOKEN_ID} = '' THEN (${NftRepoColumn.PRICE_USD} / ${cudosPriceInUsd}) ELSE (${NftRepoColumn.PRICE} / ${new BigNumber(1).shiftedBy(CURRENCY_DECIMALS).toString()}) END)`), 'accumulated_price'],
                        ],
                    }
                    orderByClause = [['accumulated_price']]
                } else {
                    orderByClause = [[NftRepoColumn.PRICE]]
                }
                break;
            case NftOrderBy.TIMESTAMP_ASC:
            case NftOrderBy.TIMESTAMP_DESC:
                orderByClause = [['createdAt']]
                break;
            case NftOrderBy.HASH_RATE_ASC:
            case NftOrderBy.HASH_RATE_DESC:
                orderByClause = [[NftRepoColumn.HASHING_POWER]]
                break;
            case NftOrderBy.EXPIRY_ASC:
            case NftOrderBy.EXPIRY_DESC:
            default:
                orderByClause = [[NftRepoColumn.EXPIRATION_DATE]]
                break;
        }

        if (orderByClause !== null) {
            orderByClause[0].push(nftFilterEntity.orderBy > 0 ? 'ASC' : 'DESC');
        }

        const nftRepos = await this.nftRepo.findAll({
            where: whereClause,
            order: orderByClause,
            attributes: attributesClause,
            transaction: dbTx,
            lock: dbLock,
        });

        let nftEntities = nftRepos.map((nftRepo) => NftEntity.fromRepo(nftRepo));
        if (nftFilterEntity.isSortByTrending() === true) {
            const nftIds = nftEntities.map((nftEntity) => {
                return nftEntity.id.toString();
            });
            const sortDirection = Math.floor(Math.abs(nftFilterEntity.orderBy) / nftFilterEntity.orderBy);
            const visitorMap = await this.visitorService.fetchNftsVisitsCountAsMap(nftIds, dbTx, dbLock);
            nftEntities.sort((a: NftEntity, b: NftEntity) => {
                const visitsA = visitorMap.get(a.id.toString()) ?? 0;
                const visitsB = visitorMap.get(b.id.toString()) ?? 0;
                return sortDirection * (visitsA - visitsB);
            });
        }

        const total = nftEntities.length;
        const countPerPage = nftFilterEntity.count;
        let from = nftFilterEntity.from;
        if (from >= total) {
            from = Math.max(0, countPerPage * Math.floor((total - 1) / countPerPage));
        }

        nftEntities = nftEntities.slice(from, from + nftFilterEntity.count);
        return {
            nftEntities,
            total,
        };

    }

    async getRandomPresaleNft(paidAmountAcudos: BigNumber, dbTx: Transaction, dbLock: LOCK = undefined): Promise <NftEntity> {
        // check if paid price is within epsilon of expected
        const { cudosUsdPrice } = await this.cryptoCompareService.getCachedCudosData();
        const paidAmountCudos = paidAmountAcudos.shiftedBy(-CURRENCY_DECIMALS);
        const paidAmountUsd = paidAmountCudos.multipliedBy(cudosUsdPrice);

        const expectedUsd = Number(this.configService.get<string>('APP_PRESALE_PRICE_USD'));
        const presaleExpectedPriceEpsilon = this.configService.get<number>('APP_PRESALE_EXPECTED_PRICE_EPSILON');
        const expectedUsdEpsilonAbsolute = expectedUsd * presaleExpectedPriceEpsilon;

        if (paidAmountUsd.lt(expectedUsd - expectedUsdEpsilonAbsolute) || paidAmountUsd.gt(expectedUsd + expectedUsdEpsilonAbsolute)) {
            return null;
        }

        const collectionId = parseInt(this.configService.get<string>('APP_PRESALE_COLLECTION_ID'));
        // get a tier by random, if a tier is finished - add it to the closes lower tier
        const randomNumber = randomInt(1, 10001);

        let tier = Tier.TIER_1;
        if (randomNumber > tierBorderMap.get(Tier.TIER_5)) {
            tier = Tier.TIER_5;
        } else if (randomNumber > tierBorderMap.get(Tier.TIER_4)) {
            tier = Tier.TIER_4;
        } else if (randomNumber > tierBorderMap.get(Tier.TIER_3)) {
            tier = Tier.TIER_3;
        } else if (randomNumber > tierBorderMap.get(Tier.TIER_2)) {
            tier = Tier.TIER_2;
        }

        const tierArray = [];
        for (let i = tier; i >= Tier.TIER_1; i--) {
            tierArray.push(i);
        }
        for (let i = tier + 1; i <= Tier.TIER_5; i++) {
            tierArray.push(i);
        }

        for (let i = 0; i < tierArray.length; i++) {
            const tierToQuery = tierArray[i];
            // get tier price range
            const priceUsd = tierPriceMap.get(tierToQuery);

            // get nft in price by random
            const nftTierEntities = await this.findAllPresaleByCollectionAndPriceUsd(collectionId, priceUsd, dbTx, dbLock);
            if (nftTierEntities.length > 0) {
                const nftIndex = randomInt(0, nftTierEntities.length);

                return nftTierEntities[nftIndex];
            }
        }

        return null;
    }

    async updatePremintNftPrice(nftEntity: NftEntity, paidAmountAcudos: BigNumber, dbTx: Transaction): Promise <NftEntity> {
        nftEntity.acudosPrice = paidAmountAcudos;

        nftEntity.priceAcudosValidUntil = Date.now() + FIFTEEN_MINUTES_IN_MILIS;

        await this.updateOne(nftEntity.id, nftEntity, dbTx);

        return nftEntity;
    }

    async updateOneWithStatus(id: string, nftEntity: NftEntity, dbTx: Transaction): Promise < NftEntity > {
        const [count, [nftRepo]] = await this.nftRepo.update(NftEntity.toRepo(nftEntity).toJSON(), {
            where: { id },
            returning: true,
            transaction: dbTx,
        });

        return NftEntity.fromRepo(nftRepo);
    }

    async updateNftCudosPrice(id: string, dbTx: Transaction): Promise < NftEntity> {
        const nftEntity = await this.findOne(id, dbTx, dbTx.LOCK.UPDATE);
        if (nftEntity === null) {
            throw new NotFoundException();
        }

        if (nftEntity.isMinted()) {
            throw new NotFoundException();
        }

        const { cudosUsdPrice } = await this.cryptoCompareService.getCachedCudosData();
        const cudosPrice = (new BigNumber(nftEntity.priceUsd)).dividedBy(cudosUsdPrice);
        const acudosPrice = cudosPrice.shiftedBy(CURRENCY_DECIMALS)

        nftEntity.acudosPrice = new BigNumber(acudosPrice.toFixed(0));

        nftEntity.priceAcudosValidUntil = Date.now() + FIFTEEN_MINUTES_IN_MILIS;

        return this.updateOne(id, nftEntity, dbTx);
    }

    async fetchPresaleAmounts(dbTx: Transaction): Promise < {totalPresaleNftCount: number, presaleMintedNftCount: number} > {
        const collectionId = this.configService.get<string>('APP_PRESALE_COLLECTION_ID');

        const nftFilter = new NftFilterEntity();
        nftFilter.collectionIds = [collectionId]
        nftFilter.nftGroup = [NftGroup.PRESALE]

        const { nftEntities } = await this.findByFilter(null, nftFilter, dbTx);
        const totalPresaleNftCount = nftEntities.length;
        const presaleMintedNftCount = nftEntities.filter((nftEntity: NftEntity) => nftEntity.isMinted() === true).length;

        return { totalPresaleNftCount, presaleMintedNftCount }
    }

    async creditPurchaseTransactions(purchaseTransactionEntities: PurchaseTransactionEntity[], dbTx: Transaction): Promise < void > {
        const txHashes = purchaseTransactionEntities.map((purchaseTransactionEntity) => purchaseTransactionEntity.txhash);
        const purchaseTransactionEntitiesToUpdate = await this.fetchPurchasesTransactionsByTxHashes(txHashes, dbTx, dbTx.LOCK.UPDATE);
        const purchaseTransactionEntitiesToUpdateMap = new Map < string, PurchaseTransactionEntity >();
        purchaseTransactionEntitiesToUpdate.forEach((purchaseTransactionEntityToUpdate) => {
            purchaseTransactionEntitiesToUpdateMap.set(purchaseTransactionEntityToUpdate.txhash, purchaseTransactionEntityToUpdate);
        });

        for (let i = purchaseTransactionEntities.length; i-- > 0;) {
            const purchaseTransactionEntity = purchaseTransactionEntities[i];
            const purchaseTransactionEntityToUpdate = purchaseTransactionEntitiesToUpdateMap.get(purchaseTransactionEntity.txhash);

            if (purchaseTransactionEntityToUpdate !== undefined) {
                if (purchaseTransactionEntityToUpdate.isPending() === false) {
                    continue;
                }
                purchaseTransactionEntityToUpdate.status = purchaseTransactionEntity.status;
                await this.creditPurchaseTransaction(purchaseTransactionEntityToUpdate, dbTx);
            } else {
                await this.creditPurchaseTransaction(purchaseTransactionEntity, dbTx);
            }
        }
    }

    async fetchPurchaseTransactions(cudosAddress: string, purchaseTransactionFilterModel: PurchaseTransactionsFilterEntity, unsavedPurchaseTransactionEntities: PurchaseTransactionEntity[], dbTx: Transaction): Promise < {purchaseTransactionEntities: PurchaseTransactionEntity[], total: number} > {
        const totalPurchaseTransactionEntities = await this.fetchPurchasesTransactionsByRecipientAddress(cudosAddress, dbTx);
        const savedTransactionsMap = new Map < string, PurchaseTransactionEntity >();
        totalPurchaseTransactionEntities.forEach((purchaseTransactionEntity) => {
            savedTransactionsMap.set(purchaseTransactionEntity.txhash, purchaseTransactionEntity);
        });

        unsavedPurchaseTransactionEntities.forEach((purchaseTransactionEntity) => {
            if (savedTransactionsMap.has(purchaseTransactionEntity.txhash) === false) {
                totalPurchaseTransactionEntities.push(purchaseTransactionEntity);
            }
        });

        const sortedPurchaseTransactionEntities = totalPurchaseTransactionEntities.sort((a, b) => {
            return b.timestamp - a.timestamp;
        });

        const total = sortedPurchaseTransactionEntities.length
        const countPerPage = purchaseTransactionFilterModel.count;
        let from = purchaseTransactionFilterModel.from;
        if (from >= total) {
            from = Math.max(0, countPerPage * Math.floor((total - 1) / countPerPage));
        }

        return {
            purchaseTransactionEntities: sortedPurchaseTransactionEntities.slice(from, from + purchaseTransactionFilterModel.count),
            total,
        }
    }

    // utilty functions
    async findActiveByCurrentOwner(cudosWalletAddress: string, dbTx: Transaction, dbLock: LOCK = undefined): Promise < NftEntity[] > {
        const nftRepos = await this.nftRepo.findAll({
            where: {
                [NftRepoColumn.CURRENT_OWNER]: cudosWalletAddress,
                [NftRepoColumn.STATUS]: NftStatus.MINTED,
                [NftRepoColumn.EXPIRATION_DATE]: {
                    [Op.gt]: new Date(),
                },
            },
            transaction: dbTx,
            lock: dbLock,
        });

        return nftRepos.map((nftRepo) => {
            return NftEntity.fromRepo(nftRepo);
        });
    }

    async findAllPresaleByCollectionAndPriceUsd(collecionId: number, priceUsd: number, dbTx: Transaction, dbLock: LOCK = undefined) {
        const whereClause = {
            [NftRepoColumn.COLLECTION_ID]: collecionId,
            [NftRepoColumn.PRICE_USD]: priceUsd,
            [NftRepoColumn.TOKEN_ID]: '',
            [NftRepoColumn.PRICE_VALID_UNTIL]: {
                [Op.lt]: Date.now(),
            },
            [NftRepoColumn.GROUP]: NftGroup.PRESALE,
        };

        const nftRepos = await this.nftRepo.findAll({
            where: whereClause,
            transaction: dbTx,
            lock: dbLock,
        });

        return nftRepos.map((nftRepo) => {
            return NftEntity.fromRepo(nftRepo);
        });
    }

    async findByCollectionIds(collectionIds: number[], dbTx: Transaction, dbLock: LOCK = undefined): Promise < NftEntity[] > {
        const nftRepos = await this.nftRepo.findAll({
            where: {
                [NftRepoColumn.COLLECTION_ID]: collectionIds,
            },
            transaction: dbTx,
            lock: dbLock,
        });

        return nftRepos.map((nftRepo) => {
            return NftEntity.fromRepo(nftRepo);
        });
    }

    async findByCollectionIdsAndTokenIds(collectionIds: number[], tokenIds: string[], dbTx: Transaction, dbLock: LOCK = undefined): Promise < NftEntity[] > {
        const nftRepos = await this.nftRepo.findAll({
            where: {
                [NftRepoColumn.COLLECTION_ID]: collectionIds,
                [NftRepoColumn.TOKEN_ID]: tokenIds,
            },
            transaction: dbTx,
            lock: dbLock,
        });

        return nftRepos.map((nftRepo) => {
            return NftEntity.fromRepo(nftRepo);
        });
    }

    async findOne(id: string, dbTx: Transaction, dbLock: LOCK = undefined): Promise < NftEntity > {
        const nftRepo = await this.nftRepo.findByPk(id, {
            transaction: dbTx,
            lock: dbLock,
        });

        if (!nftRepo) {
            throw new NotFoundException();
        }

        return NftEntity.fromRepo(nftRepo);
    }

    async createOne(nftEntity: NftEntity, dbTx: Transaction): Promise < NftEntity > {
        nftEntity.currentOwner = '';
        nftEntity.markAsQueued();

        const repo = NftEntity.toRepo(nftEntity);
        repo.id = uuid();
        const nftRepo = await this.nftRepo.create(repo.toJSON(), {
            transaction: dbTx,
        });

        return NftEntity.fromRepo(nftRepo);
    }

    async updateOne(id: string, nftEntity: NftEntity, dbTx: Transaction): Promise < NftEntity > {
        nftEntity.markAsQueued();
        const [count, [nftRepo]] = await this.nftRepo.update(NftEntity.toRepo(nftEntity).toJSON(), {
            where: { id },
            returning: true,
            transaction: dbTx,
        });

        return NftEntity.fromRepo(nftRepo);
    }

    async deleteMany(nftEntities: NftEntity[], dbTx: Transaction): Promise <void> {
        await this.nftRepo.destroy({
            where: {
                [NftRepoColumn.ID]: nftEntities.map((nftEntity) => nftEntity.id),
            },
            transaction: dbTx,
        });
    }

    async fetchPurchasesTransactionsByTxHashes(txHashes: string[], dbTx: Transaction, dbLock: LOCK = undefined): Promise < PurchaseTransactionEntity[] > {
        const purchaseTransactionRepos = await this.purchaseTransactionRepo.findAll({
            where: {
                [PurchaseTransactionsRepoColumn.TX_HASH]: txHashes,
            },
            transaction: dbTx,
            lock: dbLock,
        });

        return purchaseTransactionRepos.map((purchaseTransactionRepo) => {
            return PurchaseTransactionEntity.fromRepo(purchaseTransactionRepo);
        });
    }

    async fetchPurchasesTransactionsByRecipientAddress(recipientAddress: string, dbTx: Transaction, dbLock: LOCK = undefined): Promise < PurchaseTransactionEntity[] > {
        const purchaseTransactionRepos = await this.purchaseTransactionRepo.findAll({
            where: {
                [PurchaseTransactionsRepoColumn.RECIPIENT_ADDRESS]: recipientAddress,
            },
            transaction: dbTx,
            lock: dbLock,
        });

        return purchaseTransactionRepos.map((purchaseTransactionRepo) => {
            return PurchaseTransactionEntity.fromRepo(purchaseTransactionRepo);
        });
    }

    async creditPurchaseTransaction(purchaseTransactionEntity: PurchaseTransactionEntity, dbTx: Transaction): Promise < PurchaseTransactionEntity > {
        let purchaseTransactionRepo = PurchaseTransactionEntity.toRepo(purchaseTransactionEntity);
        const exists = await this.purchaseTransactionRepo.findByPk(purchaseTransactionEntity.txhash) !== null;
        if (exists === false) {
            purchaseTransactionRepo = await this.purchaseTransactionRepo.create(purchaseTransactionRepo.toJSON(), {
                returning: true,
                transaction: dbTx,
            })
        } else {
            const wherePurchaseTransactionRepo = new PurchaseTransactionRepo();
            wherePurchaseTransactionRepo.txHash = purchaseTransactionEntity.txhash;
            const sqlResult = await this.purchaseTransactionRepo.update(purchaseTransactionRepo.toJSON(), {
                where: AppRepo.toJsonWhere(wherePurchaseTransactionRepo),
                returning: true,
                transaction: dbTx,
            })
            purchaseTransactionRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;
        }

        return PurchaseTransactionEntity.fromRepo(purchaseTransactionRepo);
    }

}
