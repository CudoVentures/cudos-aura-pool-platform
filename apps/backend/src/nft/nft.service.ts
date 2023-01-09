import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import sequelize, { Op, Transaction, where } from 'sequelize';
import { v4 as uuid } from 'uuid';
import { CollectionService } from '../collection/collection.service';
import { VisitorService } from '../visitor/visitor.service';
import { NftRepo, NftRepoColumn } from './repos/nft.repo';
import { NftOrderBy, NftStatus } from './nft.types';
import NftEntity from './entities/nft.entity';
import NftFilterEntity from './entities/nft-filter.entity';
import UserEntity from '../account/entities/user.entity';
import AppRepo from '../common/repo/app.repo';

@Injectable()
export class NFTService {
    constructor(
        @InjectModel(NftRepo)
        private nftRepo: typeof NftRepo,
        @Inject(forwardRef(() => CollectionService))
        private collectionService: CollectionService,
        private visitorService: VisitorService,
    // eslint-disable-next-line no-empty-function
    ) {}

    async findByFilter(userEntity: UserEntity, nftFilterEntity: NftFilterEntity): Promise < { nftEntities: NftEntity[], total: number } > {
        let whereClause: any = {};
        let orderByClause: any[] = null;

        if (nftFilterEntity.hasNftIds() === true) {
            whereClause.id = nftFilterEntity.nftIds;
        }

        if (nftFilterEntity.hasCollectionStatus() === true) {
            whereClause.collection_id = await this.collectionService.findIdsByStatus(nftFilterEntity.getCollectionStatus());
        }

        if (nftFilterEntity.hasNftStatus() === true) {
            whereClause.status = nftFilterEntity.nftStatus;
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
            whereClause.current_owner = userEntity.cudosWalletAddress;
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
        });

        let nftEntities = nftRepos.map((nftRepo) => NftEntity.fromRepo(nftRepo));
        if (nftFilterEntity.isSortByTrending() === true) {
            const nftIds = nftEntities.map((nftEntity) => {
                return nftEntity.id.toString();
            });
            const sortDirection = Math.floor(Math.abs(nftFilterEntity.orderBy) / nftFilterEntity.orderBy);
            const visitorMap = await this.visitorService.fetchNftsVisitsCountAsMap(nftIds);
            nftEntities.sort((a: NftEntity, b: NftEntity) => {
                const visitsA = visitorMap.get(a.id.toString()) ?? 0;
                const visitsB = visitorMap.get(b.id.toString()) ?? 0;
                return sortDirection * (visitsA - visitsB);
            });
        }

        const total = nftEntities.length;
        nftEntities = nftEntities.slice(nftFilterEntity.from, nftFilterEntity.from + nftFilterEntity.count);

        return {
            nftEntities,
            total,
        };

    }

    async findAll(): Promise <NftEntity[]> {
        const nftRepos = await this.nftRepo.findAll();

        const nftEntities = nftRepos.map((nftRepo) => NftEntity.fromRepo(nftRepo));

        return nftEntities;
    }

    async findByAccountId(accountId: number): Promise < NftEntity[] > {
        const whereClause = new NftRepo();
        whereClause.creatorId = accountId;
        const nftRepos = await this.nftRepo.findAll({
            where: AppRepo.toJsonWhere(whereClause),
        });

        return nftRepos.map((nftRepo) => {
            return NftEntity.fromRepo(nftRepo);
        });
    }

    async findActiveByCurrentOwner(cudosWalletAddress: string): Promise < NftEntity[] > {
        const nftRepos = await this.nftRepo.findAll({
            where: {
                [NftRepoColumn.CURRENT_OWNER]: cudosWalletAddress,
                [NftRepoColumn.STATUS]: NftStatus.MINTED,
                [NftRepoColumn.EXPIRATION_DATE]: {
                    [Op.gt]: new Date(),
                },
            },
        });

        return nftRepos.map((nftRepo) => {
            return NftEntity.fromRepo(nftRepo);
        });
    }

    async findByCollectionIds(collectionIds: number[]) {
        const nftRepos = await this.nftRepo.findAll({
            where: {
                [NftRepoColumn.COLLECTION_ID]: collectionIds,
            },
        });

        return nftRepos.map((nftRepo) => {
            return NftEntity.fromRepo(nftRepo);
        });
    }

    async findByCollectionIdsAndTokenIds(collectionIds: number[], tokenIds: string[]) {
        const nftRepos = await this.nftRepo.findAll({
            where: {
                [NftRepoColumn.COLLECTION_ID]: collectionIds,
                [NftRepoColumn.TOKEN_ID]: tokenIds,
            },
        });

        return nftRepos.map((nftRepo) => {
            return NftEntity.fromRepo(nftRepo);
        });
    }

    async findOne(id: string): Promise < NftEntity > {
        const nftRepo = await this.nftRepo.findByPk(id);

        if (!nftRepo) {
            throw new NotFoundException();
        }

        return NftEntity.fromRepo(nftRepo);
    }

    async createOne(nftEntity: NftEntity, tx: Transaction = undefined): Promise < NftEntity > {
        const nftRepo = await this.nftRepo.create({
            ...NftEntity.toRepo(nftEntity).toJSON(),
            id: uuid(),
            current_owner: '',
            status: NftStatus.QUEUED,
        }, {
            transaction: tx,
        });

        return NftEntity.fromRepo(nftRepo);
    }

    async updateOne(id: string, nftEntity: NftEntity, tx: Transaction = undefined): Promise < NftEntity > {
        const [count, [nftRepo]] = await this.nftRepo.update(
            {
                ...NftEntity.toRepo(nftEntity).toJSON(),
                status: NftStatus.QUEUED,
            },
            {
                where: { id },
                returning: true,
                transaction: tx,
            },
        );

        return NftEntity.fromRepo(nftRepo);
    }

    async deleteMany(nftEntities: NftEntity[]): Promise <void> {
        // TODO: check settings for deletion
        const promises = nftEntities.map((nftEtity) => NftEntity.toRepo(nftEtity).destroy());

        await Promise.all(promises);
    }

    async updateOneWithStatus(id: string, nftEntity: NftEntity, tx: Transaction = undefined): Promise < NftEntity > {
        const [count, [nftRepo]] = await this.nftRepo.update(
            NftEntity.toRepo(nftEntity).toJSON(),
            {
                where: { id },
                returning: true,
                transaction: tx,
            },
        );

        return NftEntity.fromRepo(nftRepo);
    }

    // async getNftAttributes(txHash: string): Promise<{ token_id: string, uuid: string }> {
    //     let tokenId;
    //     let uuid;

    //     enum Attribute {
    //         uid = 'uid',
    //         nft_id = 'nft_id'
    //     }

    //     try {
    //         const res = await axios.get(
    //             `${process.env.App_Public_API}/cosmos/tx/v1beta1/txs/${txHash}`,
    //         );

    //         if (res.data.tx_response.code !== 0) {
    //             throw new NotFoundException();
    //         }

    //         const data = JSON.parse(res.data.tx_response.raw_log);
    //         const mintNFTObj = data[0].events.find(
    //             (el) => el.type === 'marketplace_mint_nft',
    //         );

    //         tokenId = mintNFTObj.attributes.find((el) => el.key === Attribute.nft_id).value;
    //         uuid = mintNFTObj.attributes.find((el) => el.key === Attribute.uid).value;
    //     } catch (err) {
    //         throw new NotFoundException();
    //     }

    //     if (!tokenId || !uuid) {
    //         throw new NotFoundException();
    //     }

    //     return {
    //         token_id: tokenId.toString(),
    //         uuid,
    //     }
    // }
}
