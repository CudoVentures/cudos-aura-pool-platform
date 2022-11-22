import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CollectionDto } from './dto/collection.dto';
import { Collection } from './collection.model';
import { CollectionFilters, CollectionOrderBy, CollectionStatus } from './utils';
import { NFT } from '../nft/nft.model';
import { NftStatus } from '../nft/utils';
import { GraphqlService } from '../graphql/graphql.service';
import { Op } from 'sequelize';

@Injectable()
export class CollectionService {
    constructor(
    @InjectModel(Collection)
    private collectionModel: typeof Collection,
    @InjectModel(NFT)
    private nftModel: typeof NFT,
    private graphqlService: GraphqlService,
    ) {}

    async findAll(filters: Partial<CollectionFilters>): Promise<Collection[]> {
        const { limit, offset, order_by, ...rest } = filters

        let order;

        switch (order_by) {
            case CollectionOrderBy.TIMESTAMP_DESC:
                order = [['createdAt', 'DESC']]
                break;
            default:
                order = undefined;
                break;

        }

        const collections = await this.collectionModel.findAll({
            where: { ...rest },
            order,
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

    async getDetails(collectionId: number): Promise <{ id: number, floorPriceInAcudos: number, volumeInAcudos: number, owners: number, remainingHashPowerInTH: number }> {
        const collection = await this.collectionModel.findOne({ where: { id: collectionId } })
        if (!collection) {
            throw new NotFoundException(`Collection with id '${collectionId}' doesn't exist`)
        }

        const allNfts = await this.nftModel.findAll({ where: { collection_id: collectionId, status: { [Op.notIn]: [NftStatus.DELETED, NftStatus.REJECTED] } }, order: [['price', 'ASC']] })
        const approvedNfts = allNfts.filter((nft) => nft.status === NftStatus.APPROVED) // Approved but not bought NFT-s
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
