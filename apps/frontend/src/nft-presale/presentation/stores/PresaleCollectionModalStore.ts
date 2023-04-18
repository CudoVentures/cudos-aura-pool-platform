import { action, makeObservable, observable, runInAction } from 'mobx';
import axios from 'axios';
import AccountRepo from '../../../accounts/presentation/repos/AccountRepo';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import ModalStore from '../../../core/presentation/stores/ModalStore';
import { CHAIN_DETAILS } from '../../../core/utilities/Constants';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import CudosRepo from '../../../cudos-data/presentation/repos/CudosRepo';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import AddressMintDataEntity from '../../entities/AddressMintDataEntity';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';
import NftEntity, { NftGroup } from '../../../nft/entities/NftEntity';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import { PresaleCollectionEntity } from '../../entities/PresaleCollectionEntity';
import S from '../../../core/utilities/Main';

export enum ModalStage {
    UPLOAD_FILE,
    PREVIEW,
    PROCESSING,
    SUCCESS,
    FAIL
}

export default class PresaleCollectionModalStore extends ModalStore {

    alertStore: AlertStore;

    collectionRepo: CollectionRepo;

    @observable modalStage: ModalStage;
    @observable presaleCollectionEntity: PresaleCollectionEntity;
    @observable miningFarmId: string;
    @observable approvedCollectionEntities: CollectionEntity[]

    constructor(alertStore: AlertStore, collectionRepo: CollectionRepo) {
        super();

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
            const presaleImages01 = [], presaleImages02 = [];
            for (let i = 0; i < 5; ++i) {
                let baes64Image = await downloadNftImageAsBase64(`/assets/presale-nft-images/level${i + 1}-01.png`);
                presaleImages01.push(`data:image/png;base64,${baes64Image}`);
                baes64Image = await downloadNftImageAsBase64(`/assets/presale-nft-images/level${i + 1}-02.png`);
                presaleImages02.push(`data:image/png;base64,${baes64Image}`);
            }

            let collectionCoverImage01 = await downloadNftImageAsBase64('/assets/presale-nft-images/collection.png');
            collectionCoverImage01 = `data:image/png;base64,${collectionCoverImage01}`;

            let collectionProfileImage01 = await downloadNftImageAsBase64('/assets/presale-nft-images/collection-profile.png');
            collectionProfileImage01 = `data:image/png;base64,${collectionProfileImage01}`;

            const collectionEntity = new CollectionEntity();
            collectionEntity.farmId = miningFarmId;
            collectionEntity.name = presaleCollectionEntity.name;
            collectionEntity.description = presaleCollectionEntity.description;
            collectionEntity.profileImgUrl = collectionProfileImage01;
            collectionEntity.coverImgUrl = collectionCoverImage01;
            collectionEntity.royalties = presaleCollectionEntity.royalties;

            const nftEntities = [];

            // add OPAL tier for all sales
            const opalNftData = presaleCollectionEntity.nfts.opal;
            let nftNameCounter = 0;
            nftEntities.push(createNft(++nftNameCounter, presaleImages02[0], opalNftData, NftGroup.GIVEAWAY));
            for (let i = 2; i <= opalNftData.giveawayCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[0], opalNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= opalNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[0], opalNftData, NftGroup.PRIVATE_SALE));
            }
            nftEntities.push(createNft(++nftNameCounter, presaleImages02[0], opalNftData, NftGroup.PRESALE));
            for (let i = 2; i <= opalNftData.presaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[0], opalNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= opalNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[0], opalNftData, NftGroup.PUBLIC_SALE));
            }

            // add RUBY tier for all sales
            const rubyNftData = presaleCollectionEntity.nfts.ruby;
            nftNameCounter = 0;
            nftEntities.push(createNft(++nftNameCounter, presaleImages02[1], rubyNftData, NftGroup.GIVEAWAY));
            for (let i = 2; i <= rubyNftData.giveawayCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[1], rubyNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= rubyNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[1], rubyNftData, NftGroup.PRIVATE_SALE));
            }
            nftEntities.push(createNft(++nftNameCounter, presaleImages02[1], rubyNftData, NftGroup.PRESALE));
            for (let i = 2; i <= rubyNftData.presaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[1], rubyNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= rubyNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[1], rubyNftData, NftGroup.PUBLIC_SALE));
            }

            // add EMERALD tier for all sales
            const emeraldNftData = presaleCollectionEntity.nfts.emerald;
            nftNameCounter = 0;
            nftEntities.push(createNft(++nftNameCounter, presaleImages02[2], emeraldNftData, NftGroup.GIVEAWAY));
            for (let i = 2; i <= emeraldNftData.giveawayCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[2], emeraldNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= emeraldNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[2], emeraldNftData, NftGroup.PRIVATE_SALE));
            }
            nftEntities.push(createNft(++nftNameCounter, presaleImages02[2], emeraldNftData, NftGroup.PRESALE));
            for (let i = 2; i <= emeraldNftData.presaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[2], emeraldNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= emeraldNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[2], emeraldNftData, NftGroup.PUBLIC_SALE));
            }

            // add EMERALD tier for all sales
            const diamondNftData = presaleCollectionEntity.nfts.diamond;
            nftNameCounter = 0;
            nftEntities.push(createNft(++nftNameCounter, presaleImages02[3], diamondNftData, NftGroup.GIVEAWAY));
            for (let i = 2; i <= diamondNftData.giveawayCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[3], diamondNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= diamondNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[3], diamondNftData, NftGroup.PRIVATE_SALE));
            }
            nftEntities.push(createNft(++nftNameCounter, presaleImages02[3], diamondNftData, NftGroup.PRESALE));
            for (let i = 2; i <= diamondNftData.presaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[3], diamondNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= diamondNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[3], diamondNftData, NftGroup.PUBLIC_SALE));
            }

            // add EMERALD tier for all sales
            const blueDiamondNftData = presaleCollectionEntity.nfts.blueDiamond;
            nftNameCounter = 0;
            nftEntities.push(createNft(++nftNameCounter, presaleImages02[4], blueDiamondNftData, NftGroup.GIVEAWAY));
            for (let i = 2; i <= blueDiamondNftData.giveawayCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[4], blueDiamondNftData, NftGroup.GIVEAWAY));
            }
            for (let i = 1; i <= blueDiamondNftData.privateSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[4], blueDiamondNftData, NftGroup.PRIVATE_SALE));
            }
            nftEntities.push(createNft(++nftNameCounter, presaleImages02[4], blueDiamondNftData, NftGroup.PRESALE));
            for (let i = 2; i <= blueDiamondNftData.presaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[4], blueDiamondNftData, NftGroup.PRESALE));
            }
            for (let i = 1; i <= blueDiamondNftData.publicSaleCount; i++) {
                nftEntities.push(createNft(++nftNameCounter, presaleImages01[4], blueDiamondNftData, NftGroup.PUBLIC_SALE));
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

async function downloadNftImageAsBase64(url: string): Promise < string > {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary').toString('base64');
}
