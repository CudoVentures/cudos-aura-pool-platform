import CollectionEventEntity from '../../entities/CollectionEventEntity';
import CollectionEventFilterModel from '../../entities/CollectionEventFilterModel';
import PoolEventRepo from '../../presentation/repos/PoolEventRepo';
import PoolEventApi from '../data-sources/PoolEventApi';

export default class PoolEventApiRepo implements PoolEventRepo {

    poolEventApi: PoolEventApi;

    constructor() {
        this.poolEventApi = new PoolEventApi();
    }

    fetchCollectionEventsByFilter(collectionEventFilterModel: CollectionEventFilterModel): Promise<{ collectionEventEntities: CollectionEventEntity[]; total: number; }> {
        return this.poolEventApi.fetchCollectionEventsByFilter(collectionEventFilterModel);
    }
}
