import CollectionEventEntity from '../../entities/CollectionEventEntity';
import CollectionEventFilterModel from '../../entities/CollectionEventFilterModel';

export default class PoolEventApi {
    fetchCollectionEventsByFilter(collectionEventFilterModel: CollectionEventFilterModel): Promise<{ collectionEventEntities: CollectionEventEntity[]; total: number; }> {
        return null;
    }
}
