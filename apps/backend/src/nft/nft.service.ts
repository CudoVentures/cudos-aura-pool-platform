import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { Collection } from '../collection/collection.model';
import { NFTDto } from './dto/nft.dto';
import { NFT } from './nft.model';
import { NftFilters, NftOrderBy, NftStatus } from './utils';

@Injectable()
export class NFTService {
    constructor(
    @InjectModel(NFT)
    private nftModel: typeof NFT,
    ) {}

    async findAll(filters: Partial<NftFilters>): Promise<NFT[]> {
        const { limit, offset, order_by, collectionStatus, ...rest } = filters

        let order;
        switch (order_by) {
            case NftOrderBy.TIMESTAMP_DESC:
                order = [['createdAt', 'DESC']]
                break;
            default:
                order = undefined;
                break;

        }

        const nfts = await this.nftModel.findAll({
            where: { ...rest },
            order,
            limit,
            offset,
        });

        return nfts;
    }

    async findByCollectionId(id: number): Promise<NFT[]> {
        const nfts = await this.nftModel.findAll({
            where: {
                collection_id: id,
            },
        });

        return nfts;
    }

    async findByCreatorId(id: number): Promise<NFT[]> {
        const nfts = await this.nftModel.findAll({
            where: {
                creator_id: id,
            },
        });

        return nfts;
    }

    async findOne(id: string): Promise<NFT> {
        const nft = this.nftModel.findByPk(id, { include: [{ model: Collection }] });

        if (!nft) {
            throw new NotFoundException();
        }

        return nft;
    }

    async createOne(
        nftDto: Partial<NFTDto>,
        creator_id: number,
    ): Promise<NFT> {
        const nft = await this.nftModel.create({
            ...nftDto,
            id: uuid(),
            creator_id,
            status: NftStatus.QUEUED,
        });

        return nft;
    }

    async updateOne(
        id: string,
        updateNFTDto: Partial<NFTDto>,
    ): Promise<NFT> {
        const [count, [nft]] = await this.nftModel.update(
            { ...updateNFTDto, status: NftStatus.QUEUED },
            {
                where: { id },
                returning: true,
            },
        );

        return nft;
    }

    async updateStatus(id: string, status: NftStatus): Promise<NFT> {
        const [count, [nft]] = await this.nftModel.update(
            { status },
            {
                where: { id },
                returning: true,
            },
        );

        return nft;
    }

    async updateTokenId(id: string, token_id: string): Promise<NFT> {
        const [count, [nft]] = await this.nftModel.update(
            { token_id },
            {
                where: { id },
                returning: true,
            },
        )

        return nft
    }

    async deleteOne(id: string): Promise<NFT> {
        const [count, [nft]] = await this.nftModel.update(
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
