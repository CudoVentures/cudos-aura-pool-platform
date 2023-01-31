import AddressbookEntryEntity from '../../entities/AddressbookEntryEntity';
import NftEntity from '../../entities/NftEntity';
import PaymentEventEntity from '../../entities/PaymentEventEntity';

export default interface CudosChainRepo {
    fetchAddressbookEntry(cudosAddress: string): Promise < AddressbookEntryEntity >;
    sendOnDemandMintingTx(paymentEventEntity: PaymentEventEntity, nftEntity: NftEntity): Promise < void >;
}
