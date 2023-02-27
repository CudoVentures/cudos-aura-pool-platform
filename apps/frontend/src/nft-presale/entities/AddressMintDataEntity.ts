import S from '../../core/utilities/Main';
import { NftTier } from '../../nft/entities/NftEntity';

type NftMintData = {
    tier: NftTier,
    count: number
}

export default class AddressMintDataEntity {
    cudosAddress: string;
    nftMints: NftMintData[]

    constructor() {
        this.cudosAddress = S.Strings.EMPTY;
        this.nftMints = [];
    }

    static toJson(entity: AddressMintDataEntity): any {
        return {
            'cudosAddress': entity.cudosAddress,
            'nftMints': entity.nftMints.map((nftMintData) => JSON.stringify(nftMintData)),
        }
    }

    static fromJson(json: any): AddressMintDataEntity {
        if (!json.cudosAddress || !json.nftMints) {
            return null;
        }

        const entity = new AddressMintDataEntity();

        entity.cudosAddress = json.cudosAddress;
        entity.nftMints = json.nftMints.map((nftMintJson) => { return { tier: nftMintJson.tier, count: nftMintJson.count } });

        return entity;
    }
}
