export class TransferHistoryEntry {
    nftId: string;
    from: string;
    to: string;
    timestamp: number;
    eventType: string;
    price?: number;
    usdPrice?: number;
    btcPrice?: number;
    acudosPrice?: number;
}
