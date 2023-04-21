import { action, makeObservable, observable, runInAction } from 'mobx';

import ModalStore from '../../../core/presentation/stores/ModalStore';
import S from '../../../core/utilities/Main';
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

    async showSignal(collectionEntity: CollectionEntity) {

        const nftFilterModel = new NftFilterModel();
        nftFilterModel.collectionIds = [collectionEntity.id];
        const fetchNftsPromise = this.nftRepo.fetchNftsByFilter(nftFilterModel);

        const miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmById(collectionEntity.farmId);
        const adminEntityPromise = this.accountRepo.fetchFarmOwnerAccount(miningFarmEntity.accountId)

        const [{ nftEntities }, adminEntity] = await Promise.all([fetchNftsPromise, adminEntityPromise]);

        runInAction(() => {
            this.collectionEntity = collectionEntity;
            this.nftEntities = nftEntities;
            this.editedRoyalties = collectionEntity.royalties;
            this.creatorAdminEntity = adminEntity;

            this.show();
        });
    }

    hide = action(() => {
        this.collectionEntity = null;
        this.nftEntities = null;

        super.hide();
    })

    setRoyalties = action((value) => {
        this.editedRoyalties = Number(value);
    })

    areChangesMade() {
        return this.editedRoyalties !== this.collectionEntity.royalties;
    }

    async saveChanges() {
        // this.collectionEntity.royalties = this.editedRoyalties;
        await this.collectionRepo.creditCollection(this.collectionEntity, this.nftEntities);
    }
}
