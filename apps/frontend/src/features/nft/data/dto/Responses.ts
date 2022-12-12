import NftEntity from '../../entities/NftEntity'

export class ResFetchNftsByFilter {
    nftEntities: NftEntity[];
    total: number;

    constructor(data) {
        this.nftEntities = data.nftEntities.map((json) => NftEntity.fromJson(json));
        this.total = data.total;
    }
}
