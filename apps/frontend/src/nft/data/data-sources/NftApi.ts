import PurchaseTransactionEntity from '../../../accounts/entities/PurchaseTransactionEntity';
import PurchaseTransactionsFilterModel from '../../../accounts/entities/PurchaseTransactionsFilterModel';
import axios from '../../../core/utilities/AxiosWrapper';
import AddressMintDataEntity from '../../../nft-presale/entities/AddressMintDataEntity';
import MintDataEntity from '../../../nft-presale/entities/MintDataEntity';
import NftEntity from '../../entities/NftEntity';
import NftFilterModel from '../../utilities/NftFilterModel';
import { ReqFetchNftsByFilter, ReqFetchPurchaseTransactions, ReqMintPresaleNfts, ReqUpdateNftCudosPrice } from '../dto/Requests';
import { ResFetchNftsByFilter, ResFetchPresaleAmounts, ResFetchPurchaseTransactions, ResMintPresaleNfts, ResUpdateNftCudosPrice } from '../dto/Responses';

export default class NftApi {

    static nftModuleUrl = '/api/v1/nft';

    async fetchNftsByFilter(nftFilterModel: NftFilterModel): Promise < { nftEntities: NftEntity[], total: number } > {
        const req = new ReqFetchNftsByFilter(nftFilterModel);

        const { data } = await axios.post(NftApi.nftModuleUrl, req);

        const res = new ResFetchNftsByFilter(data);

        return {
            nftEntities: res.nftEntities,
            total: res.total,
        }
    }

    async updateNftCudosPrice(id: string): Promise < NftEntity > {
        const req = new ReqUpdateNftCudosPrice(id);

        const { data } = await axios.post(`${NftApi.nftModuleUrl}/updatePrice`, req);

        const res = new ResUpdateNftCudosPrice(data);

        return res.nftEntity;
    }

    async fetchPresaleAmounts(): Promise < { totalPresaleNftCount: number, presaleMintedNftCount } > {
        const { data } = await axios.get(`${NftApi.nftModuleUrl}/fetchPresaleAmounts`);

        const res = new ResFetchPresaleAmounts(data);

        return { totalPresaleNftCount: res.totalPresaleNftCount, presaleMintedNftCount: res.presaleMintedNftCount };
    }

    async fetchPurchaseTransactions(purchaseTransactionsFilterModel: PurchaseTransactionsFilterModel, sessionStoragePurchaseTransactionEntities: PurchaseTransactionEntity[]): Promise<{ purchaseTransactionEntities: PurchaseTransactionEntity[]; total: number; }> {
        // const req = new ReqFetchPurchaseTransactions(purchaseTransactionsFilterModel, sessionStoragePurchaseTransactionEntities);

        // const { data } = await axios.post(`${NftApi.nftModuleUrl}/fetchPurchaseTransactions`, req);

        // const res = new ResFetchPurchaseTransactions(data);

        // return { purchaseTransactionEntities: res.purchaseTransactionEntities, total: res.total };
        const purchaseTransactions: PurchaseTransactionEntity[] = []

        for (let i = 0; i < 100; i++) {
            const purchaseTransaction = new PurchaseTransactionEntity();
            purchaseTransaction.txhash = `wgw2323tmewgkeflwbwelgweawehaerh;erhmerh${i}`;
            purchaseTransaction.timestamp = Date.now() - i;

            purchaseTransactions.push(purchaseTransaction);
        }

        return {
            purchaseTransactionEntities: purchaseTransactions.slice(purchaseTransactionsFilterModel.from, purchaseTransactionsFilterModel.from + purchaseTransactionsFilterModel.count),
            total: 100,
        }
    }

}
