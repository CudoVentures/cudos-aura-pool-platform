import { action, makeAutoObservable } from 'mobx';
import CollectionEntity, { CollectionStatus } from '../../../collection/entities/CollectionEntity';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import MiningFarmRepo from '../repos/MiningFarmRepo';
import CollectionFilterModel from '../../../collection/utilities/CollectionFilterModel';
import GridViewState from '../../../core/presentation/stores/GridViewState';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import S from '../../../core/utilities/Main';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';
import TableState from '../../../core/presentation/stores/TableState';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import CollectionDetailsEntity from '../../../collection/entities/CollectionDetailsEntity';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import NftEntity from '../../../nft/entities/NftEntity';
import { CollectionCoverImage01, CollectionProfileImage01, PresaleImage01, PresaleImage02, PresaleImage03, PresaleImage04, PresaleImage05 } from '../../utilities/PresaleImages';

export default class CreditMiningFarmPageStore {

    miningFarmRepo: MiningFarmRepo;
    collectionRepo: CollectionRepo;
    nftRepo: NftRepo;
    accountSessionStore: AccountSessionStore;
    alertStore: AlertStore;
    walletStore: WalletStore;

    gridViewState: GridViewState;
    queuedCollectionsTableState: TableState
    approvedCollectionsTableState: TableState
    collectionFilterModel: CollectionFilterModel;

    inited: boolean;
    miningFarmEntity: MiningFarmEntity;
    miningFarmDetailsEntity: MiningFarmDetailsEntity;
    collectionEntities: CollectionEntity[];
    queuedCollectionEntities: CollectionEntity[];
    approvedCollectionEntities: CollectionEntity[];
    collectionDetailsMap: Map<string, CollectionDetailsEntity>;

    constructor(miningFarmRepo: MiningFarmRepo, collectionRepo: CollectionRepo, nftRepo: NftRepo, accountSessionStore: AccountSessionStore, alertStore: AlertStore, walletStore: WalletStore) {
        this.miningFarmRepo = miningFarmRepo;
        this.collectionRepo = collectionRepo;
        this.nftRepo = nftRepo;
        this.accountSessionStore = accountSessionStore;
        this.alertStore = alertStore;
        this.walletStore = walletStore;

        this.gridViewState = new GridViewState(this.fetchAnyCollections, 3, 4, 6);
        this.queuedCollectionsTableState = new TableState(S.NOT_EXISTS, [], this.fetchQueuedCollections, 5);
        this.approvedCollectionsTableState = new TableState(S.NOT_EXISTS, [], this.fetchApprovedCollections, 5);
        this.collectionFilterModel = new CollectionFilterModel();

        this.inited = false;
        this.miningFarmEntity = null;
        this.miningFarmDetailsEntity = null;
        this.collectionEntities = null;
        this.queuedCollectionEntities = null;
        this.approvedCollectionEntities = null;
        this.collectionDetailsMap = new Map<string, CollectionDetailsEntity>();

        makeAutoObservable(this);
    }

    async init(farmId = S.Strings.NOT_EXISTS) {
        this.inited = false;
        this.miningFarmEntity = null;
        this.miningFarmDetailsEntity = null;
        this.collectionEntities = null;

        let miningFarmEntity;
        if (farmId === S.Strings.NOT_EXISTS) {
            miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId();
        } else {
            miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmById(farmId);
        }

        if (miningFarmEntity !== null) {
            await runInActionAsync(() => {
                this.miningFarmEntity = miningFarmEntity;
                this.collectionFilterModel.farmId = this.miningFarmEntity.id;
            });
            await this.fetchMiningFarmDetails();
            await this.fetchApprovedCollections();
            await this.fetchAnyCollections();
            await this.fetchQueuedCollections();
        }

        await runInActionAsync(() => {
            this.inited = true;
        });
    }

    async fetchMiningFarmDetails() {
        try {
            const miningFarmDetailsEntity = await this.miningFarmRepo.fetchMiningFarmDetailsById(this.miningFarmEntity.id, S.INT_TRUE);

            await runInActionAsync(() => {
                this.miningFarmDetailsEntity = miningFarmDetailsEntity;
            })
        } catch (e) {
            console.log(e);
        }
    }

    fetchQueuedCollections = async () => {
        if (this.accountSessionStore.isSuperAdmin() === false) {
            await runInActionAsync(() => {
                this.queuedCollectionEntities = [];
            })

            return;
        }

        const collectionFilterModel = new CollectionFilterModel();
        collectionFilterModel.status = [CollectionStatus.QUEUED];
        collectionFilterModel.farmId = this.miningFarmEntity.id;
        collectionFilterModel.from = this.queuedCollectionsTableState.tableFilterState.from;
        collectionFilterModel.count = this.queuedCollectionsTableState.tableFilterState.itemsPerPage;
        const { collectionEntities, total } = await this.collectionRepo.fetchCollectionsByFilter(collectionFilterModel);
        await this.fetchCollectionDetails(collectionEntities);

        await runInActionAsync(() => {
            this.queuedCollectionEntities = collectionEntities;
            this.queuedCollectionsTableState.tableFilterState.total = total;
        });
    }

    fetchApprovedCollections = async () => {
        if (this.accountSessionStore.isSuperAdmin() === false) {
            await runInActionAsync(() => {
                this.approvedCollectionEntities = [];
            });

            return;
        }

        const collectionFilterModel = new CollectionFilterModel();
        collectionFilterModel.status = [CollectionStatus.APPROVED];
        collectionFilterModel.farmId = this.miningFarmEntity.id;
        collectionFilterModel.from = this.approvedCollectionsTableState.tableFilterState.from;
        collectionFilterModel.count = this.approvedCollectionsTableState.tableFilterState.itemsPerPage;
        const { collectionEntities, total } = await this.collectionRepo.fetchCollectionsByFilter(collectionFilterModel);
        await this.fetchCollectionDetails(collectionEntities);

        await runInActionAsync(() => {
            this.approvedCollectionEntities = collectionEntities;
            this.approvedCollectionsTableState.tableFilterState.total = total;
        });
    }

    fetchAnyCollections = async () => {
        if (this.accountSessionStore.isSuperAdmin() === true) {
            await runInActionAsync(() => {
                this.collectionEntities = [];
            });
            return;
        }

        this.gridViewState.setIsLoading(true);

        this.collectionFilterModel.from = this.gridViewState.getFrom();
        this.collectionFilterModel.count = this.gridViewState.getItemsPerPage();
        if (this.accountSessionStore.accountEntity?.accountId === this.miningFarmEntity.accountId) {
            this.collectionFilterModel.markAnyCollectins();
        } else {
            this.collectionFilterModel.markApprovedCollectins();
        }
        const { collectionEntities, total } = await this.collectionRepo.fetchCollectionsByFilter(this.collectionFilterModel);
        await this.fetchCollectionDetails(collectionEntities);

        await runInActionAsync(() => {
            this.collectionEntities = collectionEntities;
            this.gridViewState.setTotalItems(total);
            this.gridViewState.setIsLoading(false);
        });
    }

    private async fetchCollectionDetails(collectionEntities: CollectionEntity[]) {
        const collectionIds = collectionEntities.map((entity) => entity.id);
        const collectionDetails = await this.collectionRepo.fetchCollectionsDetailsByIds(collectionIds);

        await runInActionAsync(() => {
            const collectionDetailsMap = this.collectionDetailsMap;
            this.collectionDetailsMap = null;

            collectionDetails.forEach((collectionDetailsEntity) => {
                collectionDetailsMap.set(collectionDetailsEntity.collectionId, collectionDetailsEntity);
            });

            this.collectionDetailsMap = collectionDetailsMap;
        })
    }

    getFloorPrice(collectionId: string): string {
        return this.collectionDetailsMap.get(collectionId)?.formatFloorPriceInCudos() ?? '';
    }

    onChangeSearchWord = action((searchString: string) => {
        this.collectionFilterModel.searchString = searchString;
        this.fetchAnyCollections();
    })

    async onClickApproveCollection(collectionEntity: CollectionEntity, ev) {
        ev.stopPropagation();

        if (this.walletStore.isConnected() === false) {
            this.alertStore.show('You must connect your wallet first');
            return;
        }

        try {
            const clonedCollectionEntity = collectionEntity.clone();
            clonedCollectionEntity.markApproved();

            const signingClient = await this.walletStore.getSigningClient();
            await this.collectionRepo.approveCollection(clonedCollectionEntity, this.accountSessionStore.superAdminEntity, this.walletStore.getAddress(), signingClient);
            await this.fetchQueuedCollections();
            await this.fetchApprovedCollections();
        } catch (e) {
            this.alertStore.show(e.message);
        }
    }

    async onClickRejectCollection(collectionEntity: CollectionEntity, ev) {
        ev.stopPropagation();

        try {
            const collectionClone = collectionEntity.clone();
            collectionClone.markRejected();

            await this.collectionRepo.editCollection(collectionClone);
            await this.fetchQueuedCollections();
            await this.fetchApprovedCollections();
        } catch (e) {
            console.log(e);
        }
    }

    rejectMiningFarm = async () => {
        try {
            const clonedFarm = this.miningFarmEntity.clone();
            clonedFarm.marKRejected();
            await this.miningFarmRepo.creditMiningFarm(clonedFarm);

            await runInActionAsync(() => {
                this.miningFarmEntity.copy(clonedFarm);
            })
        } catch (e) {
            console.log(e);
        }
    }

    // this method does not exists because the super admin MUST set some params before approval
    // approveMiningFarm = async () => {
    //     try {
    //         const clonedFarm = this.miningFarmEntity.clone();
    //         clonedFarm.markApproved();
    //         await this.miningFarmRepo.creditMiningFarm(clonedFarm);

    //         await runInActionAsync(() => {
    //             this.miningFarmEntity.copy(clonedFarm);
    //         });
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }

    async createPresaleCollection() {
        try {
            const collectionEntity = new CollectionEntity();
            collectionEntity.farmId = this.miningFarmEntity.id;
            collectionEntity.name = 'Presale Collection';
            collectionEntity.description = 'Borem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet. More';
            collectionEntity.profileImgUrl = CollectionProfileImage01;
            collectionEntity.coverImgUrl = CollectionCoverImage01;
            collectionEntity.royalties = 3;

            const nftEntities = [];
            for (let i = 1; i <= 112; i++) {
                const nftEntity = new NftEntity();
                nftEntity.name = `Opal ${i}`;
                nftEntity.hashPowerInTh = 1;
                nftEntity.imageUrl = PresaleImage01;
                nftEntity.expirationDateTimestamp = 1798754400000;
                nftEntity.priceUsd = 150;

                nftEntities.push(nftEntity);
            }

            for (let i = 1; i <= 440; i++) {
                const nftEntity = new NftEntity();
                nftEntity.name = `Ruby ${i}`;
                nftEntity.hashPowerInTh = 2;
                nftEntity.imageUrl = PresaleImage02;
                nftEntity.expirationDateTimestamp = 1798754400000;
                nftEntity.priceUsd = 300;

                nftEntities.push(nftEntity);
            }

            for (let i = 1; i <= 29; i++) {
                const nftEntity = new NftEntity();
                nftEntity.name = `Emerald ${i}`;
                nftEntity.hashPowerInTh = 6;
                nftEntity.imageUrl = PresaleImage03;
                nftEntity.expirationDateTimestamp = 1798754400000;
                nftEntity.priceUsd = 1000;

                nftEntities.push(nftEntity);
            }

            for (let i = 1; i <= 4; i++) {
                const nftEntity = new NftEntity();
                nftEntity.name = `Diamond ${i}`;
                nftEntity.hashPowerInTh = 18;
                nftEntity.imageUrl = PresaleImage04;
                nftEntity.expirationDateTimestamp = 1798754400000;
                nftEntity.priceUsd = 3000;

                nftEntities.push(nftEntity);
            }

            for (let i = 1; i <= 1; i++) {
                const nftEntity = new NftEntity();
                nftEntity.name = `Blue Diamond ${i}`;
                nftEntity.hashPowerInTh = 30;
                nftEntity.imageUrl = PresaleImage05;
                nftEntity.expirationDateTimestamp = 1798754400000;
                nftEntity.priceUsd = 5000;

                nftEntities.push(nftEntity);
            }

            collectionEntity.hashPowerInTh = nftEntities.reduce((accu, nftEntity) => {
                return accu + nftEntity.hashPowerInTh;
            }, 0);

            await this.collectionRepo.creditCollection(collectionEntity, nftEntities);
            this.alertStore.show('Minting was successfull');
        } catch (e) {
            console.log(e);
            this.alertStore.show('There was an error minting the NFTs');
        }
    }
}
