import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CollectionDto } from './dto/collection.dto';
import { Collection } from './collection.model';
import { CollectionStatus } from './utils';
import { NFT } from '../nft/nft.model';
import { NftStatus } from '../nft/nft.types';
import CollectionFilterModel, { CollectionOrderBy } from './dto/collection-filter.model';
import sequelize, { Op } from 'sequelize';

@Injectable()
export class CollectionService {
    constructor(
        @InjectModel(Collection)
        private collectionModel: typeof Collection,
        @InjectModel(NFT)
        private nftModel: typeof NFT,
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

    async findOne(id: number): Promise<Collection> {
        const collection = await this.collectionModel.findByPk(id);

        if (!collection) {
            throw new NotFoundException();
        }

        return collection;
    }

    async findByCreatorId(id: number): Promise<Collection[]> {
        const collections = await this.collectionModel.findAll({
            where: {
                creator_id: id,
            },
        });

        return collections;
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
    ): Promise<Collection> {
        const collection = this.collectionModel.create({
            ...collectionDto,
            status: CollectionStatus.QUEUED,
            creator_id,
        });

        return collection;
    }

    async updateOne(
        id: number,
        collectionDto: Partial<CollectionDto>,
    ): Promise<Collection> {
        const [count, [collection]] = await this.collectionModel.update(
            { ...collectionDto, status: CollectionStatus.QUEUED },
            {
                where: { id },
                returning: true,
            },
        );

        return collection;
    }

    async updateStatus(
        id: number,
        status: CollectionStatus,
    ): Promise<Collection> {
        const [count, [collection]] = await this.collectionModel.update(
            {
                status,
            },
            {
                where: { id },
                returning: true,
            },
        );

        return collection;
    }

    async deleteOne(id: number): Promise<Collection> {
        const [count, [collection]] = await this.collectionModel.update(
            { deleted_at: new Date(), status: CollectionStatus.DELETED },
            {
                where: {
                    id,
                },
                returning: true,
            },
        );

        return collection;
    }

    async getDetails(collectionId: number): Promise <{ id: number, floorPrice: string, volumeInAcudos: string, owners: number }> {
        // Get the lowest priced NFT from this collection "floorPrice"
        const approvedNfts = await this.nftModel.findAll({ where: { collection_id: collectionId, status: NftStatus.APPROVED }, order: [['price', 'ASC']] }) // Approved but not bought NFT-s
        const soldNfts = [] // <==== NFTS from Hasura
        const floorPrice = '1000000000000000000' // lowest price NFT from both approvedNfts and soldNfts

        // Get the total value spent on NFTs from this collection "volumeInAcudos"
        const volumeInAcudos = '10000000000000000000'

        // Get the unique owners of NFTs from this collection
        const owners = 25

        return {
            id: collectionId,
            floorPrice,
            volumeInAcudos,
            owners,
        }
    }
}
