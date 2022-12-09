import { IntBoolValue, parseIntBoolValue } from '../../common/utils';

export type GraphQlNftNft = {
    owner: string;
    sender: string;
    uri: string;
    transaction_hash: string;
    name: string;
    id: string;
    denom_id: string;
    burned?: boolean;
    contract_address_signer: string;
    data_text: string;
}

export class ChainNftNftDto {
    tokenId: string;
    owner: string;
    uri: string;
    name: string;
    burned: IntBoolValue;
    data: string;

    constructor() {
        this.tokenId = '';
        this.owner = '';
        this.uri = '';
        this.name = '';
        this.burned = IntBoolValue.FALSE;
        this.data = '';
    }

    static fromQuery(queryNft: GraphQlNftNft): ChainNftNftDto {
        const nftDto = new ChainNftNftDto();

        nftDto.tokenId = queryNft.id ?? nftDto.tokenId;
        nftDto.owner = queryNft.owner ?? nftDto.owner;
        nftDto.uri = queryNft.uri ?? nftDto.uri;
        nftDto.name = queryNft.name ?? nftDto.name;
        nftDto.burned = parseIntBoolValue(queryNft.burned ?? nftDto.burned);
        nftDto.data = queryNft.data_text ?? nftDto.data;

        return nftDto;

    }
}
