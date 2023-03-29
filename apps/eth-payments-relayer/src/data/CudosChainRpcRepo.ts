import BigNumber from 'bignumber.js';
import { coin, CURRENCY_DECIMALS, DirectSecp256k1HdWallet } from 'cudosjs';
import { SigningStargateClient, StargateClient } from 'cudosjs/build/stargate';
import Config from '../../config/Config';
import AddressbookEntryEntity, { ADDRESSBOOK_LABEL, ADDRESSBOOK_NETWORK } from '../entities/AddressbookEntryEntity';
import MintMemo from '../entities/MintMemo';
import PaymentEventEntity from '../entities/PaymentEventEntity';
import PaymentTransactionEntity from '../entities/PaymentTransactionEntity';
import RefundTransactionEntity from '../entities/RefundTransactionEntity';
import CudosChainRepo from '../workers/repos/CudosChainRepo';
import { getBankSendMsgToOnDemandMintingServiceQuery } from './dto/CudosAuraPoolServiceTxFilter';

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
        try {
            const res = await this.chainClient.addressbookModule.getAddress(cudosAddress, ADDRESSBOOK_NETWORK, ADDRESSBOOK_LABEL);
            return AddressbookEntryEntity.fromChainQuery(res);
        } catch (e) {
            return null;
        }
    }

    async fetchRefundTransactions(fromHeight: number, toHeight: number): Promise<RefundTransactionEntity[]> {
        const heightFilter = {
            minHeight: fromHeight,
            maxHeight: toHeight,
        };

        const indexedTxs = await this.chainClient.searchTx(await getBankSendMsgToOnDemandMintingServiceQuery(), heightFilter)

        const cudosSignerAddress = await Config.getCudosSignerAddress();
        return indexedTxs.map((indexedTx) => RefundTransactionEntity.fromChainIndexedTx(indexedTx)).filter((entity) => {
            return entity.from === Config.MINTING_SERVICE_ADDRESS && entity.to === cudosSignerAddress;
        });
    }

    async fetchPaymentTransactionByTxhash(txHash: string): Promise<PaymentTransactionEntity> {
        try {
            const indexedTx = await this.chainClient.getTx(txHash);
            return indexedTx ? PaymentTransactionEntity.fromChainIndexedTx(indexedTx) : null;
        } catch (ex) {
            if (ex.toString().indexOf('parse error') !== -1) {
                return null;
            }

            throw ex;
        }
    }

    async sendOnDemandMintingTx(paymentEventEntity: PaymentEventEntity, convertedPaymentToCudos: BigNumber): Promise<string> {
        const mintFee = (new BigNumber(200000)).multipliedBy(Config.CUDOS_GAS_PRICE);
        const amount = convertedPaymentToCudos.shiftedBy(CURRENCY_DECIMALS).plus(mintFee);
        const sendAmountCoin = coin(amount.toFixed(0), 'acudos')

        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(Config.CUDOS_SIGNER_MNEMONIC);
        const [firstAccount] = await wallet.getAccounts();
        const signerAddress = firstAccount.address;
        const mintMemo = new MintMemo('presale', paymentEventEntity.cudosAddress, paymentEventEntity.id.toString(), paymentEventEntity.txHash)

        const tx = await this.chainSigningClient.sendTokens(signerAddress, Config.MINTING_SERVICE_ADDRESS, [sendAmountCoin], 'auto', JSON.stringify(MintMemo.toJson(mintMemo)));

        if (tx.code !== 0) {
            throw Error(`${tx.rawLog}`)
        }

        const txHash = tx.transactionHash;

        return txHash;
    }

}
