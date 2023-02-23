import { action, makeAutoObservable } from 'mobx';
import CollectionEntity, { CollectionStatus } from '../../../collection/entities/CollectionEntity';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
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
import NftEntity, { NftGroup } from '../../../nft/entities/NftEntity';
import axios from 'axios';
import CudosCollectionData, { createNft, createRubyNft } from './CudoCollectionData';
import CudoCollectionData from './CudoCollectionData';

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
            if (e.message.indexOf('is not admin') !== -1) {
                this.alertStore.show('The connected wallet is not a marketplace admin wallet');
                return;
            }
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
            clonedFarm.markRejected();
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
        const presaleCollectionEntity = this.approvedCollectionEntities.find((collectionEntity) => {
            return collectionEntity.name === CudosCollectionData.name;
        });

        if (presaleCollectionEntity !== undefined) {
            // settimeout is because it is called from alertStoreHandler
            setTimeout(() => {
                this.alertStore.show('The collection has already been minted');
            });
            return;
        }

        try {
            const presaleImages = [];
            for (let i = 0; i < 5; ++i) {
                const baes64Image = await CreditMiningFarmPageStore.downloadNftImageAsBase64(`/assets/presale-nft-images/level${i + 1}.png`);
                presaleImages.push(`data:image/png;base64,${baes64Image}`);
            }

            let collectionCoverImage01 = await CreditMiningFarmPageStore.downloadNftImageAsBase64('/assets/presale-nft-images/collection.png');
            collectionCoverImage01 = `data:image/png;base64,${collectionCoverImage01}`;

            let collectionProfileImage01 = await CreditMiningFarmPageStore.downloadNftImageAsBase64('/assets/presale-nft-images/collection-profile.png');
            collectionProfileImage01 = `data:image/png;base64,${collectionProfileImage01}`;

            const collectionEntity = new CollectionEntity();
            collectionEntity.farmId = this.miningFarmEntity.id;
            collectionEntity.name = CudosCollectionData.name;
            collectionEntity.description = CudosCollectionData.description;
            collectionEntity.profileImgUrl = collectionProfileImage01;
            collectionEntity.coverImgUrl = collectionCoverImage01;
            collectionEntity.royalties = CudosCollectionData.royalties;

            const nftEntities = [];

            // add OPAL tier for all sales
            const opalNftData = CudosCollectionData.nfts.opal
            for (let i = 1; i <= opalNftData.giveawayCount; i++) {
                nftEntities.push(createNft(presaleImages[0], opalNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= opalNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(presaleImages[0], opalNftData, NftGroup.PRIVATE_SALE));
            }
            for (let i = 1; i <= opalNftData.presaleCount; i++) {
                nftEntities.push(createNft(presaleImages[0], opalNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= opalNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(presaleImages[0], opalNftData, NftGroup.PUBLIC_SALE));
            }

            // add RUBY tier for all sales
            const rubyNftData = CudosCollectionData.nfts.ruby
            for (let i = 1; i <= rubyNftData.giveawayCount; i++) {
                nftEntities.push(createNft(presaleImages[1], rubyNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= rubyNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(presaleImages[1], rubyNftData, NftGroup.PRIVATE_SALE));
            }
            for (let i = 1; i <= rubyNftData.presaleCount; i++) {
                nftEntities.push(createNft(presaleImages[1], rubyNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= rubyNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(presaleImages[1], rubyNftData, NftGroup.PUBLIC_SALE));
            }

            // add EMERALD tier for all sales
            const emeraldNftData = CudosCollectionData.nfts.emerald
            for (let i = 1; i <= emeraldNftData.giveawayCount; i++) {
                nftEntities.push(createNft(presaleImages[2], emeraldNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= emeraldNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(presaleImages[2], emeraldNftData, NftGroup.PRIVATE_SALE));
            }
            for (let i = 1; i <= emeraldNftData.presaleCount; i++) {
                nftEntities.push(createNft(presaleImages[2], emeraldNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= emeraldNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(presaleImages[2], emeraldNftData, NftGroup.PUBLIC_SALE));
            }

            // add EMERALD tier for all sales
            const diamondNftData = CudosCollectionData.nfts.diamond
            for (let i = 1; i <= diamondNftData.giveawayCount; i++) {
                nftEntities.push(createNft(presaleImages[3], diamondNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= diamondNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(presaleImages[3], diamondNftData, NftGroup.PRIVATE_SALE));
            }
            for (let i = 1; i <= diamondNftData.presaleCount; i++) {
                nftEntities.push(createNft(presaleImages[3], diamondNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= diamondNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(presaleImages[3], diamondNftData, NftGroup.PUBLIC_SALE));
            }

            // add EMERALD tier for all sales
            const blueDiamondNftData = CudosCollectionData.nfts.blueDiamond
            for (let i = 1; i <= blueDiamondNftData.giveawayCount; i++) {
                nftEntities.push(createNft(presaleImages[4], blueDiamondNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= blueDiamondNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(presaleImages[4], blueDiamondNftData, NftGroup.PRIVATE_SALE));
            }
            for (let i = 1; i <= blueDiamondNftData.presaleCount; i++) {
                nftEntities.push(createNft(presaleImages[4], blueDiamondNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= blueDiamondNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(presaleImages[4], blueDiamondNftData, NftGroup.PUBLIC_SALE));
            }

            collectionEntity.hashPowerInTh = nftEntities.reduce((accu, nftEntity) => {
                return accu + nftEntity.hashPowerInTh;
            }, 0);

            // do some generated data checks
            if (nftEntities.length !== CudoCollectionData.totalNfts) {
                this.alertStore.show(`Total nfts count is not as expected. Total: ${nftEntities.length}, Expected: ${CudoCollectionData.totalNfts}`)
                return;
            }

            if (collectionEntity.hashPowerInTh !== CudoCollectionData.expectedTotalHashPower) {
                this.alertStore.show(`Total hash power is not as expected. Total: ${collectionEntity.hashPowerInTh}, Expected: ${CudoCollectionData.expectedTotalHashPower}`)
                return;
            }

            const totalOpalCount = nftEntities.filter((entity) => entity.name.startsWith(opalNftData.name)).length
            if (totalOpalCount !== opalNftData.totalCount) {
                this.alertStore.show(`Total ${opalNftData.name} count is not as expected. Total: ${totalOpalCount}, Expected: ${opalNftData.totalCount}`)
                return;
            }

            const totalRubyCount = nftEntities.filter((entity) => entity.name.startsWith(rubyNftData.name)).length
            if (totalRubyCount !== rubyNftData.totalCount) {
                this.alertStore.show(`Total ${rubyNftData.name} count is not as expected. Total: ${totalRubyCount}, Expected: ${rubyNftData.totalCount}`)
                return;
            }

            const totalEmeraldCount = nftEntities.filter((entity) => entity.name.startsWith(emeraldNftData.name)).length
            if (totalEmeraldCount !== emeraldNftData.totalCount) {
                this.alertStore.show(`Total ${emeraldNftData.name} count is not as expected. Total: ${totalEmeraldCount}, Expected: ${emeraldNftData.totalCount}`)
                return;
            }

            const totalDiamondCount = nftEntities.filter((entity) => entity.name.startsWith(diamondNftData.name)).length
            if (totalDiamondCount !== diamondNftData.totalCount) {
                this.alertStore.show(`Total ${diamondNftData.name} count is not as expected. Total: ${totalDiamondCount}, Expected: ${diamondNftData.totalCount}`)
                return;
            }

            const totalBlueDiamondCount = nftEntities.filter((entity) => entity.name.startsWith(blueDiamondNftData.name)).length
            if (totalBlueDiamondCount !== blueDiamondNftData.totalCount) {
                this.alertStore.show(`Total ${blueDiamondNftData.name} count is not as expected. Total: ${totalBlueDiamondCount}, Expected: ${blueDiamondNftData.totalCount}`)
                return;
            }

            await this.collectionRepo.creditCollection(collectionEntity, nftEntities);
            this.alertStore.show('Minting was successfull');
        } catch (e) {
            console.log(e);
            this.alertStore.show('There was an error minting the NFTs');
        }
    }

    static async downloadNftImageAsBase64(url: string): Promise < string > {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary').toString('base64');
    }
}
