import S from '../../../core/utilities/Main';

export enum WalletEventType {
    FEE = 'fee'
}

export enum WalletEventItemType {
    NFT = 'nft'
}

export default class WalletEventEntity {
    id: string;
    address: string;
    eventType: WalletEventType;
    itemType: WalletEventItemType;
    itemId: string;
    fromAddress: string;
    timestamp: number;

    constructor() {
        this.id = '';
        this.address = '';
        this.eventType = WalletEventType.FEE;
        this.itemType = WalletEventItemType.NFT;
        this.itemId = '';
        this.fromAddress = '';
        this.timestamp = S.NOT_EXISTS;
    }

    formatType(): string {
        switch (this.eventType) {
            case WalletEventType.FEE:
                return 'Fee';
            default:
                return '';
        }
    }

    // TODO: implement
    formatTimeSince(): string {
        return '1 minute ago';
    }

    static fromJson(json): WalletEventEntity {
        const entity = new WalletEventEntity();

        entity.id = json.id ?? entity.id;
        entity.address = json.address ?? entity.address;
        entity.eventType = json.eventType ?? entity.eventType;
        entity.itemType = json.itemType ?? entity.itemType;
        entity.itemId = json.itemId ?? entity.itemId;
        entity.fromAddress = json.fromAddress ?? entity.fromAddress;
        entity.timestamp = parseInt(json.timestamp ?? entity.timestamp.toString());

        return entity;
    }
}
