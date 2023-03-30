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

    static fromJson(json: string): MintMemo {
        if (json === null) {
            return null;
        }

        const obj = JSON.parse(json);
        return new MintMemo(obj.uuid, obj.recipientAddress, obj.contractPaymentId, obj.ethTxHash);
    }
}
