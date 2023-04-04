import { makeAutoObservable, runInAction } from 'mobx';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import NftRepo, { BuyingCurrency } from '../../../nft/presentation/repos/NftRepo';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import ProjectUtils, { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import { NftGroup } from '../../../nft/entities/NftEntity';
import axios from 'axios';
import CudosCollectionData, { createNft } from '../../data/data-sources/CudoCollectionData';
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
import { formatUsd } from '../../../core/utilities/NumberFormatter';

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

    async createPresaleCollection(miningFarmId: string, approvedCollectionEntities: CollectionEntity[]) {
        const presaleCollectionEntity = approvedCollectionEntities.find((collectionEntity) => {
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
                const baes64Image = await NftPresaleStore.downloadNftImageAsBase64(`/assets/presale-nft-images/level${i + 1}.png`);
                presaleImages.push(`data:image/png;base64,${baes64Image}`);
            }

            let collectionCoverImage01 = await NftPresaleStore.downloadNftImageAsBase64('/assets/presale-nft-images/collection.png');
            collectionCoverImage01 = `data:image/png;base64,${collectionCoverImage01}`;

            let collectionProfileImage01 = await NftPresaleStore.downloadNftImageAsBase64('/assets/presale-nft-images/collection-profile.png');
            collectionProfileImage01 = `data:image/png;base64,${collectionProfileImage01}`;

            const collectionEntity = new CollectionEntity();
            collectionEntity.farmId = miningFarmId;
            collectionEntity.name = CudosCollectionData.name;
            collectionEntity.description = CudosCollectionData.description;
            collectionEntity.profileImgUrl = collectionProfileImage01;
            collectionEntity.coverImgUrl = collectionCoverImage01;
            collectionEntity.royalties = CudosCollectionData.royalties;

            const nftEntities = [];

            // add OPAL tier for all sales
            const opalNftData = CudosCollectionData.nfts.opal;
            let nftNameCounter = 0;
            for (let i = 1; i <= opalNftData.giveawayCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[0], opalNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= opalNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[0], opalNftData, NftGroup.PRIVATE_SALE));
            }
            for (let i = 1; i <= opalNftData.presaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[0], opalNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= opalNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[0], opalNftData, NftGroup.PUBLIC_SALE));
            }

            // add RUBY tier for all sales
            const rubyNftData = CudosCollectionData.nfts.ruby;
            nftNameCounter = 0;
            for (let i = 1; i <= rubyNftData.giveawayCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[1], rubyNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= rubyNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[1], rubyNftData, NftGroup.PRIVATE_SALE));
            }
            for (let i = 1; i <= rubyNftData.presaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[1], rubyNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= rubyNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[1], rubyNftData, NftGroup.PUBLIC_SALE));
            }

            // add EMERALD tier for all sales
            const emeraldNftData = CudosCollectionData.nfts.emerald;
            nftNameCounter = 0;
            for (let i = 1; i <= emeraldNftData.giveawayCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[2], emeraldNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= emeraldNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[2], emeraldNftData, NftGroup.PRIVATE_SALE));
            }
            for (let i = 1; i <= emeraldNftData.presaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[2], emeraldNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= emeraldNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[2], emeraldNftData, NftGroup.PUBLIC_SALE));
            }

            // add EMERALD tier for all sales
            const diamondNftData = CudosCollectionData.nfts.diamond;
            nftNameCounter = 0;
            for (let i = 1; i <= diamondNftData.giveawayCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[3], diamondNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= diamondNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[3], diamondNftData, NftGroup.PRIVATE_SALE));
            }
            for (let i = 1; i <= diamondNftData.presaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[3], diamondNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= diamondNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[3], diamondNftData, NftGroup.PUBLIC_SALE));
            }

            // add EMERALD tier for all sales
            const blueDiamondNftData = CudosCollectionData.nfts.blueDiamond;
            nftNameCounter = 0;
            for (let i = 1; i <= blueDiamondNftData.giveawayCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[4], blueDiamondNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= blueDiamondNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[4], blueDiamondNftData, NftGroup.PRIVATE_SALE));
            }
            for (let i = 1; i <= blueDiamondNftData.presaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[4], blueDiamondNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= blueDiamondNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages[4], blueDiamondNftData, NftGroup.PUBLIC_SALE));
            }

            collectionEntity.hashPowerInTh = nftEntities.reduce((accu, nftEntity) => {
                return accu + nftEntity.hashPowerInTh;
            }, 0);

            // do some generated data checks
            if (nftEntities.length !== CudosCollectionData.totalNfts) {
                this.alertStore.show(`Total nfts count is not as expected. Total: ${nftEntities.length}, Expected: ${CudosCollectionData.totalNfts}`)
                return;
            }

            if (collectionEntity.hashPowerInTh !== CudosCollectionData.expectedTotalHashPower) {
                this.alertStore.show(`Total hash power is not as expected. Total: ${collectionEntity.hashPowerInTh}, Expected: ${CudosCollectionData.expectedTotalHashPower}`)
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
            this.alertStore.show('Minting was successfull', () => {
                window.location.reload();
            });
        } catch (e) {
            console.log(e);
            this.alertStore.show('There was an error minting the NFTs', () => {
                window.location.reload();
            });
        }
    }

    static async downloadNftImageAsBase64(url: string): Promise < string > {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary').toString('base64');
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
        return this.getPresalePriceInCudos().toFixed(2);
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
