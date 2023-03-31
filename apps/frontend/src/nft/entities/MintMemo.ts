export default class MintMemo {

    uuid: string;
    recipientAddress: string;
    contractPaymentId: string;
    ethTxHash: string;

    constructor(uuid: string, recipientAddress: string) {
        this.uuid = uuid;
        this.recipientAddress = recipientAddress;
        this.contractPaymentId = '';
        this.ethTxHash = '';
    }

    toJsonString(): string {
        return JSON.stringify(this);
    }

}
