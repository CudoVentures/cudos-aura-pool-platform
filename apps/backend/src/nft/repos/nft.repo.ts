import {
    Column,
    Model,
    Table,
    ForeignKey,
    PrimaryKey,
    Unique,
    IsDate,
    AllowNull,
    DataType,
    IsUUID,
} from 'sequelize-typescript';
import AccountRepo from '../../account/repos/account.repo';
import { CollectionRepo } from '../../collection/repos/collection.repo';
import { NftStatus } from '../nft.types';

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
    CURRENT_OWNER = 'current_owner',
    MARKETPLACE_NFT_ID = 'marketplace_nft_id',
}

@Table({
    freezeTableName: true,
    tableName: 'nfts',
    underscored: true,
})
export class NftRepo extends Model {
    @PrimaryKey
    @Unique
    @IsUUID(4)
    @Column({
        type: DataType.UUID,
    })
        id: string;

    @AllowNull(false)
    @Column
        name: string;

    @Column
        uri: string;

    @Column
        data: string;

    @AllowNull(false)
    @Column
        hashingPower: number;

    @AllowNull(false)
    @Column
        price: string;

    @AllowNull(false)
    @IsDate
    @Column
        expirationDate: Date;

    @AllowNull(false)
    @Column(DataType.ENUM(
        NftStatus.MINTED,
        NftStatus.QUEUED,
        NftStatus.REMOVED,
    ))
        status: NftStatus;

    @AllowNull(true)
    @Column
        tokenId: string

    @Column
    @ForeignKey(() => CollectionRepo)
        collectionId: number;

    @AllowNull(false)
    @Column
    @ForeignKey(() => AccountRepo)
        creatorId: number;

    @Column
        deletedAt: Date;

    @AllowNull(false)
    @Column
        currentOwner: string;

    @Column
        marketplaceNftId: number;
}
