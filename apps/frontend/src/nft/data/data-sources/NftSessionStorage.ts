import PurchaseTransactionEntity from '../../entities/PurchaseTransactionEntity';
import NftEntity from '../../entities/NftEntity';

const STORAGE_KEY = 'cudos_aura_service_storage_nfts'
const PURCHASE_TRANSACTIONS_KEY = 'cudos_aura_service_storage_purcahse_transactions'

export default class NftSessionStorage {

    updateNftsMap(nfts: NftEntity[]): void {
        try {
            const timestampMap = this.getNftsMap();

            nfts.forEach((nftEntity: NftEntity) => {
                timestampMap.set(nftEntity.id, nftEntity);
            });

            this.saveNftsMap(timestampMap);
        } catch (e) {
            console.log(e);
        }
    }

    getNftsMap(): Map<string, NftEntity> {
        const mapJson = sessionStorage.getItem(STORAGE_KEY);

        if (!mapJson) {
            return new Map<string, NftEntity>();
        }

        const parsedMap = JSON.parse(mapJson);
        const map = new Map<string, NftEntity>(parsedMap);
        map.forEach((jsonEntity, key) => {
            map.set(key, NftEntity.fromJson(jsonEntity));
        });

        return map
    }

    private saveNftsMap(map: Map<string, NftEntity>) {
        const jsonEntities = Array.from(map.entries());

        jsonEntities.forEach((entry) => {
            entry[1] = NftEntity.toJson(entry[1]);
        });

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(jsonEntities));
    }

    onNewPurchase(txHash: string) {
        const purchaseTransactionEntity = new PurchaseTransactionEntity();
        purchaseTransactionEntity.txhash = txHash;
        purchaseTransactionEntity.timestamp = Date.now();

        this.updatePurchaseTxsMap([purchaseTransactionEntity]);
    }

    clearPurchaseMap() {
        sessionStorage.removeItem(PURCHASE_TRANSACTIONS_KEY);
    }

    updatePurchaseTxsMap(purchaseTransactionEntities: PurchaseTransactionEntity[]): void {
        try {
            const purchaseTransactionEntitiesMap = this.getPurchaseTxsMap();

            purchaseTransactionEntities.forEach((purchaseTransactionEntity: PurchaseTransactionEntity) => {
                purchaseTransactionEntitiesMap.set(purchaseTransactionEntity.txhash, purchaseTransactionEntity);
            });

            this.savePurchaseTxsMap(purchaseTransactionEntitiesMap);
        } catch (e) {
            console.log(e);
        }
    }

    getPurchaseTxsMap(): Map<string, PurchaseTransactionEntity> {
        const mapJson = sessionStorage.getItem(PURCHASE_TRANSACTIONS_KEY);

        if (!mapJson) {
            return new Map<string, PurchaseTransactionEntity>();
        }

        const parsedMap = JSON.parse(mapJson);
        const map = new Map<string, PurchaseTransactionEntity>(parsedMap);
        map.forEach((jsonEntity, key) => {
            map.set(key, PurchaseTransactionEntity.fromJson(jsonEntity));
        });

        return map
    }

    private savePurchaseTxsMap(map: Map<string, any>) {
        const jsonEntities = Array.from(map.entries());

        jsonEntities.forEach((entry) => {
            entry[1] = PurchaseTransactionEntity.toJson(entry[1]);
        });

        sessionStorage.setItem(PURCHASE_TRANSACTIONS_KEY, JSON.stringify(jsonEntities));
    }
}
