import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CollectionDto } from './dto/collection.dto';
import { Collection } from './collection.model';
import { CollectionStatus } from './utils';
import { NFT } from '../nft/nft.model';
import { NftStatus } from '../nft/nft.types';
import CollectionFilterModel, { CollectionOrderBy } from './dto/collection-filter.model';
import sequelize, { LOCK, Op, Transaction } from 'sequelize';
import { GraphqlService } from '../graphql/graphql.service';
import { ChainMarketplaceCollectionDto } from './dto/chain-marketplace-collection.dto';
import { ChainNftCollectionDto } from './dto/chain-nft-collection.dto';
import { checkValidNftDenomId } from 'cudosjs';

@Injectable()
export class CollectionService {
    constructor(
    @InjectModel(Collection)
    private collectionModel: typeof Collection,
    @InjectModel(NFT)
    private nftModel: typeof NFT,
    private graphqlService: GraphqlService,
    ) {}

    async findByFilter(collectionFilterModel: CollectionFilterModel): Promise < { collectionEntities: Collection[], total: number } > {
        let whereClause: any = {};
        let orderByClause: any[] = null;

        if (collectionFilterModel.hasCollectionIds() === true) {
            whereClause.id = collectionFilterModel.collectionIds;
        }

        if (collectionFilterModel.hasCollectionStatus() === true) {
            whereClause.status = collectionFilterModel.getCollectionStatus();
        }

        if (collectionFilterModel.hasFarmId() === true) {
            whereClause.farm_id = collectionFilterModel.farmId;
        }

        if (collectionFilterModel.hasTimestampFrom() === true) {
            whereClause.createdAt = { [Op.gte]: new Date(collectionFilterModel.timestampFrom).toISOString() }
        }

        if (collectionFilterModel.hasTimestampTo() === true) {
            if (whereClause.createdAt === undefined) {
                whereClause.createdAt = {};
            }
            whereClause.createdAt[Op.lte] = new Date(collectionFilterModel.timestampTo).toISOString();
        }

        if (collectionFilterModel.hasSearchString() === true) {
            whereClause = [
                whereClause,
                sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), { [Op.like]: `%${collectionFilterModel.searchString.toLowerCase()}%` }),
            ]
        }

        switch (collectionFilterModel.orderBy) {
            case CollectionOrderBy.TIMESTAMP_ASC:
            case CollectionOrderBy.TIMESTAMP_DESC:
            default:
                orderByClause = [['createdAt']]
                break;
        }
        if (orderByClause !== null) {
            orderByClause[0].push(collectionFilterModel.orderBy > 0 ? 'ASC' : 'DESC');
        }

        let collectionEntities = await this.collectionModel.findAll({
            where: whereClause,
            order: orderByClause,
        });

        // if (collectionFilterModel.isSortByTrending() === true) {
        //     const nftIds = collectionEntities.map((nftEntity) => {
        //         return nftEntity.id;
        //     });
        //     const sortDirection = Math.floor(Math.abs(collectionFilterModel.orderBy) / collectionFilterModel.orderBy);
        //     const visitorMap = await this.visitorService.fetchNftsVisitsCountAsMap(nftIds);
        //     collectionEntities.sort((a: NFT, b: NFT) => {
        //         const visitsA = visitorMap.get(a.id) ?? 0;
        //         const visitsB = visitorMap.get(b.id) ?? 0;
        //         return sortDirection * (visitsA - visitsB);
        //     });
        // }

        const total = collectionEntities.length;
        collectionEntities = collectionEntities.slice(collectionFilterModel.from, collectionFilterModel.from + collectionFilterModel.count);

        return {
            collectionEntities,
            total,
        };
    }

    async findIdsByStatus(status: CollectionStatus): Promise < number[] > {
        const collections = await this.collectionModel.findAll({
            where: {
                status,
            },
        })

        return collections.map((collection) => {
            return collection.id;
        })
    }

    async findOne(id: number, tx: Transaction = undefined, lock: LOCK = undefined): Promise<Collection> {
        return this.collectionModel.findByPk(id, {
            transaction: tx,
            lock,
        });
    }
    async findByFarmId(id: number): Promise<Collection[]> {
        const collections = await this.collectionModel.findAll({
            where: {
                farm_id: id,
            },
        });

        return collections;
    }

    async createOne(
        collectionDto: Partial<CollectionDto>,
        creator_id: number,
        tx: Transaction = undefined,
    ): Promise<Collection> {

        collectionDto.denom_id = collectionDto.name.toLowerCase().replace(' ', '_');
        checkValidNftDenomId(collectionDto.denom_id);
        const collection = this.collectionModel.create({
            ...collectionDto,
            status: CollectionStatus.QUEUED,
            creator_id,
        }, {
            transaction: tx,
        });

        return collection;
    }

    async updateOne(
        id: number,
        collectionDto: Partial<CollectionDto>,
        tx: Transaction = undefined,
    ): Promise<Collection> {
        const [count, [collection]] = await this.collectionModel.update(
            { ...collectionDto, status: CollectionStatus.QUEUED },
            {
                where: { id },
                returning: true,
                transaction: tx,
            },
        );

        return collection;
    }

    async updateOneByDenomId(
        denomId: string,
        collectionDto: Partial<Collection>,
        tx: Transaction = undefined,
    ): Promise<Collection> {
        const [count, [collection]] = await this.collectionModel.update(
            { ...collectionDto, status: CollectionStatus.QUEUED },
            {
                where: { denom_id: denomId },
                returning: true,
                transaction: tx,
            },
        );

        return collection;
    }

    async updateStatus(
        id: number,
        status: CollectionStatus,
        tx: Transaction = undefined,
    ): Promise<Collection> {
        const [count, [collection]] = await this.collectionModel.update(
            {
                status,
            },
            {
                where: { id },
                returning: true,
                transaction: tx,
            },
        );

        return collection;
    }

    async deleteOne(id: number, tx: Transaction = undefined): Promise<Collection> {
        const [count, [collection]] = await this.collectionModel.update(
            { deleted_at: new Date(), status: CollectionStatus.DELETED },
            {
                where: {
                    id,
                },
                returning: true,
                transaction: tx,
            },
        );

        return collection;
    }

    async getChainMarketplaceCollectionsByDenomIds(denomIds: string[]): Promise < ChainMarketplaceCollectionDto[] > {
        const queryRes = await this.graphqlService.fetchMarketplaceCollectionsByDenomIds(denomIds);
        return queryRes.marketplace_collection.map((queryCollection) => ChainMarketplaceCollectionDto.fromQuery(queryCollection));
    }

    async getChainNftCollectionsByDenomIds(denomIds: string[]): Promise < ChainNftCollectionDto[] > {
        const queryRes = await this.graphqlService.fetchNftCollectionsByDenomIds(denomIds);
        return queryRes.nft_denom.map((queryCollection) => ChainNftCollectionDto.fromQuery(queryCollection));
    }

    async getDetails(collectionId: number): Promise <{ id: number, floorPriceInAcudos: number, volumeInAcudos: number, owners: number, remainingHashPowerInTH: number }> {
        const collection = await this.collectionModel.findOne({ where: { id: collectionId } })
        if (!collection) {
            throw new NotFoundException(`Collection with id '${collectionId}' doesn't exist`)
        }

        const allNfts = await this.nftModel.findAll({ where: { collection_id: collectionId, status: { [Op.notIn]: [NftStatus.REMOVED] } }, order: [['price', 'ASC']] })
        const approvedNfts = allNfts.filter((nft) => nft.status === NftStatus.QUEUED) // Approved but not bought NFT-s
        const soldNfts = await this.graphqlService.fetchNftsByDenomId({ denom_ids: [collection.denom_id] }) // Sold NFTs

        const uniqueOwnersArray = [...new Set(soldNfts.marketplace_nft.map((nft) => nft.nft_nft.owner))] // Unique owners of all the NFTs in the collection

        // Get the lowest priced NFT from this collection "floorPriceInAcudos"
        const sortedByPriceSoldNfts = soldNfts.marketplace_nft.sort((a, b) => a.price - b.price).filter((nft) => nft.price) // Sorting by price and filtering out nfts with price "null" (price "null" means they're not listed for sale)
        const cheapestNfts = [approvedNfts[0]?.price, sortedByPriceSoldNfts[0]?.price].filter((price) => price).sort((a, b) => Number(a) - Number(b)) // filtering out "undefined" price since both approved and sold NFTs arrays could be empty
        const floorPriceInAcudos = cheapestNfts[0] || 0 // Price of the cheapest NFT

        // Get the total value spent on NFTs from this collection "volumeInAcudos"
        const collectionTotalSales = await this.graphqlService.fetchCollectionTotalSales([collection.denom_id])

        // Get remaining hash power
        const nftsHashPowerSum = allNfts.reduce((pervVal, currVal) => pervVal + Number(currVal.hashing_power), 0)
        const remainingHashPowerInTH = Number(collection.hashing_power) - nftsHashPowerSum

        return {
            id: collectionId,
            floorPriceInAcudos,
            volumeInAcudos: collectionTotalSales.salesInAcudos || 0,
            owners: uniqueOwnersArray.length,
            remainingHashPowerInTH,
        }
    }
}
