export default class MintMemo {

    uuid: string;
    recipientAddress: string;
    contractPaymentId: string;
    ethTxHash: string;

    constructor() {
        this.uuid = '';
        this.recipientAddress = '';
        this.contractPaymentId = '';
        this.ethTxHash = '';
    }

    static fromJson(json: any): MintMemo {
        if (json === null) {
            return null;
        }

        const entity = new MintMemo();

        entity.uuid = json.uuid ?? entity.uuid;
        entity.recipientAddress = json.recipientAddress ?? entity.recipientAddress;
        entity.contractPaymentId = json.contractPaymentId ?? entity.contractPaymentId;
        entity.ethTxHash = json.ethTxHash ?? entity.ethTxHash;

        return entity;
    }
}
