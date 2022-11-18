import NftEntity from '../../../nft/entities/NftEntity';
import CategoryEntity from '../../entities/CategoryEntity';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';
import CollectionFilterModel from '../../utilities/CollectionFilterModel';

export default interface CollectionRepo {

    setPresentationCallbacks(enableActions: () => void, disableActions: () => void);

    fetchCategories(): Promise < CategoryEntity[] >;
    fetchTopCollections(timestampFrom: number, timestampTo: number, status?: CollectionStatus): Promise < CollectionEntity[] >;
    fetchCollectionsByIds(idArray: string[], status?: CollectionStatus): Promise < CollectionEntity[] >;
    fetchCollectionById(collectionId: string, status?: CollectionStatus): Promise < CollectionEntity >;
    fetchCollectionsByFilter(collectionFilterModel: CollectionFilterModel): Promise < { collectionEntities: CollectionEntity[], total: number } >;
    fetchCollectionDetailsById(collectionId: string): Promise < CollectionDetailsEntity >;
    fetchCollectionsDetailsByIds(collectionIds: string[]): Promise < CollectionDetailsEntity[] >;
    creditCollection(collectionEntity: CollectionEntity, nftEntities: NftEntity[]): Promise < void >;

    approveCollection(collectionEntity: CollectionEntity): Promise < void >;
}
