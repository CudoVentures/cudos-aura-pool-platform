import { CudosSigningStargateClient } from 'cudosjs/build/stargate/cudos-signingstargateclient';
import SuperAdminEntity from '../../../accounts/entities/SuperAdminEntity';
import NftEntity from '../../../nft/entities/NftEntity';
import CategoryEntity from '../../entities/CategoryEntity';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';
import CollectionFilterModel from '../../utilities/CollectionFilterModel';

export default interface CollectionRepo {

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void);
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void);
    setProgressCallbacks(onProgress: (title: string, progress: number) => void);

    fetchCategories(): Promise < CategoryEntity[] >;
    fetchTopCollections(timestampFrom: number, timestampTo: number, status?: CollectionStatus): Promise < CollectionEntity[] >;
    fetchCollectionsByIds(idArray: string[], status?: CollectionStatus): Promise < CollectionEntity[] >;
    fetchCollectionById(collectionId: string, status?: CollectionStatus): Promise < CollectionEntity >;
    fetchCollectionsByMiningFarmId(miningFarmId: string, status?: CollectionStatus): Promise < CollectionEntity[] >;
    fetchCollectionsByFilter(collectionFilterModel: CollectionFilterModel): Promise < { collectionEntities: CollectionEntity[], total: number } >;
    fetchCollectionDetailsById(collectionId: string): Promise < CollectionDetailsEntity >;
    fetchCollectionsDetailsByIds(collectionIds: string[]): Promise < CollectionDetailsEntity[] >;
    creditCollection(collectionEntity: CollectionEntity, nftEntities: NftEntity[]): Promise < void >;
    editCollection(collectionEntity: CollectionEntity): Promise < void >;

    approveCollection(collectionEntity: CollectionEntity, superAdminEntity: SuperAdminEntity, creatorCudosAddress: string, signingClient: CudosSigningStargateClient): Promise < string >;
}
