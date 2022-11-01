import CollectionEventEntity from '../../entities/CollectionEventEntity';
import CollectionEventFilterModel from '../../entities/CollectionEventFilterModel';
import StatisticsRepo from '../../presentation/repos/StatisticsRepo';
import StatisticsApi from '../data-sources/StatisticsApi';

export default class StatisticsApiRepo implements StatisticsRepo {

    statisticsApi: StatisticsApi;

    constructor() {
        this.statisticsApi = new StatisticsApi();
    }

    fetchCollectionEventsByFilter(collectionEventFilterModel: CollectionEventFilterModel): Promise<{ collectionEventEntities: CollectionEventEntity[]; total: number; }> {
        return this.statisticsApi.fetchCollectionEventsByFilter(collectionEventFilterModel);
    }
}
