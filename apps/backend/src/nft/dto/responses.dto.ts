import NftEntity from '../entities/nft.entity';
import { NftJsonValidator } from '../nft.types';

export class ResFetchNftsByFilter {
    nftEntities: NftJsonValidator[];
    total: number;

    constructor(nftEntities: NftEntity[], total: number) {
        this.nftEntities = nftEntities.map((entity) => NftEntity.toJson(entity));
        this.total = total;
    }
}
