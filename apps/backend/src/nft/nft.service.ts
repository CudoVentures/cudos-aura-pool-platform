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
import { FIFTEEN_MINUTES_IN_MILIS } from '../common/utils';
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
    [Tier.TIER_5, 9983],
    [Tier.TIER_4, 9937],
    [Tier.TIER_3, 9439],
    [Tier.TIER_2, 1912],
    [Tier.TIER_1, 0],
])

const tierPriceMap = new Map<Tier, number>([
    [Tier.TIER_1, 150],
    [Tier.TIER_2, 300],
    [Tier.TIER_3, 1000],
    [Tier.TIER_4, 3000],
    [Tier.TIER_5, 5000],
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
        let whereClause: any = {};
        let orderByClause: any[] = null;

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

        if (nftFilterEntity.hasSearchString() === true) {
            whereClause = [
                whereClause,
                sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), { [Op.like]: `%${nftFilterEntity.searchString.toLowerCase()}%` }),
            ]
        }

        switch (nftFilterEntity.orderBy) {
            case NftOrderBy.PRICE_ASC:
            case NftOrderBy.PRICE_DESC:
                orderByClause = [['price']]
                break;
            case NftOrderBy.TIMESTAMP_ASC:
            case NftOrderBy.TIMESTAMP_DESC:
            default:
                orderByClause = [['createdAt']]
                break;
        }
        if (orderByClause !== null) {
            orderByClause[0].push(nftFilterEntity.orderBy > 0 ? 'ASC' : 'DESC');
        }

        const nftRepos = await this.nftRepo.findAll({
            where: whereClause,
            order: orderByClause,
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
            from = Math.floor(total / countPerPage) * countPerPage;

            if (total % countPerPage === 0) {
                from = Math.max(0, from - countPerPage);
            }
        }
        nftEntities = nftEntities.slice(from, from + nftFilterEntity.count);
        console.log('nftEntities', nftEntities.length, 'total', total, 'from', from, 'count', nftFilterEntity.count)
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
                    return;
                }
                purchaseTransactionEntityToUpdate.status = purchaseTransactionEntity.status;
                await this.creditPurchaseTransaction(purchaseTransactionEntityToUpdate, dbTx);
            } else {
                await this.creditPurchaseTransaction(purchaseTransactionEntity, dbTx);
            }
        }
    }

    async fetchPurchaseTransactions(cudosAddress: string, purchaseTransactionFIlterModel: PurchaseTransactionsFilterEntity, unsavedPurchaseTransactionEntities: PurchaseTransactionEntity[], dbTx: Transaction): Promise < {purchaseTransactionEntities: PurchaseTransactionEntity[], total: number} > {
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
        const countPerPage = purchaseTransactionFIlterModel.count;
        let from = purchaseTransactionFIlterModel.from;

        if (from > total) {
            from = Math.floor(total / countPerPage) * countPerPage;

            if (total % countPerPage === 0) {
                from = Math.max(0, from - countPerPage);
            }
        }
        return {
            purchaseTransactionEntities: sortedPurchaseTransactionEntities.slice(from, from + purchaseTransactionFIlterModel.count),
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
