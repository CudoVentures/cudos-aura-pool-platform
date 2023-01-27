import NftEntity from '../../entities/NftEntity';

const STORAGE_KEY = 'cudos_aura_service_storage_nfts'

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
            map.set(key, jsonEntity);
        });

        return map
    }

    private saveNftsMap(map: Map<string, NftEntity>) {
        const jsonEntities = Array.from(map.entries());

        jsonEntities.forEach((entry) => {
            entry[1] = NftEntity.fromJson(entry[1]);
        });

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(jsonEntities));
    }
}