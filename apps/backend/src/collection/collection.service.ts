import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CollectionRepo, CollectionRepoColumn } from './repos/collection.repo';
import { CollectionStatus } from './utils';
import { NftOrderBy, NftStatus } from '../nft/nft.types';
import CollectionFilterModel from './entities/collection-filter.entity';
import sequelize, { LOCK, Op, Transaction } from 'sequelize';
import { GraphqlService } from '../graphql/graphql.service';
import { checkValidNftDenomId } from 'cudosjs';
import { CollectionDenomExistsError, CollectionWrongDenomError } from '../common/errors/errors';
import { CollectionEntity } from './entities/collection.entity';
import { CollectionDetailsEntity } from './entities/collection-details.entity';
import { CollectionOrderBy } from './collection.types';
import AccountService from '../account/account.service';
import { StatisticsService } from '../statistics/statistics.service';
import NftEventFilterEntity from '../statistics/entities/nft-event-filter.entity';
import { NftTransferHistoryEventType } from '../statistics/entities/nft-event.entity';
import { NFTService } from '../nft/nft.service';
import NftFilterEntity from '../nft/entities/nft-filter.entity';
import CryptoCompareService from '../crypto-compare/crypto-compare.service';

@Injectable()
export class CollectionService {
    constructor(
    @InjectModel(CollectionRepo)
    private collectionRepo: typeof CollectionRepo,
    @Inject(forwardRef(() => NFTService))
    private nftService: NFTService,
    private graphqlService: GraphqlService,
    private accountService: AccountService,
    @Inject(forwardRef(() => StatisticsService))
    private statisticsService: StatisticsService,
    private cryptoCompareService: CryptoCompareService,
    ) {}

    // controller functions
    async findByFilter(collectionFitlerEntity: CollectionFilterModel, dbTx: Transaction, dbLock: LOCK = undefined): Promise < { collectionEntities: CollectionEntity[], total: number } > {
        let whereClause: any = {};
        let orderByClause: any[] = null;

        if (collectionFitlerEntity.hasCollectionIds() === true) {
            whereClause.id = collectionFitlerEntity.collectionIds;
        }

        if (collectionFitlerEntity.hasCollectionStatus() === true) {
            whereClause.status = {
                [Op.in]: collectionFitlerEntity.getCollectionStatus(),
            };
        }

        if (collectionFitlerEntity.hasFarmId() === true) {
            whereClause.farm_id = collectionFitlerEntity.farmId;
        }

        if (collectionFitlerEntity.hasTimestampFrom() === true) {
            whereClause.createdAt = { [Op.gte]: new Date(collectionFitlerEntity.timestampFrom).toISOString() }
        }

        if (collectionFitlerEntity.hasTimestampTo() === true) {
            if (whereClause.createdAt === undefined) {
                whereClause.createdAt = {};
            }
            whereClause.createdAt[Op.lte] = new Date(collectionFitlerEntity.timestampTo).toISOString();
        }

        if (collectionFitlerEntity.hasSearchString() === true) {
            whereClause = [
                whereClause,
                sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), { [Op.like]: `%${collectionFitlerEntity.searchString.toLowerCase()}%` }),
            ]
        }

        switch (collectionFitlerEntity.orderBy) {
            case CollectionOrderBy.TIMESTAMP_ASC:
            case CollectionOrderBy.TIMESTAMP_DESC:
            default:
                orderByClause = [['createdAt']]
                break;
        }
        if (orderByClause !== null) {
            orderByClause[0].push(collectionFitlerEntity.orderBy > 0 ? 'ASC' : 'DESC');
        }

        const collectionRepos = await this.collectionRepo.findAll({
            where: whereClause,
            order: orderByClause,
            transaction: dbTx,
            lock: dbLock,
        });

        let collectionEntities = collectionRepos.map((collectionRepo) => CollectionEntity.fromRepo(collectionRepo));

        const total = collectionEntities.length;
        collectionEntities = collectionEntities.slice(collectionFitlerEntity.from, collectionFitlerEntity.from + collectionFitlerEntity.count);

        return {
            collectionEntities,
            total,
        };
    }

    async findTopCollections(timestampFrom: number, timestampTo: number, dbTx: Transaction): Promise < CollectionEntity[] > {
        const turnoversMap = new Map < string, number >();
        const nftEventFilterEntity = new NftEventFilterEntity();
        nftEventFilterEntity.timestampFrom = timestampFrom;
        nftEventFilterEntity.timestampTo = timestampTo;
        nftEventFilterEntity.eventTypes = [NftTransferHistoryEventType.MINT, NftTransferHistoryEventType.SALE];

        const { nftEventEntities } = await this.statisticsService.fetchNftEventsByFilter(null, nftEventFilterEntity, dbTx);
        const denomIds = nftEventEntities.map((nftEventEntity) => nftEventEntity.denomId);
        let collectionEntities = await this.findByDenomIds(denomIds, dbTx);

        console.log(collectionEntities)
        collectionEntities = collectionEntities.filter((collectionEntity) => {
            return collectionEntity.isApproved() === true;
        });

        nftEventEntities.forEach((nftEventEntity) => {
            const value = turnoversMap.get(nftEventEntity.denomId) ?? 0;
            turnoversMap.set(nftEventEntity.denomId, value + 1);
        });

        collectionEntities.sort((a: CollectionEntity, b: CollectionEntity) => {
            const turnoversA = turnoversMap.get(a.denomId) ?? 0;
            const turnoversB = turnoversMap.get(b.denomId) ?? 0;
            return turnoversB - turnoversA;
        });

        return collectionEntities;
    }

    async getDetails(collectionId: number, dbTx: Transaction, dbLock: LOCK = undefined): Promise <CollectionDetailsEntity> {
        const collection = await this.findOne(collectionId, dbTx, dbLock);

        if (!collection) {
            throw new NotFoundException(`Collection with id '${collectionId}' doesn't exist`)
        }

        const nftFilter = new NftFilterEntity();
        nftFilter.collectionIds = [collectionId.toString()];
        nftFilter.nftStatus = [NftStatus.MINTED, NftStatus.QUEUED];
        nftFilter.orderBy = NftOrderBy.PRICE_ASC
        const { nftEntities } = await this.nftService.findByFilter(null, nftFilter, dbTx, dbLock);

        // Get the lowest priced NFT from this collection "floorPriceInAcudos"
        const approvedNfts = nftEntities.filter((nftEntity) => nftEntity.status === NftStatus.QUEUED) // Approved but not bought NFT-s
        const floorPriceInAcudos = await this.cryptoCompareService.getFloorPriceOfNftEntities(approvedNfts);

        // Get the total value spent on NFTs from this collection "volumeInAcudos"
        const collectionTotalSales = await this.graphqlService.fetchCollectionTotalSales([collection.denomId])

        const nftOwnersSet = new Set(nftEntities.filter((nft) => nft.hasOwner()).map((nft) => nft.currentOwner)); // Unique owners of all the NFTs in the collection

        const adminEntity = await this.accountService.findAdminByAccountId(collection.creatorId, dbTx, dbLock);

        // Get remaining hash power
        const nftsHashPowerSum = nftEntities.reduce((pervVal, currVal) => pervVal + Number(currVal.hashingPower), 0)
        const remainingHashPowerInTH = collection.hashingPower - nftsHashPowerSum

        const collectionDetailsEntity = new CollectionDetailsEntity();
        collectionDetailsEntity.id = collectionId;
        collectionDetailsEntity.floorPriceInAcudos = floorPriceInAcudos.toString(10);
        collectionDetailsEntity.volumeInAcudos = collectionTotalSales.salesInAcudos.isNaN() === true ? '0' : collectionTotalSales.salesInAcudos?.toString(10) ?? '0';
        collectionDetailsEntity.owners = nftOwnersSet.size;
        collectionDetailsEntity.cudosAddress = adminEntity?.cudosWalletAddress ?? '';
        collectionDetailsEntity.remainingHashPowerInTH = remainingHashPowerInTH;

        return collectionDetailsEntity;
    }

    // utilities functions
    async findByCollectionIds(collectionIds: number[], dbTx: Transaction, dbLock: LOCK = undefined): Promise < CollectionEntity[] > {
        const collectionRepos = await this.collectionRepo.findAll({
            where: {
                [CollectionRepoColumn.ID]: collectionIds,
            },
            transaction: dbTx,
            lock: dbLock,
        })
        return collectionRepos.map((collectionRepo) => {
            return CollectionEntity.fromRepo(collectionRepo);
        });
    }

    async findByDenomIds(denomIds: string[], dbTx: Transaction, dbLock: LOCK = undefined): Promise < CollectionEntity[] > {
        const collectionRepos = await this.collectionRepo.findAll({
            where: {
                [CollectionRepoColumn.DENOM_ID]: denomIds,
            },
            transaction: dbTx,
            lock: dbLock,
        })

        return collectionRepos.map((collectionRepo) => {
            return CollectionEntity.fromRepo(collectionRepo);
        });
    }

    async findIdsByStatus(status: CollectionStatus[], dbTx: Transaction, dbLock: LOCK = undefined): Promise < number[] > {
        const collections = await this.collectionRepo.findAll({
            where: {
                status: {
                    [Op.in]: status,
                },
            },
            transaction: dbTx,
            lock: dbLock,
        })

        return collections.map((collection) => {
            return collection.id;
        })
    }

    async findOne(id: number, dbTx: Transaction, dbLock: LOCK = undefined): Promise<CollectionEntity> {
        const collectionRepo = await this.collectionRepo.findByPk(id, {
            transaction: dbTx,
            lock: dbLock,
        });

        return CollectionEntity.fromRepo(collectionRepo);
    }

    async findFirstByDenomId(denomId: string, dbTx: Transaction, dbLock: LOCK = undefined): Promise<CollectionEntity> {
        const collectionRepo = await this.collectionRepo.findOne({
            where: {
                [CollectionRepoColumn.DENOM_ID]: denomId,
            },
            transaction: dbTx,
            lock: dbLock,
        });

        return CollectionEntity.fromRepo(collectionRepo);
    }

    async findByFarmId(id: number, dbTx: Transaction, dbLock: LOCK = undefined): Promise<CollectionEntity[]> {
        const collectionRepos = await this.collectionRepo.findAll({
            where: {
                [CollectionRepoColumn.FARM_ID]: id,
            },
            transaction: dbTx,
            lock: dbLock,
        });

        return collectionRepos.map((collectionRepo) => CollectionEntity.fromRepo(collectionRepo));
    }

    async findByMiningFarmIds(miningFarmIds: number[], dbTx: Transaction, dbLock: LOCK = undefined): Promise < CollectionEntity[] > {
        const collectionRepos = await this.collectionRepo.findAll({
            where: {
                [CollectionRepoColumn.FARM_ID]: miningFarmIds,
            },
            transaction: dbTx,
            lock: dbLock,
        })

        return collectionRepos.map((collectionRepo) => {
            return CollectionEntity.fromRepo(collectionRepo);
        });
    }

    async createOne(collectionEntity: CollectionEntity, dbTx: Transaction): Promise<CollectionEntity> {
        try {
            checkValidNftDenomId(collectionEntity.denomId);
        } catch (e) {
            throw new CollectionWrongDenomError();
        }

        const chainCollections = await this.graphqlService.fetchNftCollectionsByDenomIds([collectionEntity.denomId]);
        if (chainCollections.length > 0) {
            throw new CollectionDenomExistsError();
        }

        collectionEntity.markAsQueued();
        const collectionRepo = CollectionEntity.toRepo(collectionEntity);
        const collection = await this.collectionRepo.create(collectionRepo.toJSON(), {
            transaction: dbTx,
        });
        return CollectionEntity.fromRepo(collection);

    }

    async updateOne(id: number, collectionEntity: CollectionEntity, dbTx: Transaction): Promise<CollectionEntity> {
        try {
            checkValidNftDenomId(collectionEntity.denomId);
        } catch (e) {
            throw new CollectionWrongDenomError();
        }

        const [count, [collection]] = await this.collectionRepo.update(CollectionEntity.toRepo(collectionEntity).toJSON(), {
            where: { id },
            returning: true,
            transaction: dbTx,
        });

        return CollectionEntity.fromRepo(collection);
    }

    async updateOneByIdAndDenomId(denomId: string, collectionEntity: CollectionEntity, dbTx: Transaction): Promise < CollectionEntity > {
        const [count, [collectionRepo]] = await this.collectionRepo.update(CollectionEntity.toRepo(collectionEntity).toJSON(), {
            where: {
                [CollectionRepoColumn.ID]: collectionEntity.id,
                [CollectionRepoColumn.DENOM_ID]: denomId,
            },
            returning: true,
            transaction: dbTx,
        });

        return CollectionEntity.fromRepo(collectionRepo);
    }

}
