import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import axios from 'axios';
import sequelize, { Op } from 'sequelize';
import { v4 as uuid } from 'uuid';
import { Collection } from '../collection/collection.model';
import { CollectionService } from '../collection/collection.service';
import { User } from '../user/user.model';
import { VisitorService } from '../visitor/visitor.service';
import NftFilterModel, { NftOrderBy } from './dto/nft-filter.model';
import { NFTDto } from './dto/nft.dto';
import { NFT } from './nft.model';
import { NftStatus } from './utils';

@Injectable()
export class NFTService {
    constructor(
        @InjectModel(NFT)
        private nftRepo: typeof NFT,
        private collectionService: CollectionService,
        private visitorService: VisitorService,
    ) {}

    async findByFilter(user: User, nftFilterModel: NftFilterModel): Promise < { nftEntities: NFT[], total: number } > {
        let whereClause: any = {};
        let orderByClause: any[] = null;

        if (nftFilterModel.hasNftIds() === true) {
            whereClause.id = nftFilterModel.nftIds;
        }

        if (nftFilterModel.hasCollectionStatus() === true) {
            whereClause.collection_id = await this.collectionService.findIdsByStatus(nftFilterModel.getCollectionStatus());
        }

        if (nftFilterModel.hasCollectionIds() === true) {
            whereClause.collection_id = whereClause.collection_id.concat(nftFilterModel.collectionIds);
        }

        if (nftFilterModel.inOnlyForSessionAccount() === true) {
            whereClause.creator_id = user.id;
        }

        if (nftFilterModel.hasSearchString() === true) {
            whereClause = [
                whereClause,
                sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), { [Op.like]: `%${nftFilterModel.searchString.toLowerCase()}%` }),
            ]
        }

        switch (nftFilterModel.orderBy) {
            case NftOrderBy.TIMESTAMP_ASC:
            case NftOrderBy.TIMESTAMP_DESC:
            default:
                orderByClause = [['createdAt']]
                break;
        }
        if (orderByClause !== null) {
            orderByClause[0].push(nftFilterModel.orderBy > 0 ? 'ASC' : 'DESC');
        }

        let nftEntities = await this.nftRepo.findAll({
            where: whereClause,
            order: orderByClause,
        });

        if (nftFilterModel.isSortByTrending() === true) {
            const nftIds = nftEntities.map((nftEntity) => {
                return nftEntity.id;
            });
            const sortDirection = Math.floor(Math.abs(nftFilterModel.orderBy) / nftFilterModel.orderBy);
            const visitorMap = await this.visitorService.fetchNftsVisitsCountAsMap(nftIds);
            nftEntities.sort((a: NFT, b: NFT) => {
                const visitsA = visitorMap.get(a.id) ?? 0;
                const visitsB = visitorMap.get(b.id) ?? 0;
                return sortDirection * (visitsA - visitsB);
            });
        }

        const total = nftEntities.length;
        nftEntities = nftEntities.slice(nftFilterModel.from, nftFilterModel.from + nftFilterModel.count);

        return {
            nftEntities,
            total,
        };

    }

    async findByCollectionId(id: number): Promise<NFT[]> {
        const nfts = await this.nftRepo.findAll({
            where: {
                collection_id: id,
            },
        });

        return nfts;
    }

    async findByCreatorId(id: number): Promise<NFT[]> {
        const nfts = await this.nftRepo.findAll({
            where: {
                creator_id: id,
            },
        });

        return nfts;
    }

    async findOne(id: string): Promise < NFT > {
        const nft = this.nftRepo.findByPk(id, { include: [{ model: Collection }] });

        if (!nft) {
            throw new NotFoundException();
        }

        return nft;
    }

    async createOne(nftDto: Partial<NFTDto>, creatorId: number): Promise < NFT > {
        const nft = await this.nftRepo.create({
            ...nftDto,
            id: uuid(),
            creator_id: creatorId,
            status: NftStatus.QUEUED,
        });

        return nft;
    }

    async updateOne(id: string, updateNFTDto: Partial<NFTDto>): Promise < NFT > {
        const [count, [nft]] = await this.nftRepo.update(
            { ...updateNFTDto, status: NftStatus.QUEUED },
            {
                where: { id },
                returning: true,
            },
        );

        return nft;
    }

    async updateStatus(id: string, status: NftStatus): Promise < NFT > {
        const [count, [nft]] = await this.nftRepo.update(
            { status },
            {
                where: { id },
                returning: true,
            },
        );

        return nft;
    }

    async updateTokenId(id: string, token_id: string): Promise < NFT > {
        const [count, [nft]] = await this.nftRepo.update(
            { token_id },
            {
                where: { id },
                returning: true,
            },
        )

        return nft
    }

    async deleteOne(id: string): Promise < NFT > {
        const [count, [nft]] = await this.nftRepo.update(
            { deleted_at: new Date(), status: NftStatus.DELETED },
            {
                where: {
                    id,
                },
                returning: true,
            },
        );

        return nft;
    }

    async getNftAttributes(txHash: string): Promise<{ token_id: string, uuid: string }> {
        let tokenId;
        let uuid;

        enum Attribute {
            uid = 'uid',
            nft_id = 'nft_id'
        }

        try {
            const res = await axios.get(
                `${process.env.App_Public_API}/cosmos/tx/v1beta1/txs/${txHash}`,
            );

            if (res.data.tx_response.code !== 0) {
                throw new NotFoundException();
            }

            const data = JSON.parse(res.data.tx_response.raw_log);
            const mintNFTObj = data[0].events.find(
                (el) => el.type === 'marketplace_mint_nft',
            );

            tokenId = mintNFTObj.attributes.find((el) => el.key === Attribute.nft_id).value;
            uuid = mintNFTObj.attributes.find((el) => el.key === Attribute.uid).value;
        } catch (err) {
            throw new NotFoundException();
        }

        if (!tokenId || !uuid) {
            throw new NotFoundException();
        }

        return {
            token_id: tokenId.toString(),
            uuid,
        }
    }
}
