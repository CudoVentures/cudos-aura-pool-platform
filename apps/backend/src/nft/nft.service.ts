import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import axios from 'axios';
import sequelize, { LOCK, Op, Transaction } from 'sequelize';
import { v4 as uuid } from 'uuid';
import AccountEntity from '../account/entities/account.entity';
import { Collection } from '../collection/collection.model';
import { CollectionService } from '../collection/collection.service';
import { GraphqlService } from '../graphql/graphql.service';
import { VisitorService } from '../visitor/visitor.service';
import { ChainMarketplaceNftDto } from './dto/chain-marketplace-nft.dto';
import { ChainNftNftDto } from './dto/chain-nft-nft.dto';
import NftFilterModel, { NftOrderBy } from './dto/nft-filter.model';
import { NFTDto } from './dto/nft.dto';
import { NFT } from './nft.model';
import { NftStatus } from './nft.types';

@Injectable()
export class NFTService {
    constructor(
        @InjectModel(NFT)
        private nftRepo: typeof NFT,
        private collectionService: CollectionService,
        private visitorService: VisitorService,
        private graphqlService: GraphqlService,
    ) {}

    async findByFilter(accountEntity: AccountEntity, nftFilterModel: NftFilterModel): Promise < { nftEntities: NFT[], total: number } > {
        let whereClause: any = {};
        let orderByClause: any[] = null;

        if (nftFilterModel.hasNftIds() === true) {
            whereClause.id = nftFilterModel.nftIds;
        }

        if (nftFilterModel.hasCollectionStatus() === true) {
            whereClause.collection_id = await this.collectionService.findIdsByStatus(nftFilterModel.getCollectionStatus());
        }

        if (nftFilterModel.hasCollectionIds() === true) {
            if (whereClause.collection_id === undefined) {
                whereClause.collection_id = nftFilterModel.collectionIds;
            } else {
                const set = new Set(whereClause.collection_id);
                whereClause.collection_id = nftFilterModel.collectionIds.filter((colId) => {
                    return set.has(colId);
                });
            }
        }

        if (nftFilterModel.inOnlyForSessionAccount() === true) {
            whereClause.creator_id = accountEntity.accountId;
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

    async findByCollectionId(id: number, tx: Transaction = undefined, lock: LOCK = undefined): Promise<NFT[]> {
        const nfts = await this.nftRepo.findAll({
            where: {
                collection_id: id,
            },
            transaction: tx,
            lock,
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

    async createOne(nftDto: Partial<NFTDto>, creatorId: number, tx: Transaction = undefined): Promise < NFT > {
        const nft = await this.nftRepo.create({
            ...nftDto,
            id: uuid(),
            creator_id: creatorId,
            current_owner: '',
            status: NftStatus.QUEUED,
        }, {
            transaction: tx,
        });

        return nft;
    }

    async updateOne(id: string, updateNFTDto: Partial<NFTDto>, tx: Transaction = undefined): Promise < NFT > {
        const [count, [nft]] = await this.nftRepo.update(
            { ...updateNFTDto, status: NftStatus.QUEUED },
            {
                where: { id },
                returning: true,
                transaction: tx,
            },
        );

        return nft;
    }

    async updateOneWithStatus(id: string, updateNFTDto: Partial<NFTDto>, tx: Transaction = undefined): Promise < NFT > {
        const [count, [nft]] = await this.nftRepo.update(
            { ...updateNFTDto },
            {
                where: { id },
                returning: true,
                transaction: tx,
            },
        );

        return nft;
    }

    async updateOneByTokenId(tokenId: string, updateNFTDto: Partial<NFT>, tx: Transaction = undefined): Promise < NFT > {
        const [count, nfts] = await this.nftRepo.update(
            { ...updateNFTDto },
            {
                where: { token_id: tokenId },
                returning: true,
                transaction: tx,
            },
        );

        console.log(nfts)
        return nfts[0];
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
            { deleted_at: new Date(), status: NftStatus.REMOVED },
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

    async getChainMarketplaceNftsByTokenIds(tokenIds: string[]): Promise < ChainMarketplaceNftDto[] > {
        const queryRes = await this.graphqlService.fetchMarketplaceNftsByTokenIds(tokenIds);
        return queryRes.marketplace_nft.map((queryNft) => ChainMarketplaceNftDto.fromQuery(queryNft));
    }

    async getChainNftNftsByTokenIds(tokenIds: string[]): Promise < ChainNftNftDto[] > {
        const queryRes = await this.graphqlService.fetchNftNftsByTokenIds(tokenIds);
        return queryRes.nft_nft.map((queryNft) => ChainNftNftDto.fromQuery(queryNft));
    }
}
