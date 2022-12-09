import NftFilterModel from '../../utilities/NftFilterModel';

export class ReqFetchNftsByFilter {
    nftFilterModel: NftFilterModel;

    constructor(nftFilterModel: NftFilterModel) {
        this.nftFilterModel = NftFilterModel.toJson(nftFilterModel);
    }

}
