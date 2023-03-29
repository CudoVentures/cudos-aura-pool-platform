export default class MintMemo {

    uuid: string;
    recipientAddress: string;
    contractPaymentId: string;
    ethTxHash: string;

    constructor(uuid: string, recipientAddress: string, contractPaymentId: string, ethTxHash: string) {
        this.uuid = uuid;
        this.recipientAddress = recipientAddress;
        this.contractPaymentId = contractPaymentId;
        this.ethTxHash = ethTxHash;
    }

    static toJson(entity: MintMemo) {
        if (entity === null) {
            return null;
        }

        return {
            'uuid': entity.uuid,
            'recipientAddress': entity.recipientAddress,
            'contractPaymentId': entity.contractPaymentId,
            'ethTxHash': entity.ethTxHash,
        }
    }
}
