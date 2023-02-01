import { decodeTxRaw, IndexedTx } from 'cudosjs';
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';

import Config from '../../config/Config';

export default class RefundTransactionEntity {
    txBody: TxBody;
    from: string;
    to: string;
    refundedTxHash: string;

    constructor() {
        this.txBody = null;
        this.from = '';
        this.to = '';
        this.refundedTxHash = '';
    }

    isValid(): boolean {
        return this.txBody !== null
            && this.txBody.messages.length === 1
            && this.from === Config.MINTING_SERVICE_ADDRESS
            && this.to === Config.CUDOS_SIGNER_ADDRESS
            && this.refundedTxHash !== '';
    }

    static fromChainIndexedTx(chainTx: IndexedTx): RefundTransactionEntity {
        const entity = new RefundTransactionEntity();
        const txBody = decodeTxRaw(chainTx.tx).body;

        // not an expected refund tx
        if (txBody.messages.length !== 1) {
            throw Error(`Invalid refund TX: Tx has more than one message.\n\tTxBody: ${txBody}`);
        }

        const message = txBody.messages[0];
        let bankSendMessage;
        try {
            bankSendMessage = MsgSend.decode(message.value);
        } catch (e) {
            throw Error(`Failed to decode msg into send msg: \n\tTxBody: ${txBody}\n\tError: ${e}`);
        }

        entity.txBody = txBody;
        entity.from = bankSendMessage.toAddress;
        entity.to = bankSendMessage.fromAddress;
        entity.refundedTxHash = txBody.memo;

        return entity;
    }
}
