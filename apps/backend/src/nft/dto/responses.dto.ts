import BigNumber from 'bignumber.js';
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

export class ResUpdateNftCudosPrice {
    acudosPrice: string;

    constructor(acudosPrice: BigNumber) {
        this.acudosPrice = acudosPrice.toString(10);
    }
}

export class ResBuyNftWithEth {
    txhash: string;

    constructor(txHash: string) {
        this.txhash = txHash;
    }
}
