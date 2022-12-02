import {
    Column,
    Model,
    Table,
    BelongsTo,
    ForeignKey,
    PrimaryKey,
    Unique,
    IsDate,
    AllowNull,
    DataType,
    IsUUID,
} from 'sequelize-typescript';
import AccountRepo from '../account/repos/account.repo';
import { Collection } from '../collection/collection.model';
import { NftStatus } from './nft.types';

export enum ListStatus {
    NOT_LISTED = 1,
    LISTED = 2,
}

@Table({
    freezeTableName: true,
    tableName: 'nfts',
})
export class NFT extends Model {
    @PrimaryKey
    @Unique
    @IsUUID(4)
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
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
        hashing_power: number;

    @AllowNull(false)
    @Column
        price: string;

    @AllowNull(false)
    @IsDate
    @Column
        expiration_date: Date;

    @AllowNull(false)
    @Column(DataType.ENUM(
        NftStatus.MINTED,
        NftStatus.QUEUED,
        NftStatus.REMOVED,
    ))
        status: NftStatus;

    @AllowNull(true)
    @Column
        token_id: string

    @Column
    @ForeignKey(() => Collection)
        collection_id: number;

    @BelongsTo(() => Collection)
        collection: Collection;

    @AllowNull(false)
    @Column
    @ForeignKey(() => AccountRepo)
        creator_id: number;

    @BelongsTo(() => AccountRepo)
        creator: AccountRepo;

    @Column
        deleted_at: Date;

    @AllowNull(false)
    @Column
        current_owner: string;

    listedStatus: ListStatus;
    creatorAddress: string;

    constructor(...args) {
        super(...args);
        this.listedStatus = ListStatus.NOT_LISTED;
        this.creatorAddress = '';
    }

    isMinted(): boolean {
        return this.token_id !== ''
    }

}
