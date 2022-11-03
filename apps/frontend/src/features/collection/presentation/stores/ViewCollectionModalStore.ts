import { action, makeObservable, observable } from 'mobx';

import ModalStore from '../../../../core/presentation/stores/ModalStore';
import NftEntity from '../../../nft/entities/NftEntity';
import CollectionEntity from '../../entities/CollectionEntity';

export default class ViewCollectionModalStore extends ModalStore {

    @observable collectionEntity: CollectionEntity;
    @observable nftEntities: NftEntity[];

    constructor() {
        super();

        this.collectionEntity = null;
        this.nftEntities = null;

        makeObservable(this);
    }

    @action
    showSignal(collectionEntity: CollectionEntity, nftEntities: NftEntity[]) {
        this.collectionEntity = collectionEntity;
        this.nftEntities = nftEntities;

        this.show();
    }

    hide = () => {
        this.collectionEntity = null;
        this.nftEntities = null;

        super.hide();
    }

}
