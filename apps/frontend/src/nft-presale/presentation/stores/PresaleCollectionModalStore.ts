import { action, makeObservable, observable } from 'mobx';
import axios from 'axios';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import ModalStore from '../../../core/presentation/stores/ModalStore';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import NftEntity, { NftGroup } from '../../../nft/entities/NftEntity';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import { PresaleCollectionEntity } from '../../entities/PresaleCollectionEntity';
import S from '../../../core/utilities/Main';
import AppStore from '../../../core/presentation/stores/AppStore';

export enum ModalStage {
    UPLOAD_FILE,
    PREVIEW,
    PROCESSING,
    SUCCESS,
    FAIL
}

export default class PresaleCollectionModalStore extends ModalStore {

    appStore: AppStore;
    alertStore: AlertStore;

    collectionRepo: CollectionRepo;

    @observable modalStage: ModalStage;
    @observable presaleCollectionEntity: PresaleCollectionEntity;
    @observable miningFarmId: string;
    @observable approvedCollectionEntities: CollectionEntity[]

    constructor(appStore: AppStore, alertStore: AlertStore, collectionRepo: CollectionRepo) {
        super();

        this.appStore = appStore;
        this.alertStore = alertStore;
        this.collectionRepo = collectionRepo;

        this.modalStage = ModalStage.UPLOAD_FILE;
        this.presaleCollectionEntity = null;
        this.miningFarmId = S.Strings.NOT_EXISTS;
        this.approvedCollectionEntities = [];

        makeObservable(this);
    }

    @action
    showSignal(miningFarmId: string, approvedCollectionEntities: CollectionEntity[]) {
        this.modalStage = ModalStage.UPLOAD_FILE;
        this.presaleCollectionEntity = null;
        this.miningFarmId = miningFarmId;
        this.approvedCollectionEntities = approvedCollectionEntities;
        this.show();
    }

    hide = action(() => {
        this.modalStage = ModalStage.UPLOAD_FILE;
        this.presaleCollectionEntity = null;
        this.miningFarmId = S.Strings.NOT_EXISTS;
        this.approvedCollectionEntities = [];
        super.hide();
    })

    isStageUploadFile(): boolean {
        return this.modalStage === ModalStage.UPLOAD_FILE;
    }

    isStagePreview(): boolean {
        return this.modalStage === ModalStage.PREVIEW;
    }

    isStageProcessing(): boolean {
        return this.modalStage === ModalStage.PROCESSING;
    }

    isStageSuccess(): boolean {
        return this.modalStage === ModalStage.SUCCESS;
    }

    isStageFail(): boolean {
        return this.modalStage === ModalStage.FAIL;
    }

    async parsePresaleCollectionData(json) {
        const presaleCollectionEntity = PresaleCollectionEntity.fromJson(json);

        await runInActionAsync(() => {
            this.presaleCollectionEntity = presaleCollectionEntity;
            this.modalStage = ModalStage.PREVIEW;
        });
    }

    async onClickCreatePresaleCollection() {
        const presaleCollectionEntity = this.presaleCollectionEntity;
        const approvedCollectionEntities = this.approvedCollectionEntities;
        const miningFarmId = this.miningFarmId;

        const presaleCollectionEntityRef = approvedCollectionEntities.find((collectionEntity) => {
            return collectionEntity.name === presaleCollectionEntity.name;
        });

        if (presaleCollectionEntityRef !== undefined) {
            // settimeout is because it is called from alertStoreHandler
            setTimeout(() => {
                this.alertStore.show('The collection has already been minted');
            });
            return;
        }

        try {
            this.appStore.disableActions();
            // const collectionCoverImage01 = await downloadNftImageAsBase64WithPrefix('/assets/presale-nft-images/collection.png');
            // const collectionProfileImage01 = await downloadNftImageAsBase64WithPrefix('/assets/presale-nft-images/collection-profile.png');

            const collectionEntity = new CollectionEntity();
            collectionEntity.farmId = miningFarmId;
            collectionEntity.name = presaleCollectionEntity.name;
            collectionEntity.description = presaleCollectionEntity.description;
            // collectionEntity.profileImgUrl = collectionProfileImage01;
            // collectionEntity.coverImgUrl = collectionCoverImage01;
            collectionEntity.profileImgUrl = await downloadNftImageAsBase64WithPrefix(presaleCollectionEntity.profileImgUrl);
            collectionEntity.coverImgUrl = await downloadNftImageAsBase64WithPrefix(presaleCollectionEntity.coverImgUrl);
            collectionEntity.royalties = presaleCollectionEntity.royalties;

            const nftEntities = [];

            // add OPAL tier for all sales
            const opalNftData = presaleCollectionEntity.nfts.opal;
            const opalDefaultImageBase64 = await downloadNftImageAsBase64WithPrefix(opalNftData.defaultImgUrl);
            // const opalUniqueImageBase64 = await downloadNftImageAsBase64WithPrefix(opalNftData.uniqueImgUrl);
            let nftNameCounter = 0;
            for (let i = 1; i <= opalNftData.giveawayCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, opalDefaultImageBase64, opalNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= opalNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, opalDefaultImageBase64, opalNftData, NftGroup.PRIVATE_SALE));
            }
            for (let i = 1; i <= opalNftData.presaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, opalDefaultImageBase64, opalNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= opalNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, opalDefaultImageBase64, opalNftData, NftGroup.PUBLIC_SALE));
            }

            // add RUBY tier for all sales
            const rubyNftData = presaleCollectionEntity.nfts.ruby;
            const rubyDefaultImageBase64 = await downloadNftImageAsBase64WithPrefix(rubyNftData.defaultImgUrl);
            const rubyUniqueImageBase64 = await downloadNftImageAsBase64WithPrefix(rubyNftData.uniqueImgUrl);
            nftNameCounter = 0;
            for (let i = 1; i <= rubyNftData.giveawayCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, rubyDefaultImageBase64, rubyNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= rubyNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, rubyDefaultImageBase64, rubyNftData, NftGroup.PRIVATE_SALE));
            }
            nftEntities.push(createNft(++nftNameCounter, rubyUniqueImageBase64, rubyNftData, NftGroup.PRESALE));
            for (let i = 2; i <= rubyNftData.presaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, rubyDefaultImageBase64, rubyNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= rubyNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, rubyDefaultImageBase64, rubyNftData, NftGroup.PUBLIC_SALE));
            }

            // add EMERALD tier for all sales
            const emeraldNftData = presaleCollectionEntity.nfts.emerald;
            const emeraldDefaultImageBase64 = await downloadNftImageAsBase64WithPrefix(emeraldNftData.defaultImgUrl);
            const emeraldUniqueImageBase64 = await downloadNftImageAsBase64WithPrefix(emeraldNftData.uniqueImgUrl);
            nftNameCounter = 0;
            for (let i = 1; i <= emeraldNftData.giveawayCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, emeraldDefaultImageBase64, emeraldNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= emeraldNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, emeraldDefaultImageBase64, emeraldNftData, NftGroup.PRIVATE_SALE));
            }
            nftEntities.push(createNft(++nftNameCounter, emeraldUniqueImageBase64, emeraldNftData, NftGroup.PRESALE));
            for (let i = 2; i <= emeraldNftData.presaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, emeraldDefaultImageBase64, emeraldNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= emeraldNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, emeraldDefaultImageBase64, emeraldNftData, NftGroup.PUBLIC_SALE));
            }

            // add DIAMOND tier for all sales
            const diamondNftData = presaleCollectionEntity.nfts.diamond;
            const diamondDefaultImageBase64 = await downloadNftImageAsBase64WithPrefix(diamondNftData.defaultImgUrl);
            const diamondUniqueImageBase64 = await downloadNftImageAsBase64WithPrefix(diamondNftData.uniqueImgUrl);
            nftNameCounter = 0;
            for (let i = 1; i <= diamondNftData.giveawayCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, diamondDefaultImageBase64, diamondNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= diamondNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, diamondDefaultImageBase64, diamondNftData, NftGroup.PRIVATE_SALE));
            }
            nftEntities.push(createNft(++nftNameCounter, diamondUniqueImageBase64, diamondNftData, NftGroup.PRESALE));
            for (let i = 2; i <= diamondNftData.presaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, diamondDefaultImageBase64, diamondNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= diamondNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, diamondDefaultImageBase64, diamondNftData, NftGroup.PUBLIC_SALE));
            }

            // add BLUE DIAMOND tier for all sales
            const blueDiamondNftData = presaleCollectionEntity.nfts.blueDiamond;
            const blueDiamondDefaultImageBase64 = await downloadNftImageAsBase64WithPrefix(blueDiamondNftData.defaultImgUrl);
            // const blueDiamondUniqueImageBase64 = await downloadNftImageAsBase64WithPrefix(blueDiamondNftData.uniqueImgUrl);
            nftNameCounter = 0;
            for (let i = 1; i <= blueDiamondNftData.giveawayCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, blueDiamondDefaultImageBase64, blueDiamondNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= blueDiamondNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, blueDiamondDefaultImageBase64, blueDiamondNftData, NftGroup.PRIVATE_SALE));
            }
            for (let i = 1; i <= blueDiamondNftData.presaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, blueDiamondDefaultImageBase64, blueDiamondNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= blueDiamondNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, blueDiamondDefaultImageBase64, blueDiamondNftData, NftGroup.PUBLIC_SALE));
            }

            collectionEntity.hashPowerInTh = nftEntities.reduce((accu, nftEntity) => {
                return accu + nftEntity.hashPowerInTh;
            }, 0);

            // do some generated data checks
            if (nftEntities.length !== presaleCollectionEntity.totalNfts) {
                this.alertStore.show(`Total nfts count is not as expected. Total: ${nftEntities.length}, Expected: ${presaleCollectionEntity.totalNfts}`)
                return;
            }

            if (collectionEntity.hashPowerInTh !== presaleCollectionEntity.expectedTotalHashPower) {
                this.alertStore.show(`Total hash power is not as expected. Total: ${collectionEntity.hashPowerInTh}, Expected: ${presaleCollectionEntity.expectedTotalHashPower}`)
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
        } finally {
            this.appStore.enableActions();
        }
    }
}

function createNft(index, presaleImage, nftData, group: NftGroup): NftEntity {
    const nftEntity = new NftEntity();

    nftEntity.name = `${nftData.name} ${index.formatSpace(4)}`;
    nftEntity.hashPowerInTh = nftData.hashPowerInTh;
    nftEntity.imageUrl = presaleImage;
    nftEntity.expirationDateTimestamp = nftData.expirationDateTimestamp;
    nftEntity.priceUsd = nftData.priceUsd;
    nftEntity.group = group;
    nftEntity.artistName = nftData.artistName;

    return nftEntity
}

async function downloadNftImageAsBase64WithPrefix(url: string): Promise < string > {
    const { data } = await axios.get(`/api/v1/general/downloadAsBase64?url=${encodeURIComponent(url)}`);
    // const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return `data:image/png;base64,${data}`;
}
