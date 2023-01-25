import NftFilterModel from '../../utilities/NftFilterModel';

export class ReqFetchNftsByFilter {
    nftFilterJson: NftFilterModel;

    constructor(nftFilterModel: NftFilterModel) {
        this.nftFilterJson = NftFilterModel.toJson(nftFilterModel);
    }

}

export class ReqUpdateNftCudosPrice {
    id: string;

    constructor(id: string) {
        this.id = id;
    }
}

export class ReqBuyNftWithEth {
    id: string;
    signedTx: any;

    constructor(id: string, signedTx: any) {
        this.id = id;
        this.signedTx = signedTx;
    }
}
