import BigNumber from 'bignumber.js';
import { coin, DirectSecp256k1HdWallet } from 'cudosjs';
import { SigningStargateClient, StargateClient } from 'cudosjs/build/stargate';
import Config from '../../config/Config';
import AddressbookEntryEntity, { ADDRESSBOOK_LABEL, ADDRESSBOOK_NETWORK } from '../entities/AddressbookEntryEntity';
import NftEntity from '../entities/NftEntity';
import PaymentEventEntity from '../entities/PaymentEventEntity';
import PaymentTransactionEntity from '../entities/PaymentTransactionEntity';
import RefundTransactionEntity from '../entities/RefundTransactionEntity';
import CudosChainRepo from '../workers/repos/CudosChainRepo';
import { BankSendMsgToOnDemandMintingServiceQuery } from './dto/CudosAuraPoolServiceTxFilter';

export default class CudosChainRpcRepo implements CudosChainRepo {
    chainClient: StargateClient;
    chainSigningClient: SigningStargateClient;

    constructor(chainClient: StargateClient, chainSigningClient: SigningStargateClient) {
        this.chainClient = chainClient;
        this.chainSigningClient = chainSigningClient;
    }

    fetchCurrentBlockHeight(): Promise<number> {
        return this.chainClient.getHeight();
    }

    async fetchAddressbookEntry(cudosAddress: string): Promise<AddressbookEntryEntity> {
        const res = await this.chainClient.addressbookModule.getAddress(cudosAddress, ADDRESSBOOK_NETWORK, ADDRESSBOOK_LABEL);

        return AddressbookEntryEntity.fromChainQuery(res);
    }

    async fetchRefundTransactions(fromHeight: number, toHeight: number): Promise<RefundTransactionEntity[]> {
        const heightFilter = {
            minHeight: fromHeight,
            maxHeight: toHeight,
        };

        const indexedTxs = await this.chainClient.searchTx(BankSendMsgToOnDemandMintingServiceQuery, heightFilter)

        return indexedTxs.map((indexedTx) => RefundTransactionEntity.fromChainIndexedTx(indexedTx))
            .filter((entity) => {
                return entity.from === Config.MINTING_SERVICE_ADDRESS && Config.CUDOS_SIGNER_ADDRESS
            });
    }

    async fetchPaymentTransactionByTxhash(txHash: string): Promise<PaymentTransactionEntity> {
        const indexedTx = await this.chainClient.getTx(txHash);

        return PaymentTransactionEntity.fromChainIndexedTx(indexedTx);
    }

    async sendOnDemandMintingTx(paymentEventEntity: PaymentEventEntity, nftEntity: NftEntity): Promise<string> {
        const mintFee = (new BigNumber(200000)).multipliedBy(Config.CUDOS_GAS_PRICE);
        const amount = nftEntity.priceInAcudos.plus(mintFee);
        const sendAmountCoin = coin(amount.toFixed(0), 'acudos')

        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(Config.CUDOS_SIGNER_MNEMONIC);
        const [firstAccount] = await wallet.getAccounts();
        const signerAddress = firstAccount.address;

        const memo = `{
            "uuid":"${nftEntity.id}",
            "contractPaymentId": "${paymentEventEntity.id}",
            "recipientAddress": "${paymentEventEntity.cudosAddress}"
        }`;

        const tx = await this.chainSigningClient.sendTokens(signerAddress, Config.MINTING_SERVICE_ADDRESS, [sendAmountCoin], 'auto', memo);

        if (tx.code !== 0) {
            throw Error(`${tx.rawLog}`)
        }

        const txHash = tx.transactionHash;

        return txHash;
    }

}
