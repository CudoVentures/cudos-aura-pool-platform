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
}

export class ChainNftCollectionDto {
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
    }

    static fromQuery(queryCollection: GraphQlNftCollection): ChainNftCollectionDto {
        const collectionDto = new ChainNftCollectionDto();

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

        return collectionDto;

    }
}
