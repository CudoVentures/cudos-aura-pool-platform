import { makeAutoObservable, runInAction } from 'mobx';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import NftEntity from '../../../nft/entities/NftEntity';
import NftRepo, { BuyingCurrency } from '../../../nft/presentation/repos/NftRepo';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import CollectionDetailsEntity from '../../../collection/entities/CollectionDetailsEntity';
import DefaultIntervalPickerState from '../../../analytics/presentation/stores/DefaultIntervalPickerState';
import MiningFarmDetailsEntity from '../../../mining-farm/entities/MiningFarmDetailsEntity';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import { PRESALE_CONSTS } from '../../../core/utilities/Constants';
import BigNumber from 'bignumber.js';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import PresaleStore from '../../../app-routes/presentation/PresaleStore';
import AllowlistRepo from '../../../allowlist/presentation/repos/AllowlistRepo';
import AllowlistUserEntity from '../../../allowlist/entities/AllowlistUserEntity';
import { PresaleImage01, PresaleImage02, PresaleImage03, PresaleImage04, PresaleImage05 } from '../../../mining-farm/utilities/PresaleImages';

declare let Config;

export default class MarketplacePageStore {
    alertStore: AlertStore;
    cudosStore: CudosStore;
    walletStore: WalletStore;
    presaleStore: PresaleStore;

    collectionRepo: CollectionRepo;
    nftRepo: NftRepo;
    miningFarmRepo: MiningFarmRepo;
    allowlistRepo: AllowlistRepo;

    defaultIntervalPickerState: DefaultIntervalPickerState;

    presaleCollectionEntity: CollectionEntity;
    presaleCollectionDetailsEntity: CollectionDetailsEntity;
    presaleNftEntities: NftEntity[];
    presaleNftsUniqueImageUrls: string[];
    presaleNftIndexSelected: number;

    collectionMap: Map < string, CollectionEntity >;
    collectionDetailsMap: Map < string, CollectionDetailsEntity >;
    topCollectionEntities: CollectionEntity[];
    newNftDropsEntities: NftEntity[];
    trendingNftEntities: NftEntity[];
    popularFarmsEntities: MiningFarmEntity[];
    miningFarmDetailsMap: Map < string, MiningFarmDetailsEntity >;

    allowlistUserEntity: AllowlistUserEntity;
    totalWhitelistedUsersCount: number;

    constructor(presaleStore: PresaleStore, alertStore: AlertStore, walletStore: WalletStore, cudosStore: CudosStore, collectionRepo: CollectionRepo, nftRepo: NftRepo, miningFarmRepo: MiningFarmRepo, allowlistRepo: AllowlistRepo) {
        this.cudosStore = cudosStore;
        this.walletStore = walletStore;
        this.alertStore = alertStore;
        this.presaleStore = presaleStore;

        this.collectionRepo = collectionRepo;
        this.nftRepo = nftRepo;
        this.miningFarmRepo = miningFarmRepo;
        this.defaultIntervalPickerState = new DefaultIntervalPickerState(this.fetchTopCollections);
        this.allowlistRepo = allowlistRepo;

        this.presaleCollectionEntity = null;
        this.presaleCollectionDetailsEntity = null;
        this.presaleNftEntities = [];
        this.presaleNftsUniqueImageUrls = ['/assets/presale-nft-images/level1.png', '/assets/presale-nft-images/level2.png', '/assets/presale-nft-images/level3.png', '/assets/presale-nft-images/level4.png', '/assets/presale-nft-images/level5.png'];
        this.presaleNftIndexSelected = 0;

        this.collectionMap = new Map();
        this.collectionDetailsMap = new Map();
        this.topCollectionEntities = [];
        this.newNftDropsEntities = [];
        this.trendingNftEntities = [];
        this.popularFarmsEntities = [];
        this.miningFarmDetailsMap = new Map();

        this.allowlistUserEntity = null;
        this.totalWhitelistedUsersCount = null;

        makeAutoObservable(this);
    }

    async init() {
        this.presaleStore.update();

        if (this.isPresaleOver() === false) {
            this.cudosStore.init();
            this.fetchPresaleCollectionWithDetails();
            this.fetchTotalWhitelistedCount();
        } else {
            await this.fetchTopCollections();
            await this.fetchNewNftDrops();
            this.fetchTrendingNfts();
            this.fetchPopularFarms();
        }
    }

    fetchTopCollections = async () => {
        const topCollectionEntities = await this.collectionRepo.fetchTopCollections(this.defaultIntervalPickerState.earningsTimestampFrom, this.defaultIntervalPickerState.earningsTimestampTo);
        const collectionIds = topCollectionEntities.map((collectionEntity) => {
            return collectionEntity.id;
        });

        const collectionDetails = await this.collectionRepo.fetchCollectionsDetailsByIds(collectionIds);
        const collectionDetailsMap = new Map();
        collectionDetails.forEach((collectionDetailsEntity) => {
            collectionDetailsMap.set(collectionDetailsEntity.collectionId, collectionDetailsEntity);
        });

        this.addCollectionsToMap(topCollectionEntities);

        await runInActionAsync(() => {
            this.topCollectionEntities = topCollectionEntities;
            this.collectionDetailsMap = collectionDetailsMap;
        });
    }

    fetchPresaleCollectionWithDetails = async () => {
        const collectionId = Config.APP_PRESALE_COLLECTION_ID;
        const presaleCollection = await this.collectionRepo.fetchCollectionById(collectionId);
        const collectionDetails = await this.collectionRepo.fetchCollectionsDetailsByIds([collectionId]);

        const nftFilter = new NftFilterModel();
        nftFilter.collectionIds = [collectionId];
        const { nftEntities } = await this.nftRepo.fetchNftsByFilter(nftFilter);

        await runInActionAsync(() => {
            this.presaleCollectionEntity = presaleCollection;
            this.presaleCollectionDetailsEntity = collectionDetails[0];
            this.presaleNftEntities = nftEntities;
        })
    }

    async fetchNewNftDrops() {
        const newNftDropsEntities = await this.nftRepo.fetchNewNftDrops();
        this.fetchCollectionsForEntities(newNftDropsEntities);

        await runInActionAsync(() => {
            this.newNftDropsEntities = newNftDropsEntities;
        })
    }

    async fetchTrendingNfts() {
        const trendingNftEntities = await this.nftRepo.fetchTrendingNfts();
        this.fetchCollectionsForEntities(trendingNftEntities);

        await runInActionAsync(() => {
            this.trendingNftEntities = trendingNftEntities;
        });
    }

    async fetchPopularFarms() {
        const popularFarmsEntities = await this.miningFarmRepo.fetchPopularMiningFarms();

        const miningFarmIds = popularFarmsEntities.map((miningFarmEntity) => miningFarmEntity.id);

        const miningFarmDetailsEntities = await this.miningFarmRepo.fetchMiningFarmsDetailsByIds(miningFarmIds);
        const miningFarmDetailsMap = new Map();
        miningFarmDetailsEntities.forEach((miningFarmDetailsEntity) => {
            miningFarmDetailsMap.set(miningFarmDetailsEntity.miningFarmId, miningFarmDetailsEntity);
        });

        await runInActionAsync(() => {
            this.popularFarmsEntities = popularFarmsEntities;
            this.miningFarmDetailsMap = miningFarmDetailsMap;
        });
    }

    async fetchCollectionsForEntities(nftEntities: NftEntity[]) {
        const collectionIdsToFetch = nftEntities
            .filter((nftEntity: NftEntity) => this.collectionMap.has(nftEntity.collectionId) === false)
            .map((nftEntity: NftEntity) => nftEntity.collectionId);

        const fetchedCollections = await this.collectionRepo.fetchCollectionsByIds(collectionIdsToFetch);

        this.addCollectionsToMap(fetchedCollections);
    }

    addCollectionsToMap(collectionEntities: CollectionEntity[]) {
        collectionEntities.forEach((collectionEntity: CollectionEntity) => {
            this.collectionMap.set(collectionEntity.id, collectionEntity);
        })
    }

    getCollectionById(collectionId: string) {
        return this.collectionMap.get(collectionId);
    }

    getCollectionName(collectionId: string): string {
        return this.collectionMap.get(collectionId)?.name ?? '';
    }

    getMiningFarmDetailsEntity(miningFarmId: string): MiningFarmDetailsEntity {
        return this.miningFarmDetailsMap.get(miningFarmId) ?? null;
    }

    isPresaleOver(): boolean {
        return this.presaleStore.isInPresale() === false;
    }

    async fetchTotalWhitelistedCount(): Promise < void > {
        const count = await this.allowlistRepo.fetchTotalListedUsers(PRESALE_CONSTS.PRESALE_ALLOWLIST_ID);

        runInAction(() => {
            this.totalWhitelistedUsersCount = count;
        })
    }

    getPresaleTimeLeft(): {presaleDaysLeft: string, presaleHoursLeft: string, presaleMinutesLeft: string, presaleSecondsleft: string } {
        const ms = this.presaleStore.timeLeftToPresale;
        const presaleDaysLeft = Math.floor(ms / (24 * 60 * 60 * 1000));
        const daysms = ms % (24 * 60 * 60 * 1000);
        const presaleHoursLeft = Math.floor(daysms / (60 * 60 * 1000));
        const hoursms = ms % (60 * 60 * 1000);
        const presaleMinutesLeft = Math.floor(hoursms / (60 * 1000));
        const minutesms = ms % (60 * 1000);
        const presaleSecondsleft = Math.floor(minutesms / 1000);

        return {
            presaleDaysLeft: presaleDaysLeft < 10 ? `0${presaleDaysLeft}` : `${presaleDaysLeft}`,
            presaleHoursLeft: presaleHoursLeft < 10 ? `0${presaleHoursLeft}` : `${presaleHoursLeft}`,
            presaleMinutesLeft: presaleMinutesLeft < 10 ? `0${presaleMinutesLeft}` : `${presaleMinutesLeft}`,
            presaleSecondsleft: presaleSecondsleft < 10 ? `0${presaleSecondsleft}` : `${presaleSecondsleft}`,
        }
    }

    getPresaleTotalAmount(): number {
        return this.presaleNftEntities.length;
    }

    getPresaleMintedAmount(): number {
        return this.presaleNftEntities.filter((entity) => entity.isMinted()).length;
    }

    getPresaleMintedPercent(): number {
        return (this.getPresaleMintedAmount() * 100) / this.getPresaleTotalAmount();
    }

    isUserEligibleToBuy(): boolean {
        if (this.walletStore.isConnected() === false) {
            return false;
        }
        if (this.allowlistUserEntity === null) {
            return false;
        }

        return true;
    }

    async fetchAllowlistUser(): Promise < void > {
        const address = this.walletStore.getAddress();
        const allowlistUserEntity = await this.allowlistRepo.fetchAllowlistUserByAddress(PRESALE_CONSTS.PRESALE_ALLOWLIST_ID, address);

        runInAction(() => {
            this.allowlistUserEntity = allowlistUserEntity;
        })
    }

    getWhitelistedAmount(): number {
        return this.totalWhitelistedUsersCount;
    }

    getPresalePriceCudosFormatted(): string {
        return `${PRESALE_CONSTS.PRICE_CUDOS} CUDOS`;
    }

    getPresalePriceEthFormatted(): string {
        return `${PRESALE_CONSTS.PRICE_ETH} ETH`;
    }

    getPresalePriceUsdFormatted(): string {
        return this.cudosStore.formatConvertedCudosInUsd(new BigNumber(PRESALE_CONSTS.PRICE_CUDOS));
    }

    async onClickBuyWithCudos(): Promise < boolean > {
        try {
            const cudosBalance = await this.walletStore.getBalanceSafe();

            if (cudosBalance.lt((new BigNumber(PRESALE_CONSTS.PRICE_CUDOS)))) {
                this.alertStore.show('Your balance is not enough to buy this.');
                return false;
            }

            await this.nftRepo.buyPresaleNft(BuyingCurrency.CUDOS, this.walletStore.ledger);
            return true;
        } catch (e) {
            this.alertStore.show(e.message);
            return false;
        }
    }

    async onClickBuyWithEth(): Promise < boolean > {
        try {
            const ethBalance = await this.walletStore.getEthBalance();

            if (ethBalance.lt((new BigNumber(PRESALE_CONSTS.PRICE_ETH)).shiftedBy(-18))) {
                this.alertStore.show('Your balance is not enough to buy this.');
                return false;
            }

            await this.nftRepo.buyPresaleNft(BuyingCurrency.ETH, this.walletStore.ledger);
            return true;
        } catch (e) {
            this.alertStore.show(e.message);
            return false;
        }
    }

    getPresaleNftPicture() {
        return this.presaleNftsUniqueImageUrls[this.presaleNftIndexSelected];
    }

    onClickNextPresaleNftPicture = () => {
        this.presaleNftIndexSelected = this.presaleNftIndexSelected < this.presaleNftsUniqueImageUrls.length - 1 ? this.presaleNftIndexSelected + 1 : 0;
    }

    onClickPreviousPresaleNftPicture = () => {
        this.presaleNftIndexSelected = this.presaleNftIndexSelected === 0 ? this.presaleNftsUniqueImageUrls.length - 1 : this.presaleNftIndexSelected - 1;
    }
}
