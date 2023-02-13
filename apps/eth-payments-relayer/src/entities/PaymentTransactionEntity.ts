import { decodeTxRaw, IndexedTx } from 'cudosjs';
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';

import Config from '../../config/Config';

type PaymentMemo = {
    uuid: string,
    contractPaymentId: number,
    recipientAddress: string
}

export default class PaymentTransactionEntity {
    txBody: TxBody;
    from: string;
    to: string;
    nftId: string;
    contractPaymentId: number;
    recipientAddress: string;

    constructor() {
        this.txBody = null;
        this.from = '';
        this.to = '';
        this.nftId = '';
        this.contractPaymentId = null;
        this.recipientAddress = '';
    }

    isValid(): boolean {
        return this.txBody !== null
            && this.txBody.messages.length === 1
            && this.from === Config.CUDOS_SIGNER_ADDRESS
            && this.to === Config.MINTING_SERVICE_ADDRESS
            && this.nftId !== ''
            && this.contractPaymentId !== null
            && this.recipientAddress !== '';
    }

    static fromChainIndexedTx(chainTx: IndexedTx): PaymentTransactionEntity {
        const entity = new PaymentTransactionEntity();
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

        let memoJson: PaymentMemo
        try {
            memoJson = JSON.parse(txBody.memo);
        } catch (e) {
            throw Error(`Failed parse payment send memo: \n\tMemo: ${txBody.memo}\n\tError: ${e}`);
        }

        // if (!memoJson.contractPaymentId || !memoJson.recipientAddress || !memoJson.uuid) {
        //         throw Error(`Missing paymend send memo property: \n\tOriginal memo: ${txBody.memo}\n\tParsed memo json: ${memoJson}`);
        // }

        entity.txBody = txBody;
        entity.from = bankSendMessage.fromAddress;
        entity.to = bankSendMessage.toAddress;
        entity.nftId = memoJson.uuid;
        entity.recipientAddress = memoJson.recipientAddress;
        entity.contractPaymentId = memoJson.contractPaymentId;

        return entity;
    }
}
