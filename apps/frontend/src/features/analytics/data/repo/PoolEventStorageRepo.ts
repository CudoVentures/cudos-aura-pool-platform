import BigNumber from 'bignumber.js';
import CollectionEventEntity from '../../entities/CollectionEventEntity';
import CollectionEventFilterModel from '../../entities/CollectionEventFilterModel';
import PoolEventRepo from '../../presentation/repos/PoolEventRepo';

export default class PoolEventStorageRepo implements PoolEventRepo {

    async fetchCollectionEventsByFilter(collectionEventFilterModel: CollectionEventFilterModel): Promise<{ collectionEventEntities: CollectionEventEntity[]; total: number; }> {
        const collectionEventEntities = [];

        for (let i = 0; i < 10; i++) {
            const collectionEventEntity = new CollectionEventEntity();
            collectionEventEntity.collectionEventId = `${i + 1}`;
            collectionEventEntity.collectionId = `${i + 1}`;
            collectionEventEntity.fromAddress = 'cudos1veuwr0t46fknaymy2q6yzmhcn2e0kfmdftsnws';
            collectionEventEntity.toAddress = 'cudos1veuwr0t46fknaymy2q6yzmhcn2e0kfmdftsnws';
            collectionEventEntity.activity = 2;
            collectionEventEntity.quantity = 10 + i;
            collectionEventEntity.timestamp = Date.now() - (1000 * 60 * 60 * i);
            collectionEventEntity.transferPrice = new BigNumber(1000 * i);

            collectionEventEntities.push(collectionEventEntity);
        }

        return { collectionEventEntities, total: 10 };
    }

}
