import CollectionEntity from '../../entities/CollectionEntity';

export default class CollectionSessionStorage {
    static KEY = 'collections'

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
        const mapJson = sessionStorage.getItem(CollectionSessionStorage.KEY);
        const map = new Map<string, CollectionEntity>(JSON.parse(mapJson));

        return map
    }

    private saveCollectionsMap(map: Map<string, CollectionEntity>) {
        sessionStorage.setItem(CollectionSessionStorage.KEY, JSON.stringify(Array.from(map.entries())));
    }
}
