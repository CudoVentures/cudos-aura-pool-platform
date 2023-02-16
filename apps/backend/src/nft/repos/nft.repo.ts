import {
    Column,
    Model,
    Table,
    ForeignKey,
    PrimaryKey,
    Unique,
    AllowNull,
    DataType,
    IsUUID,
} from 'sequelize-typescript';
import AccountRepo from '../../account/repos/account.repo';
import { CollectionRepo } from '../../collection/repos/collection.repo';
import { NftStatus } from '../nft.types';

const NFTS_TABLE_NAME = 'nfts'

export const enum NftRepoColumn {
    ID = 'id',
    NAME = 'name',
    URI = 'uri',
    DATA = 'data',
    HASHING_POWER = 'hashing_power',
    price = 'price',
    EXPIRATION_DATE = 'expiration_date',
    STATUS = 'status',
    TOKEN_ID = 'token_id',
    COLLECTION_ID = 'collection_id',
    CREATOR_ID = 'creator_id',
    DELETE_AT = 'deleted_at',
    UPDATED_AT = 'updated_at',
    CURRENT_OWNER = 'current_owner',
    MARKETPLACE_NFT_ID = 'marketplace_nft_id',
    PRICE_USD = 'price_usd',
    PRICE_VALID_UNTIL = 'price_acudos_valid_until'
}

@Table({
    freezeTableName: true,
    tableName: NFTS_TABLE_NAME,
    underscored: true,
})
export class NftRepo extends Model {
    @PrimaryKey
    @Unique
    @IsUUID(4)
    @AllowNull(false)
    @Column({ type: DataType.UUID })
        id: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        name: string;

    @AllowNull(true)
    @Column({ type: DataType.TEXT })
        uri: string;

    @Column({ type: DataType.STRING })
        data: string;

    @AllowNull(false)
    @Column({ type: DataType.DECIMAL })
        hashingPower: string;

    @AllowNull(false)
    @Column({ type: DataType.DECIMAL })
        price: string;

    @AllowNull(false)
    @Column({ type: DataType.DECIMAL })
        priceInEth: string

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        expirationDate: Date;

    @AllowNull(false)
    @Column({ type: DataType.ENUM(NftStatus.MINTED, NftStatus.QUEUED, NftStatus.REMOVED) })
        status: NftStatus;

    @AllowNull(true)
    @Column({ type: DataType.STRING })
        tokenId: string

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => CollectionRepo)
        collectionId: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => AccountRepo)
        creatorId: number;

    @Column({ type: DataType.DATE })
        deletedAt: Date;

    @Column({ type: DataType.DATE })
        updatedAt: Date;

    @Column({ type: DataType.DATE })
        createdAt: Date;

    @AllowNull(false)
    @Column({ type: DataType.STRING, defaultValue: '' })
        currentOwner: string;

    @Column({ type: DataType.INTEGER })
        marketplaceNftId: number;

    @Column({ type: DataType.DECIMAL })
        priceUsd: string;

    @Column({ type: DataType.BIGINT })
        priceAcudosValidUntil: string;
}
