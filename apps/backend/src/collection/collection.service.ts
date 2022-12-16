import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CollectionRepo } from './repos/collection.repo';
import { CollectionStatus } from './utils';
import { NftRepo } from '../nft/repos/nft.repo';
import { NftStatus } from '../nft/nft.types';
import CollectionFilterModel from './entities/collection-filter.entity';
import sequelize, { LOCK, Op, Transaction } from 'sequelize';
import { GraphqlService } from '../graphql/graphql.service';
import { ChainMarketplaceCollectionDto } from './dto/chain-marketplace-collection.dto';
import { ChainNftCollectionDto } from './dto/chain-nft-collection.dto';
import { checkValidNftDenomId } from 'cudosjs';
import { CollectionDenomExistsError, CollectionWrongDenomError } from '../common/errors/errors';
import { CollectionEntity } from './entities/collection.entity';
import { CollectionDetailsEntity } from './entities/collection-details.entity';
import { CollectionOrderBy } from './collection.types';
import AccountService from '../account/account.service';

@Injectable()
export class CollectionService {
    constructor(
    @InjectModel(CollectionRepo)
    private collectionModel: typeof CollectionRepo,
    @InjectModel(NftRepo)
    private nftRepo: typeof NftRepo,
    private graphqlService: GraphqlService,
    private accountService: AccountService,
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
        // if (collectionFitlerEntity.isSortByTrending() === true) {
        //     const nftIds = collectionEntities.map((nftEntity) => {
        //         return nftEntity.id;
        //     });
        //     const sortDirection = Math.floor(Math.abs(collectionFitlerEntity.orderBy) / collectionFitlerEntity.orderBy);
        //     const visitorMap = await this.visitorService.fetchNftsVisitsCountAsMap(nftIds);
        //     collectionEntities.sort((a: NFT, b: NFT) => {
        //         const visitsA = visitorMap.get(a.id) ?? 0;
        //         const visitsB = visitorMap.get(b.id) ?? 0;
        //         return sortDirection * (visitsA - visitsB);
        //     });
        // }

        const total = collectionEntities.length;
        collectionEntities = collectionEntities.slice(collectionFitlerEntity.from, collectionFitlerEntity.from + collectionFitlerEntity.count);

        return {
            collectionEntities,
            total,
        };
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
        if (chainCollections.nft_denom.length > 0) {
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

    async getChainMarketplaceCollectionsByDenomIds(denomIds: string[]): Promise < ChainMarketplaceCollectionDto[] > {
        const queryRes = await this.graphqlService.fetchMarketplaceCollectionsByDenomIds(denomIds);
        return queryRes.marketplace_collection.map((queryCollection) => ChainMarketplaceCollectionDto.fromQuery(queryCollection));
    }

    async getChainNftCollectionsByDenomIds(denomIds: string[]): Promise < ChainNftCollectionDto[] > {
        const queryRes = await this.graphqlService.fetchNftCollectionsByDenomIds(denomIds);
        return queryRes.nft_denom.map((queryCollection) => ChainNftCollectionDto.fromQuery(queryCollection));
    }

    // TODO: redo with big numbers
    async getDetails(collectionId: number): Promise <CollectionDetailsEntity> {
        const collection = await this.collectionModel.findOne({ where: { id: collectionId } })
        if (!collection) {
            throw new NotFoundException(`Collection with id '${collectionId}' doesn't exist`)
        }

        const allNfts = await this.nftRepo.findAll({ where: { collection_id: collectionId, status: { [Op.notIn]: [NftStatus.REMOVED] } }, order: [['price', 'ASC']] })
        const approvedNfts = allNfts.filter((nft) => nft.status === NftStatus.QUEUED) // Approved but not bought NFT-s
        const soldNfts = await this.graphqlService.fetchNftsByDenomId({ denom_ids: [collection.denomId] }) // Sold NFTs
        const uniqueOwnersArray = [...new Set(soldNfts.marketplace_nft.map((nft) => nft.nft_nft.owner))] // Unique owners of all the NFTs in the collection

        // Get the lowest priced NFT from this collection "floorPriceInAcudos"
        const sortedByPriceSoldNfts = soldNfts.marketplace_nft.sort((a, b) => a.price - b.price).filter((nft) => nft.price) // Sorting by price and filtering out nfts with price "null" (price "null" means they're not listed for sale)
        const cheapestNfts = [approvedNfts[0]?.price, sortedByPriceSoldNfts[0]?.price].filter((price) => price).sort((a, b) => Number(a) - Number(b)) // filtering out "undefined" price since both approved and sold NFTs arrays could be empty
        const floorPriceInAcudos = cheapestNfts[0] || 0 // Price of the cheapest NFT

        // Get the total value spent on NFTs from this collection "volumeInAcudos"
        const collectionTotalSales = await this.graphqlService.fetchCollectionTotalSales([collection.denomId])

        // Get remaining hash power
        const nftsHashPowerSum = allNfts.reduce((pervVal, currVal) => pervVal + Number(currVal.hashingPower), 0)
        const remainingHashPowerInTH = Number(collection.hashingPower) - nftsHashPowerSum

        const collectionDetailsEntity = new CollectionDetailsEntity();

        const { adminEntity } = await this.accountService.findAccounts(collection.creatorId);

        collectionDetailsEntity.id = collectionId;
        collectionDetailsEntity.floorPriceInAcudos = floorPriceInAcudos;
        collectionDetailsEntity.volumeInAcudos = collectionTotalSales.salesInAcudos?.toString() || '0';
        collectionDetailsEntity.owners = uniqueOwnersArray.length;
        collectionDetailsEntity.cudosAddress = adminEntity?.cudosWalletAddress ?? '';
        collectionDetailsEntity.remainingHashPowerInTH = remainingHashPowerInTH;

        return collectionDetailsEntity;
    }
}
