import CollectionEntity from '../../entities/CollectionEntity';

const STORAGE_KEY = 'cudos_aura_service_storage_collections'

export default class CollectionSessionStorage {

    updateCollectionsMap(collections: CollectionEntity[]): void {
        try {
            const collectionsMap = this.getCollectionsMap();

            collections.forEach((collectionEntity: CollectionEntity) => {
                collectionsMap.set(collectionEntity.id, collectionEntity);
            });

            this.saveCollectionsMap(collectionsMap);
        } catch (e) {
            console.log(e);
        }
    }

    getCollectionsMap(): Map<string, CollectionEntity> {
        const mapJson = sessionStorage.getItem(STORAGE_KEY);
        const map = new Map<string, CollectionEntity>(JSON.parse(mapJson));
        map.forEach((jsonEntity, key) => {
            map.set(key, CollectionEntity.fromJson(jsonEntity));
        });

        return map
    }

    private saveCollectionsMap(map: Map<string, CollectionEntity>) {
        const jsonEntities = Array.from(map.entries())
        jsonEntities.forEach((entry) => {
            entry[1] = CollectionEntity.fromJson(entry[1]);
        })
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(jsonEntities));
    }
}
