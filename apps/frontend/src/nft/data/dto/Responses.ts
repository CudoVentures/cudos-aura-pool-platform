import BigNumber from 'bignumber.js';
import NftEntity from '../../entities/NftEntity'

export class ResFetchNftsByFilter {
    nftEntities: NftEntity[];
    total: number;

    constructor(data) {
        this.nftEntities = data.nftEntities.map((json) => NftEntity.fromJson(json));
        this.total = data.total;
    }
}

export class ResUpdateNftCudosPrice {
    acudosPrice: BigNumber;
    ethPrice: BigNumber;

    constructor(data) {
        this.acudosPrice = new BigNumber(data.acudosPrice);
        this.ethPrice = new BigNumber(data.ethPrice);
    }
}

export class ResBuyNftWithEth {
    txhash: string;

    constructor(data) {
        this.txhash = data.txHash;
    }
}
