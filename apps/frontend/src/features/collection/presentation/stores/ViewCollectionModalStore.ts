import { action, makeObservable, observable, runInAction } from 'mobx';

import ModalStore from '../../../../core/presentation/stores/ModalStore';
import S from '../../../../core/utilities/Main';
import AdminEntity from '../../../accounts/entities/AdminEntity';
import AccountRepo from '../../../accounts/presentation/repos/AccountRepo';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import NftEntity from '../../../nft/entities/NftEntity';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import CollectionEntity from '../../entities/CollectionEntity';
import CollectionRepo from '../repos/CollectionRepo';

export default class ViewCollectionModalStore extends ModalStore {

    nftRepo: NftRepo;
    collectionRepo: CollectionRepo;
    miningFarmRepo: MiningFarmRepo;
    accountRepo: AccountRepo;

    @observable collectionEntity: CollectionEntity;
    creatorAdminEntity: AdminEntity;
    @observable nftEntities: NftEntity[];

    @observable editedRoyalties: number;

    constructor(nftRepo: NftRepo, collectionRepo: CollectionRepo, accountRepo: AccountRepo, miningFarmRepo: MiningFarmRepo) {
        super();

        this.nftRepo = nftRepo;
        this.collectionRepo = collectionRepo;
        this.accountRepo = accountRepo;
        this.miningFarmRepo = miningFarmRepo;

        this.collectionEntity = null;
        this.nftEntities = null;
        this.creatorAdminEntity = null;
        this.editedRoyalties = S.NOT_EXISTS;

        makeObservable(this);
    }

    @action
    async showSignal(collectionEntity: CollectionEntity) {
        const nftFilterModel = new NftFilterModel();
        nftFilterModel.collectionIds = [collectionEntity.id];

        const miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmById(collectionEntity.farmId);
        const { nftEntities } = await this.nftRepo.fetchNftsByFilter(nftFilterModel);

        const { adminEntity } = await this.accountRepo.fetchAccountsByAccountId(miningFarmEntity.accountId)

        runInAction(() => {
            this.collectionEntity = collectionEntity;
            this.nftEntities = nftEntities;
            this.editedRoyalties = collectionEntity.royalties;
            this.creatorAdminEntity = adminEntity;

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
