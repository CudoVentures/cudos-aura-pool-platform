import NftEntity from '../../../nft/entities/NftEntity';
import CategoryEntity from '../../entities/CategoryEntity';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';
import CollectionFilterModel from '../../utilities/CollectionFilterModel';

export default interface CollectionRepo {

    fetchCategories(): Promise < CategoryEntity[] >;

    fetchTopCollections(period: number, status?: CollectionStatus): Promise < CollectionEntity[] >;

    fetchCollectionsByIds(idArray: string[], status?: CollectionStatus): Promise < CollectionEntity[] >;

    fetchCollectionById(collectionId: string, status?: CollectionStatus): Promise < CollectionEntity >;

    fetchCollectionsByFilter(collectionFilterModel: CollectionFilterModel): Promise < { collectionEntities: CollectionEntity[], total: number } >;

    creditCollection(collectionEntity: CollectionEntity, nftEntities: NftEntity[]): Promise < void >;
}
