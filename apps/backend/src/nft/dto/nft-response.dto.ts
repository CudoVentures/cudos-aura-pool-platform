export class NFTResponseDto {
    id: string;
    
    name: string;
    
    uri: string;
    
    data: NFTMetadata;
    
    price: number;
    
    collection_id: number;
}

class NFTMetadata {
    hash_rate_owned: number;

    expiration_date: number;
}