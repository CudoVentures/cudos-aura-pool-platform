export type GraphQlNftCollection = {
    data_text?: string;
    description?: string;
    id: string;
    minter?: string;
    name: string;
    owner: string;
    schema: string;
    symbol: string;
    traits?: string;
    transaction_hash: string;
    data_json?: {
        farm_id: string,
        platform_royalties_address: string,
        farm_mint_royalties_address: string,
        farm_resale_royalties_address: string
    }
}

export default class ChainNftCollectionEntity {
    data: string;
    description: string;
    id: string;
    minter: string;
    name: string;
    owner: string;
    schema: string;
    symbol: string;
    traits: string;
    transactionHash: string;
    farmId: string;
    platformRoyaltiesAddress: string;
    farmMintRoyaltiesAddress: string;
    farmResaleRoyaltiesAddress: string;

    constructor() {
        this.data = '';
        this.description = '';
        this.id = '';
        this.minter = '';
        this.name = '';
        this.owner = '';
        this.schema = '';
        this.symbol = '';
        this.traits = '';
        this.transactionHash = '';
        this.farmId = '';
        this.platformRoyaltiesAddress = '';
        this.farmMintRoyaltiesAddress = '';
        this.farmResaleRoyaltiesAddress = '';
    }

    isPlatformCollection(): boolean {
        return this.farmId !== '';
    }

    static fromGraphQl(queryCollection: GraphQlNftCollection): ChainNftCollectionEntity {
        const collectionDto = new ChainNftCollectionEntity();

        collectionDto.data = queryCollection.data_text ?? collectionDto.data;
        collectionDto.description = queryCollection.description ?? collectionDto.description;
        collectionDto.id = queryCollection.id ?? collectionDto.id;
        collectionDto.minter = queryCollection.minter ?? collectionDto.minter;
        collectionDto.name = queryCollection.name ?? collectionDto.name;
        collectionDto.owner = queryCollection.owner ?? collectionDto.owner;
        collectionDto.schema = queryCollection.schema ?? collectionDto.schema;
        collectionDto.symbol = queryCollection.symbol ?? collectionDto.symbol;
        collectionDto.traits = queryCollection.traits ?? collectionDto.traits;
        collectionDto.transactionHash = queryCollection.transaction_hash ?? collectionDto.transactionHash;

        const dataJson = queryCollection.data_json;

        collectionDto.farmId = dataJson?.farm_id ?? collectionDto.farmId;
        collectionDto.platformRoyaltiesAddress = dataJson?.platform_royalties_address ?? collectionDto.platformRoyaltiesAddress;
        collectionDto.farmMintRoyaltiesAddress = dataJson?.farm_mint_royalties_address ?? collectionDto.farmMintRoyaltiesAddress;
        collectionDto.farmResaleRoyaltiesAddress = dataJson?.farm_resale_royalties_address ?? collectionDto.farmResaleRoyaltiesAddress;

        return collectionDto;

    }
}
