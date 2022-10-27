import CollectionEventEntity from '../../entities/CollectionEventEntity';
import CollectionEventFilterModel from '../../entities/CollectionEventFilterModel';

export default interface PoolEventRepo {
    fetchCollectionEventsByFilter(collectionEventFilterModel: CollectionEventFilterModel): Promise < { collectionEventEntities: CollectionEventEntity[], total: number } >;
}
