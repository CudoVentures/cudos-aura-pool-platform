import { decodeTxRaw, IndexedTx } from 'cudosjs';
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';

import Config from '../../config/Config';
import MintMemo from './MintMemo';

export default class PaymentTransactionEntity {
    txBody: TxBody;
    from: string;
    to: string;
    nftId: string;
    contractPaymentId: number;
    recipientAddress: string;
    ethTxHash: string;

    constructor() {
        this.txBody = null;
        this.from = '';
        this.to = '';
        this.nftId = '';
        this.contractPaymentId = null;
        this.recipientAddress = '';
        this.ethTxHash = '';
    }

    async isValid(): Promise < boolean > {
        const cudosSignerAddress = await Config.getCudosSignerAddress();

        return this.txBody !== null
            && this.txBody.messages.length === 1
            && this.from === cudosSignerAddress
            && this.to === Config.MINTING_SERVICE_ADDRESS
            && this.nftId !== ''
            && this.contractPaymentId !== null
            && this.recipientAddress !== ''
            && this.ethTxHash !== '';
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

        let memoJson: MintMemo
        try {
            memoJson = MintMemo.fromJson(txBody.memo);
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
        entity.contractPaymentId = parseInt(memoJson.contractPaymentId);
        entity.ethTxHash = memoJson.ethTxHash;

        return entity;
    }
}
