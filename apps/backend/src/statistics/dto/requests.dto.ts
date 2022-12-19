import NftEventFilterEntity from '../entities/nft-event-filter.entity'
import { NftEventFilterValidationJson } from '../statistics.types'

export class ReqTransferHistory {
    nftEventFilterEntity: NftEventFilterEntity;

    constructor(nftEventFilterJson: NftEventFilterValidationJson) {
        this.nftEventFilterEntity = NftEventFilterEntity.fromJson(nftEventFilterJson);
    }
}
