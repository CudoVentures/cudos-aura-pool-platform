import { action, makeObservable, observable, runInAction } from 'mobx';

import ModalStore from '../../../../core/presentation/stores/ModalStore';
import NftEntity from '../../../nft/entities/NftEntity';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';

export default class ViewCollectionModalStore extends ModalStore {

    nftRepo: NftRepo;

    @observable collectionEntity: CollectionEntity;
    @observable nftEntities: NftEntity[];

    constructor(nftRepo: NftRepo) {
        super();

        this.nftRepo = nftRepo;

        this.collectionEntity = null;
        this.nftEntities = null;

        makeObservable(this);
    }

    @action
    async showSignal(collectionEntity: CollectionEntity) {
        const nftFilterModel = new NftFilterModel();
        nftFilterModel.collectionIds = [collectionEntity.id];
        nftFilterModel.collectionStatus = CollectionStatus.ANY;
        const { nftEntities, total } = await this.nftRepo.fetchNftsByFilter(nftFilterModel);

        runInAction(() => {
            this.collectionEntity = collectionEntity;
            this.nftEntities = nftEntities;

            this.show();
        });
    }

    hide = () => {
        this.collectionEntity = null;
        this.nftEntities = null;

        super.hide();
    }

}
