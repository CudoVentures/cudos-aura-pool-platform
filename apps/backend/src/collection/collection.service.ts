import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CollectionDto } from './dto/collection.dto';
import { Collection } from './collection.model';
import { CollectionFilters, CollectionStatus } from './utils';
import { NFTService } from '../nft/nft.service';
import { NFT } from '../nft/nft.model';
import { NftStatus } from '../nft/utils';

@Injectable()
export class CollectionService {
    constructor(
    @InjectModel(Collection)
    private collectionModel: typeof Collection,
    @InjectModel(NFT)
    private nftModel: typeof NFT,
    private nftService: NFTService,
    ) {}

    async findAll(filters: Partial<CollectionFilters>): Promise<Collection[]> {
        const { limit, offset, ...rest } = filters
        const collections = await this.collectionModel.findAll({
            where: { ...rest },
            offset,
            limit,
        });
        return collections;
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
