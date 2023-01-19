import { action, makeAutoObservable, runInAction } from 'mobx';
import CollectionEntity from '../../entities/CollectionEntity';
import CollectionRepo from '../repos/CollectionRepo';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import NftEntity from '../../../nft/entities/NftEntity';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import GridViewState from '../../../core/presentation/stores/GridViewState';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';

export default class CreditCollectionPageStore {

    nftRepo: NftRepo;
    collectionRepo: CollectionRepo;
    miningFarmRepo: MiningFarmRepo;
    walletStore: WalletStore;
    alertStore: AlertStore;
    accountSessionStore: AccountSessionStore;

    gridViewState: GridViewState;
    nftFilterModel: NftFilterModel;

    collectionEntity: CollectionEntity;
    collectionDetailsEntity: CollectionDetailsEntity;
    miningFarmEntity: MiningFarmEntity;
    nftEntities: NftEntity[];

    constructor(nftRepo: NftRepo, collectionRepo: CollectionRepo, miningFarmRepo: MiningFarmRepo, walletStore: WalletStore, alertStore: AlertStore, accountSessionStore: AccountSessionStore) {
        this.nftRepo = nftRepo;
        this.collectionRepo = collectionRepo;
        this.miningFarmRepo = miningFarmRepo;
        this.walletStore = walletStore;
        this.alertStore = alertStore;
        this.accountSessionStore = accountSessionStore;

        this.gridViewState = new GridViewState(this.fetchNfts, 3, 4, 6);
        this.nftFilterModel = new NftFilterModel();

        this.collectionEntity = null;
        this.collectionDetailsEntity = null;
        this.miningFarmEntity = null;
        this.nftEntities = null;

        makeAutoObservable(this);
    }

    init(collectionId: string): Promise < void > {
        return new Promise < void >((resolve, reject) => {
            const run = async () => {
                const collectionEntity = await this.collectionRepo.fetchCollectionById(collectionId);
                const miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmById(collectionEntity.farmId);

                runInAction(async () => {
                    this.nftFilterModel.collectionIds = [collectionId];
                    this.collectionEntity = collectionEntity;
                    this.miningFarmEntity = miningFarmEntity;

                    await this.fetchCollectionDetails();
                    await this.fetchNfts();
                    resolve();
                });
            }
            run();
        });
    }

    async fetchCollectionDetails() {
        const collectionDetailsEntity = await this.collectionRepo.fetchCollectionDetailsById(this.collectionEntity.id);

        runInAction(() => {
            this.collectionDetailsEntity = collectionDetailsEntity;
        })
    }

    fetchNfts = action(async () => {
        this.gridViewState.setIsLoading(true);
        this.nftFilterModel.from = this.gridViewState.getFrom();
        this.nftFilterModel.count = this.gridViewState.getItemsPerPage();

        const { nftEntities, total } = await this.nftRepo.fetchNftsByFilter(this.nftFilterModel);

        runInAction(() => {
            this.nftEntities = nftEntities;
            this.gridViewState.setTotalItems(total);
            this.gridViewState.setIsLoading(false);
        });
    })

    approveCollection = async () => {
        if (this.walletStore.isConnected() === false) {
            this.alertStore.show('You must connect your wallet first');
            return;
        }

        try {
            const collectionClone = this.collectionEntity.clone();
            collectionClone.markApproved();

            const signingClient = await this.walletStore.getSigningClient();
            await this.collectionRepo.approveCollection(collectionClone, this.accountSessionStore.superAdminEntity, this.walletStore.getAddress(), signingClient);
            this.collectionEntity.copy(collectionClone);
        } catch (e) {
            this.alertStore.show(e.message);
        }
    }

    rejectCollection = async () => {
        try {
            const collectionClone = this.collectionEntity.clone();
            collectionClone.markRejected();
            await this.collectionRepo.editCollection(collectionClone);
            this.collectionEntity.markRejected();
        } catch (e) {
            console.log(e);
        }
    }

    isOwner(): boolean {
        return this.accountSessionStore.adminEntity?.accountId === this.miningFarmEntity?.accountId;
    }

    isShowable(): boolean {
        return this.miningFarmEntity.isApproved() && this.collectionEntity.isStatusApproved();
    }

    hasAccess(): boolean {
        return this.accountSessionStore.isSuperAdmin()
            || this.isOwner()
            || this.isShowable();
    }
}
