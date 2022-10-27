import CollectionEventFilterModel from '../../entities/CollectionEventFilterModel';
import PoolEventRepo from '../../presentation/repos/PoolEventRepo';

export default class PoolEventStorageRepo implements PoolEventRepo {

    fetchCollectionEventsByFilter(collectionEventFilterModel: CollectionEventFilterModel): Promise<{ collectionEventEntities: CollectionEventEntity[]; total: number; }> {
        throw new Error('Method not implemented.');
    }

}
