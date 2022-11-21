import { action, makeObservable, observable, runInAction } from 'mobx';

import ModalStore from '../../../../core/presentation/stores/ModalStore';
import S from '../../../../core/utilities/Main';
import NftEntity from '../../../nft/entities/NftEntity';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';
import CollectionRepo from '../repos/CollectionRepo';

export default class ViewCollectionModalStore extends ModalStore {

    nftRepo: NftRepo;
    collectionRepo: CollectionRepo;

    @observable collectionEntity: CollectionEntity;
    @observable nftEntities: NftEntity[];

    @observable editedRoyalties: number;

    constructor(nftRepo: NftRepo, collectionRepo: CollectionRepo) {
        super();

        this.nftRepo = nftRepo;
        this.collectionRepo = collectionRepo;

        this.collectionEntity = null;
        this.nftEntities = null;
        this.editedRoyalties = S.NOT_EXISTS;

        makeObservable(this);
    }

    @action
    async showSignal(collectionEntity: CollectionEntity) {
        const nftFilterModel = new NftFilterModel();
        nftFilterModel.collectionIds = [collectionEntity.id];

        const { nftEntities, total } = await this.nftRepo.fetchNftsByFilter(nftFilterModel);

        runInAction(() => {
            this.collectionEntity = collectionEntity;
            this.nftEntities = nftEntities;
            this.editedRoyalties = collectionEntity.royalties;

            this.show();
        });
    }

    hide = () => {
        this.collectionEntity = null;
        this.nftEntities = null;

        super.hide();
    }

    setRoyalties = (value) => {
        this.editedRoyalties = Number(value);
    }

    areChangesMade() {
        return this.editedRoyalties !== this.collectionEntity.royalties;
    }

    async saveChanges() {
        // this.collectionEntity.royalties = this.editedRoyalties;
        await this.collectionRepo.creditCollection(this.collectionEntity, this.nftEntities);
    }

}
