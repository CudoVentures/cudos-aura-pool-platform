import AddressMintDataEntity from '../../../nft-presale/entities/AddressMintDataEntity';
import MintDataEntity from '../../../nft-presale/entities/MintDataEntity';
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
