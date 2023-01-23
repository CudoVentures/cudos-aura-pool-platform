import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CollectionRepo, CollectionRepoColumn } from './repos/collection.repo';
import { CollectionStatus } from './utils';
import { NftOrderBy, NftStatus } from '../nft/nft.types';
import CollectionFilterModel from './entities/collection-filter.entity';
import sequelize, { LOCK, Op, Transaction } from 'sequelize';
import { GraphqlService } from '../graphql/graphql.service';
import ChainMarketplaceCollectionEntity from './entities/chain-marketplace-collection.entity';
import ChainNftCollectionEntity from './entities/chain-nft-collection.entity';
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
import BigNumber from 'bignumber.js';

@Injectable()
export class CollectionService {
    constructor(
    @InjectModel(CollectionRepo)
    private collectionModel: typeof CollectionRepo,
    @Inject(forwardRef(() => NFTService))
    private nftService: NFTService,
    private graphqlService: GraphqlService,
    private accountService: AccountService,
    @Inject(forwardRef(() => StatisticsService))
    private statisticsService: StatisticsService,
    // eslint-disable-next-line no-empty-function
    ) {}

    async findByFilter(collectionFitlerEntity: CollectionFilterModel): Promise < { collectionEntities: CollectionEntity[], total: number } > {
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

        const collectionRepos = await this.collectionModel.findAll({
            where: whereClause,
            order: orderByClause,
        });

        let collectionEntities = collectionRepos.map((collectionRepo) => CollectionEntity.fromRepo(collectionRepo));

        const total = collectionEntities.length;
        collectionEntities = collectionEntities.slice(collectionFitlerEntity.from, collectionFitlerEntity.from + collectionFitlerEntity.count);

        return {
            collectionEntities,
            total,
        };
    }

    async findTopCollections(timestampFrom: number, timestampTo: number): Promise < CollectionEntity[] > {
        const turnoversMap = new Map < string, number >();
        const nftEventFilterEntity = new NftEventFilterEntity();
        nftEventFilterEntity.timestampFrom = timestampFrom;
        nftEventFilterEntity.timestampTo = timestampTo;
        nftEventFilterEntity.eventTypes = [NftTransferHistoryEventType.MINT, NftTransferHistoryEventType.SALE];

        const { nftEventEntities } = await this.statisticsService.fetchNftEventsByFilter(null, nftEventFilterEntity);
        const denomIds = nftEventEntities.map((nftEventEntity) => nftEventEntity.denomId);
        const collectionEntities = await this.findByDenomIds(denomIds);

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

    async findByCollectionIds(collectionIds: number[]): Promise < CollectionEntity[] > {
        const collectionRepos = await this.collectionModel.findAll({
            where: {
                [CollectionRepoColumn.ID]: collectionIds,
            },
        })
        return collectionRepos.map((collectionRepo) => {
            return CollectionEntity.fromRepo(collectionRepo);
        });
    }

    async findByDenomIds(denomIds: string[]): Promise < CollectionEntity[] > {
        const collectionRepos = await this.collectionModel.findAll({
            where: {
                [CollectionRepoColumn.DENOM_ID]: denomIds,
            },
        })

        return collectionRepos.map((collectionRepo) => {
            return CollectionEntity.fromRepo(collectionRepo);
        });
    }

    async findIdsByStatus(status: CollectionStatus[]): Promise < number[] > {
        const collections = await this.collectionModel.findAll({
            where: {
                status: {
                    [Op.in]: status,
                },
            },
        })

        return collections.map((collection) => {
            return collection.id;
        })
    }

    async findOne(id: number, tx: Transaction = undefined, lock: LOCK = undefined): Promise<CollectionEntity> {
        const collectionRepo = await this.collectionModel.findByPk(id, {
            transaction: tx,
            lock,
        });

        return CollectionEntity.fromRepo(collectionRepo);
    }

    async findOneByDenomId(denomId: string): Promise<CollectionEntity> {
        const collectionRepo = await this.collectionModel.findOne({
            where: {
                denom_id: denomId,
            },
        });

        return CollectionEntity.fromRepo(collectionRepo);
    }

    async findByFarmId(id: number): Promise<CollectionEntity[]> {
        const collectionRepos = await this.collectionModel.findAll({
            where: {
                farm_id: id,
            },
        });

        return collectionRepos.map((collectionRepo) => CollectionEntity.fromRepo(collectionRepo));
    }

    async findByMiningFarmIds(miningFarmIds: number[]): Promise < CollectionEntity[] > {
        const collectionRepos = await this.collectionModel.findAll({
            where: {
                [CollectionRepoColumn.FARM_ID]: miningFarmIds,
            },
        })

        return collectionRepos.map((collectionRepo) => {
            return CollectionEntity.fromRepo(collectionRepo);
        });
    }

    async createOne(
        collectionEntity: CollectionEntity,
        tx: Transaction = undefined,
    ): Promise<CollectionEntity> {

        collectionEntity.denomId = collectionEntity.name.toLowerCase().replace(/ /g, '');
        try {
            checkValidNftDenomId(collectionEntity.denomId);
        } catch (e) {
            throw new CollectionWrongDenomError();
        }
        const chainCollections = await this.graphqlService.fetchNftCollectionsByDenomIds([collectionEntity.denomId]);
        if (chainCollections.length > 0) {
            throw new CollectionDenomExistsError();
        }

        const collectionRepo = CollectionEntity.toRepo(collectionEntity);
        const collection = await this.collectionModel.create({
            ...collectionRepo.toJSON(),
            status: CollectionStatus.QUEUED,
        }, {
            transaction: tx,
        });
        return CollectionEntity.fromRepo(collection);

    }

    async updateOne(
        id: number,
        collectionEntity: CollectionEntity,
        tx: Transaction = undefined,
    ): Promise<CollectionEntity> {

        const [count, [collection]] = await this.collectionModel.update(
            CollectionEntity.toRepo(collectionEntity).toJSON(),
            {
                where: { id },
                returning: true,
                transaction: tx,
            },
        );

        return CollectionEntity.fromRepo(collection);
    }

    async updateOneByDenomId(
        denomId: string,
        collectionEntity: CollectionEntity,
        tx: Transaction = undefined,
    ): Promise<CollectionEntity> {
        const [count, [collectionRepo]] = await this.collectionModel.update(
            { ...CollectionEntity.toRepo(collectionEntity).toJSON() },
            {
                where: { denom_id: denomId },
                returning: true,
                transaction: tx,
            },
        );

        return CollectionEntity.fromRepo(collectionRepo);
    }

    async getChainMarketplaceCollectionsByDenomIds(denomIds: string[]): Promise < ChainMarketplaceCollectionEntity[] > {
        return this.graphqlService.fetchMarketplaceCollectionsByDenomIds(denomIds);
    }

    async getChainMarketplaceCollectionsByIds(ids: number[]): Promise < ChainMarketplaceCollectionEntity[] > {
        return this.graphqlService.fetchMarketplaceCollectionsByIds(ids);
    }

    async getChainNftCollectionsByDenomIds(denomIds: string[]): Promise < ChainNftCollectionEntity[] > {
        return this.graphqlService.fetchNftCollectionsByDenomIds(denomIds);
    }

    async getDetails(collectionId: number): Promise <CollectionDetailsEntity> {
        const collection = await this.collectionModel.findOne({ where: { id: collectionId } })

        if (!collection) {
            throw new NotFoundException(`Collection with id '${collectionId}' doesn't exist`)
        }

        const nftFilter = new NftFilterEntity();
        nftFilter.collectionIds = [collectionId.toString()];
        nftFilter.nftStatus = [NftStatus.MINTED, NftStatus.QUEUED];
        nftFilter.orderBy = NftOrderBy.PRICE_ASC
        const { nftEntities } = await this.nftService.findByFilter(null, nftFilter);

        const approvedNfts = nftEntities.filter((nftEntity) => nftEntity.status === NftStatus.QUEUED) // Approved but not bought NFT-s

        const nftOwnersSet = new Set(nftEntities.filter((nft) => nft.hasOwner()).map((nft) => nft.currentOwner)); // Unique owners of all the NFTs in the collection

        // Get the lowest priced NFT from this collection "floorPriceInAcudos"
        const floorPriceInAcudos = approvedNfts.reduce((cheapestNftSoFar, nftEntity) => {
            if (nftEntity.hasPrice() === false) {
                return cheapestNftSoFar;
            }
            cheapestNftSoFar ??= nftEntity;
            return nftEntity.acudosPrice.lt(cheapestNftSoFar.acudosPrice) ? nftEntity : cheapestNftSoFar;
        }, null)?.acudosPrice ?? new BigNumber(0);

        // Get the total value spent on NFTs from this collection "volumeInAcudos"
        const collectionTotalSales = await this.graphqlService.fetchCollectionTotalSales([collection.denomId])

        // Get remaining hash power
        const nftsHashPowerSum = nftEntities.reduce((pervVal, currVal) => pervVal + Number(currVal.hashingPower), 0)
        const remainingHashPowerInTH = Number(collection.hashingPower) - nftsHashPowerSum

        const collectionDetailsEntity = new CollectionDetailsEntity();

        const { adminEntity } = await this.accountService.findAccounts(collection.creatorId);

        collectionDetailsEntity.id = collectionId;
        collectionDetailsEntity.floorPriceInAcudos = floorPriceInAcudos.toString(10);
        collectionDetailsEntity.volumeInAcudos = collectionTotalSales.salesInAcudos?.toString(10) || '0';
        collectionDetailsEntity.owners = nftOwnersSet.size;
        collectionDetailsEntity.cudosAddress = adminEntity?.cudosWalletAddress ?? '';
        collectionDetailsEntity.remainingHashPowerInTH = remainingHashPowerInTH;

        return collectionDetailsEntity;
    }
}
