import PurchaseTransactionEntity from '../../entities/PurchaseTransactionEntity';
import PurchaseTransactionsFilterModel from '../../entities/PurchaseTransactionsFilterModel';
import axios from '../../../core/utilities/AxiosWrapper';
import NftEntity from '../../entities/NftEntity';
import NftFilterModel from '../../utilities/NftFilterModel';
import { ReqFetchNftsByFilter, ReqFetchPurchaseTransactions, ReqUpdateNftCudosPrice } from '../dto/Requests';
import { ResFetchNftsByFilter, ResFetchPresaleAmounts, ResFetchPurchaseTransactions, ResUpdateNftCudosPrice } from '../dto/Responses';

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
        const req = new ReqFetchPurchaseTransactions(purchaseTransactionsFilterModel, sessionStoragePurchaseTransactionEntities);

        const { data } = await axios.put(`${NftApi.nftModuleUrl}/fetchPurchaseTransactions`, req);

        const res = new ResFetchPurchaseTransactions(data);

        return { purchaseTransactionEntities: res.purchaseTransactionEntities, total: res.total };
    }

}
