export class TransferHistoryEntity {
    denomId: string;
    tokenId: string;
    seller: string;
    buyer: string;
    timestamp: number;
    eventType: string;
    price: string;
    usdPrice: string;
    btcPrice: string;
    acudosPrice: string;

    static toJson(m: any): any {
        return m;
    }
}
