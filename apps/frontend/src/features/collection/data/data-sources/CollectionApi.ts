import NftEntity from '../../../nft/entities/NftEntity';
import CategoryEntity from '../../entities/CategoryEntity';
import CollectionEntity from '../../entities/CollectionEntity';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import CollectionFilterModel from '../../utilities/CollectionFilterModel';
import axios from '../../../../core/utilities/AxiosWrapper';
import { ReqCreditCollection, ReqEditCollection, ReqFetchCollectionDetails, ReqFetchCollectionsByFilter, ReqFetchTopCollections } from '../dto/Requests';
import { ResCreditCollection, ResEditCollection, ResFetchCollectionDetails, ResFetchCollectionsByFilter, ResFetchTopCollections } from '../dto/Responses';

const COLLECTION_URL = '/api/v1/collection';

export default class CollectionApi {
    async fetchCategories(): Promise < CategoryEntity [] > {
        return null;
    }

    async fetchTopCollections(timestampFrom: number, timestampTo: number): Promise < CollectionEntity[] > {
        const { data } = await axios.post(`${COLLECTION_URL}/fetchTopCollections`, new ReqFetchTopCollections(timestampFrom, timestampTo));
        const res = new ResFetchTopCollections(data);
        return res.collectionEntities;
    }

    async fetchCollectionsByFilter(collectionFilterModel: CollectionFilterModel): Promise < { collectionEntities: CollectionEntity[], total: number } > {
        const { data } = await axios.post(COLLECTION_URL, new ReqFetchCollectionsByFilter(collectionFilterModel));
        const res = new ResFetchCollectionsByFilter(data);
        return {
            collectionEntities: res.collectionEntities,
            total: res.total,
        }
    }

    async creditCollection(collectionEntity: CollectionEntity, nftEntities: NftEntity[]): Promise < { collectionEntity: CollectionEntity, nftEntities: NftEntity[] } > {
        const req = new ReqCreditCollection(collectionEntity, nftEntities);

        const { data } = await axios.put(COLLECTION_URL, req)

        const res = new ResCreditCollection(data);

        return {
            collectionEntity: res.collectionEntity,
            nftEntities: res.nftEntities,
        }
    }

    async editCollection(collectionEntity: CollectionEntity): Promise < CollectionEntity > {
        const req = new ReqEditCollection(collectionEntity);
        const { data } = await axios.put(`${COLLECTION_URL}/editCollection`, req)
        const res = new ResEditCollection(data);
        return res.collectionEntity;
    }

    async fetchCollectionsDetailsByIds(collectionIds: string[]): Promise < CollectionDetailsEntity[] > {
        const req = new ReqFetchCollectionDetails(collectionIds);

        const { data } = await axios.post(`${COLLECTION_URL}/details`, req);

        const res = new ResFetchCollectionDetails(data);

        return res.detailEntities;
    }
}
