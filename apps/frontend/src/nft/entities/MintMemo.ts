export default class MintMemo {

    uuid: string;
    recipientAddress: string;
    contractPaymentId: string;

    constructor(uuid: string, recipientAddress: string) {
        this.uuid = uuid;
        this.recipientAddress = recipientAddress;
        this.contractPaymentId = '';
    }

    toJsonString(): string {
        return JSON.stringify(this);
    }

}
