import { makeAutoObservable, runInAction } from 'mobx';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import NftRepo, { BuyingCurrency } from '../../../nft/presentation/repos/NftRepo';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import ProjectUtils, { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import CollectionDetailsEntity from '../../../collection/entities/CollectionDetailsEntity';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import PresaleStore from '../../../app-routes/presentation/PresaleStore';
import AllowlistRepo from '../../../allowlist/presentation/repos/AllowlistRepo';
import AllowlistUserEntity from '../../../allowlist/entities/AllowlistUserEntity';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import BigNumber from 'bignumber.js';
import { PRESALE_CONSTS } from '../../../core/utilities/Constants';
import { formatCudos, formatUsd } from '../../../core/utilities/NumberFormatter';

declare let Config;

export default class NftPresaleStore {

    allowlistRepo: AllowlistRepo
    nftRepo: NftRepo;
    collectionRepo: CollectionRepo;
    alertStore: AlertStore;
    cudosStore: CudosStore;
    presaleStore: PresaleStore;
    walletStore: WalletStore;

    presaleCollectionEntity: CollectionEntity;
    presaleCollectionDetailsEntity: CollectionDetailsEntity;
    presaleMintedNftCount: number;
    totalPresaleNftCount: number;
    presaleNftIndexSelected: number;
    presaleNftsUniqueImageUrls: string[];

    allowlistUserEntity: AllowlistUserEntity;
    totalWhitelistedUsersCount: number;

    inited: boolean;

    constructor(nftRepo: NftRepo, collectionRepo: CollectionRepo, allowlistRepo: AllowlistRepo, alertStore: AlertStore, cudosStore: CudosStore, presaleStore: PresaleStore, walletStore: WalletStore) {
        this.allowlistRepo = allowlistRepo;
        this.nftRepo = nftRepo;
        this.collectionRepo = collectionRepo;
        this.cudosStore = cudosStore;
        this.presaleStore = presaleStore;
        this.alertStore = alertStore;
        this.walletStore = walletStore;

        this.presaleCollectionEntity = null;
        this.presaleCollectionDetailsEntity = null;
        this.presaleMintedNftCount = 0;
        this.totalPresaleNftCount = 0;
        this.presaleNftIndexSelected = 0;
        this.presaleNftsUniqueImageUrls = ['/assets/presale-nft-images/level1.png', '/assets/presale-nft-images/level2.png', '/assets/presale-nft-images/level3.png', '/assets/presale-nft-images/level4.png', '/assets/presale-nft-images/level5.png'];

        this.allowlistUserEntity = null;
        this.totalWhitelistedUsersCount = 0;

        this.inited = false;

        makeAutoObservable(this);
    }

    async init() {
        this.inited = false;

        this.presaleStore.update();
        this.cudosStore.init();
        this.fetchPresaleCollectionWithDetails();
        this.fetchTotalWhitelistedCount();

        await runInActionAsync(() => {
            this.inited = true;
        });
    }

    fetchPresaleCollectionWithDetails = async () => {
        const collectionId = Config.APP_PRESALE_COLLECTION_ID;
        const presaleCollection = await this.collectionRepo.fetchCollectionById(collectionId);
        const collectionDetails = await this.collectionRepo.fetchCollectionsDetailsByIds([collectionId]);

        const nftFilter = new NftFilterModel();
        nftFilter.collectionIds = [collectionId];
        const { totalPresaleNftCount, presaleMintedNftCount } = await this.nftRepo.fetchPresaleAmounts(nftFilter);

        await runInActionAsync(() => {
            this.presaleCollectionEntity = presaleCollection;
            this.presaleCollectionDetailsEntity = collectionDetails[0];

            this.totalPresaleNftCount = totalPresaleNftCount;
            this.presaleMintedNftCount = presaleMintedNftCount;
        })
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

    isPresaleOver(): boolean {
        return this.presaleStore.isInPresale() === false;
    }

    async fetchTotalWhitelistedCount(): Promise < void > {
        const count = await this.allowlistRepo.fetchTotalListedUsers();

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
        return this.totalPresaleNftCount;
    }

    getPresaleMintedAmount(): number {
        return this.presaleMintedNftCount
    }

    getPresaleMintedPercent(): number {
        const total = this.getPresaleTotalAmount();
        if (total === 0) {
            return 0;
        }

        return (this.getPresaleMintedAmount() * 100) / total;
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
        let allowlistUserEntity;
        if (this.presaleStore.isInPresale() === true) {
            allowlistUserEntity = await this.allowlistRepo.fetchAllowlistUserBySessionAccount();
        } else {
            allowlistUserEntity = new AllowlistUserEntity(); // it just has to be != null in order to allow payment
        }

        runInAction(() => {
            this.allowlistUserEntity = allowlistUserEntity;
        });
    }

    private getPresalePriceInCudos(): BigNumber {
        const price = this.cudosStore.convertUsdInCudos(PRESALE_CONSTS.PRICE_USD);
        return price.plus(ProjectUtils.ON_DEMAND_MINTING_SERVICE_FEE_IN_CUDOS);
    }

    private getPresalePriceInEth(): BigNumber {
        return this.cudosStore.convertCudosToEth(this.getPresalePriceInCudos());
    }

    getPresalePriceCudosFormatted(): string {
        return formatCudos(this.getPresalePriceInCudos())
    }

    getPresalePriceEthFormatted(): string {
        return this.getPresalePriceInEth().toFixed(6);
    }

    getPresalePriceUsdFormatted(): string {
        const onDemandMintingFeeInUsd = this.cudosStore.convertCudosInUsd(ProjectUtils.ON_DEMAND_MINTING_SERVICE_FEE_IN_CUDOS);
        const presalePriceInUsd = onDemandMintingFeeInUsd.plus(new BigNumber(PRESALE_CONSTS.PRICE_USD));
        return formatUsd(presalePriceInUsd.toNumber());
    }

    async onClickBuyWithCudos(): Promise < boolean > {
        try {
            const cudosBalance = await this.walletStore.getBalanceSafe();
            const cudosPrice = this.getPresalePriceInCudos()

            if (cudosBalance.lt(cudosPrice)) {
                this.alertStore.show('Your balance is not enough to buy this.');
                return false;
            }

            await this.nftRepo.buyPresaleNft(BuyingCurrency.CUDOS, cudosPrice, this.walletStore.ledger);
            return true;
        } catch (e) {
            this.alertStore.show(e.message);
            return false;
        }
    }

    async onClickBuyWithEth(): Promise < boolean > {
        try {
            const ethBalance = await this.walletStore.getEthBalance();

            const ethPrice = this.getPresalePriceInEth()

            if (ethBalance.lt(ethPrice)) {
                this.alertStore.show('Your balance is not enough to buy this.');
                return false;
            }

            await this.nftRepo.buyPresaleNft(BuyingCurrency.ETH, ethPrice, this.walletStore.ledger);
            return true;
        } catch (e) {
            this.alertStore.show(e.message);
            return false;
        }
    }
}
