import { IsNumber, IsString } from 'class-validator';
import NftEventFilterEntity from '../entities/nft-event-filter.entity'
import { NftEventFilterValidationJson } from '../statistics.types'

export class ReqTransferHistory {
    // nftEventFilterEntity: NftEventFilterEntity;

    // constructor(nftEventFilterJson: NftEventFilterValidationJson) {
    //     this.nftEventFilterEntity = NftEventFilterEntity.fromJson(nftEventFilterJson);
    // }
}

export class ReqFetchNftEarningsBySessionAccount {

    @IsNumber()
        timestampFrom: number;

    @IsNumber()
        timestampTo: number;

}

export class ReqFetchNftEarningsByNftId {

    @IsString()
        nftId: string;

    @IsNumber()
        timestampFrom: number;

    @IsNumber()
        timestampTo: number;

}

export class ReqFetchNftEarningsByMiningFarmId {

    @IsString()
        miningFarmId: string;

    @IsNumber()
        timestampFrom: number;

    @IsNumber()
        timestampTo: number;

}
