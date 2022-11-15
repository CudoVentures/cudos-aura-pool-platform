export class TransferHistoryEntry {
    from: string;

    to: string;

    timestamp: number;
    
    eventType: string;
    
    price?: number;

    usdPrice?: number;

    btcPrice?: number;
}
