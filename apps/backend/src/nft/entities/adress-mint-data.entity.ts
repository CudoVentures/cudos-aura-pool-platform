import { NftGroup } from '../nft.types';

type NftMintEntity = {
    group: NftGroup,
    count: number,
}

export default class AddressMintDataEntity {
    cudosAddress: string;
    nftMints: NftMintEntity[];

    constructor() {
        this.cudosAddress = '';
        this.nftMints = null;
    }

    static fromJson(json) {
        const entity = new AddressMintDataEntity();

        entity.cudosAddress = json.cudosAddress || entity.cudosAddress;
        entity.nftMints = json.nftMints?.map((nftMintJson) => {
            return {
                group: nftMintJson.group,
                count: nftMintJson.count,
            }
        })

        return entity;
    }
}
