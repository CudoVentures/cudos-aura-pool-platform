import S from '../../../../core/utilities/Main';
import { makeAutoObservable } from 'mobx';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import CollectionEntity from '../../entities/CollectionEntity';
import CollectionRepo from '../repos/CollectionRepo';
import BigNumber from 'bignumber.js';
import NftEntity from '../../../nft/entities/NftEntity';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';

class TempIdGenerator {
    lastId: number;

    constructor() {
        this.lastId = 0;
    }

    generateNewId(): string {
        this.lastId -= 1;

        return this.lastId.toString();
    }
}

export default class CreditCollectionNftsPageStore {
    accountSessionStore: AccountSessionStore;
    miningFarmRepo: MiningFarmRepo;
    collectionRepo: CollectionRepo;
    nftRepo: NftRepo;

    tempIdGenerator: TempIdGenerator;

    collectionEntity: CollectionEntity;
    nftEntities: NftEntity[];
    addedOrEdittedNftEntities: NftEntity[];
    selectedNftEntity: NftEntity;

    defaultHashAndPriceValues: number;
    hashPowerPerNft: number;
    pricePerNft: BigNumber;

    constructor(accountSessionStore: AccountSessionStore, collectionRepo: CollectionRepo, nftRepo: NftRepo, miningFarmRepo: MiningFarmRepo) {
        this.accountSessionStore = accountSessionStore;
        this.collectionRepo = collectionRepo;
        this.nftRepo = nftRepo;
        this.miningFarmRepo = miningFarmRepo;

        this.collectionEntity = null;
        this.nftEntities = [];
        this.addedOrEdittedNftEntities = [];
        this.selectedNftEntity = null;
        this.tempIdGenerator = null;

        this.defaultHashAndPriceValues = S.INT_FALSE;
        this.hashPowerPerNft = S.NOT_EXISTS;
        this.pricePerNft = new BigNumber(S.NOT_EXISTS);

        makeAutoObservable(this);
    }

    async init(collectionId: string = S.Strings.NOT_EXISTS) {
        await this.fetch(collectionId);
    }

    async fetch(collectionId: string) {
        this.tempIdGenerator = new TempIdGenerator();

        if (collectionId !== S.Strings.NOT_EXISTS) {
            this.collectionEntity = await this.collectionRepo.fetchCollectionById(collectionId);
            const nftFilter = new NftFilterModel();
            nftFilter.collectionIds = [collectionId];
            nftFilter.count = Number.MAX_SAFE_INTEGER;

            const { nftEntities } = await this.nftRepo.fetchNftsByFilter(nftFilter);
            this.nftEntities = nftEntities;
        } else {
            this.collectionEntity = new CollectionEntity();
            this.collectionEntity.farmId = (await this.miningFarmRepo.fetchMiningFarmBySessionAccountId()).id;
            this.collectionEntity.ownerAddress = (await this.accountSessionStore.adminEntity).cudosWalletAddress;
        }

    }

    initNewNftEntity(): void {
        const nftEntity = new NftEntity();

        nftEntity.price = this.pricePerNft;
        nftEntity.hashPower = this.hashPowerPerNft;
        nftEntity.farmRoyalties = this.collectionEntity.royalties;
        nftEntity.maintenanceFee = this.collectionEntity.maintenanceFees;

        this.selectedNftEntity = nftEntity;
    }

    isSelectedNftImageEmpty(): boolean {
        return this.selectedNftEntity.imageUrl === S.Strings.EMPTY
    }

    isProfilePictureEmpty(): boolean {
        return this.collectionEntity.profileImgUrl === S.Strings.EMPTY
    }

    isCoverPictureEmpty(): boolean {
        return this.collectionEntity.coverImgUrl === S.Strings.EMPTY
    }

    onChangeCollectionName = (name: string) => {
        this.collectionEntity.name = name;
    }

    onChangeCollectionDescription = (description: string) => {
        this.collectionEntity.description = description;
    }

    onChangeHashingPower = (hashRate: string) => {
        this.collectionEntity.hashPower = Number(hashRate);
    }

    onChangeCollectionRoyalties = (royalties: string) => {
        this.collectionEntity.royalties = Number(royalties);
    }

    onChangeMaintenanceFees = (maintenanceFees: string) => {
        this.collectionEntity.maintenanceFees = new BigNumber(maintenanceFees);
    }

    onChangeCollectionPayoutAddress = (payoutAddress: string) => {
        this.collectionEntity.payoutAddress = payoutAddress;
    }

    onChangeAcceptDefaultHashPowerCheckboxValue = () => {
        const newValue = this.defaultHashAndPriceValues === S.INT_FALSE ? S.INT_TRUE : S.INT_FALSE;
        this.defaultHashAndPriceValues = newValue;
    }

    onChangeHashPowerPerNft = (hashPowerPerNft: string) => {
        this.hashPowerPerNft = Number(hashPowerPerNft);
    }

    onChangePricePerNft = (pricePerNft: string) => {
        this.pricePerNft = new BigNumber(pricePerNft);
    }

    onChangeSelectedNftName = (nftName: string) => {
        this.selectedNftEntity.name = nftName;
    }

    onChangeSelectedNftHashPower = (hasHPower: string) => {
        this.selectedNftEntity.hashPower = Number(hasHPower);
    }

    onChangeSelectedNftPrice = (price: string) => {
        this.selectedNftEntity.price = new BigNumber(price);
    }

    onChangeSelectedNftRoyalties = (royalties: string) => {
        this.selectedNftEntity.farmRoyalties = Number(royalties);
    }

    onChangeSelectedNftMaintenanceFee() {
        if (this.selectedNftEntity.maintenanceFee.eq(new BigNumber(S.NOT_EXISTS))) {
            return ''
        }

        return this.selectedNftEntity.maintenanceFee.toString();
    }

    onChangeSelectedNftExpirationDate = (expirationDate: number) => {
        this.selectedNftEntity.expiryDate = expirationDate;
    }

    onClickEditNft = (nftEntityId: string) => {
        this.selectedNftEntity = this.nftEntities.find((nftEntity: NftEntity) => nftEntity.id === nftEntityId).cloneDeep();
    }

    onClickSendForApproval = async () => {
        this.collectionEntity.markQueued();
        await this.collectionRepo.creditCollection(this.collectionEntity, this.addedOrEdittedNftEntities);
    }

    onClickDeleteNft = (nftEntityId: string) => {
        this.nftEntities = this.nftEntities.filter((nftEntity: NftEntity) => nftEntity.id !== nftEntityId);
    }

    onClickAddToCollection = () => {
        if (this.selectedNftEntity.id !== S.Strings.NOT_EXISTS) {
            const existingNftEntity = this.nftEntities.find((nftEntity: NftEntity) => nftEntity.id === this.selectedNftEntity.id)
            existingNftEntity.copyDeepFrom(this.selectedNftEntity);

            if (this.addedOrEdittedNftEntities.find((nftEntity: NftEntity) => nftEntity.id === this.selectedNftEntity.id) === undefined) {
                this.addedOrEdittedNftEntities.push(this.selectedNftEntity);
            }
        } else {
            this.selectedNftEntity.id = this.tempIdGenerator.generateNewId();
            this.nftEntities.push(this.selectedNftEntity);
            this.addedOrEdittedNftEntities.push(this.selectedNftEntity);
        }

        this.initNewNftEntity();
    }

    getHashingPowerInputValue() {
        if (this.collectionEntity.hashPower === S.NOT_EXISTS) {
            return ''
        }

        return this.collectionEntity.hashPower;
    }

    getHashPowerPerNft() {
        if (this.hashPowerPerNft === S.NOT_EXISTS) {
            return ''
        }

        return this.hashPowerPerNft.toString();
    }

    getPricePerNft() {
        if (this.pricePerNft.eq(S.NOT_EXISTS)) {
            return ''
        }

        return this.pricePerNft.toString();
    }

    getSelectedNftMaintenanceFeeInputValue() {
        if (this.selectedNftEntity.maintenanceFee.eq(new BigNumber(S.NOT_EXISTS))) {
            return ''
        }

        return this.selectedNftEntity.maintenanceFee.toString();
    }

    getCollectionRoyaltiesInputValue() {
        if (this.collectionEntity.royalties === S.NOT_EXISTS) {
            return ''
        }

        return this.collectionEntity.royalties.toString();
    }

    getCollectionMaintenanceFeesInputValue() {
        if (this.collectionEntity.maintenanceFees.eq(new BigNumber(S.NOT_EXISTS))) {
            return ''
        }

        return this.collectionEntity.maintenanceFees.toString();
    }

    getSelectedNftRoyaltiesInputValue() {
        if (this.selectedNftEntity.farmRoyalties === S.NOT_EXISTS) {
            return ''
        }

        return this.selectedNftEntity.farmRoyalties.toString();
    }

    getSelectedNftExpirationDateDisplay() {
        return this.selectedNftEntity.expiryDate === S.NOT_EXISTS ? Date.now() : new Date(this.selectedNftEntity.expiryDate)
    }

    getAddedNftCount() {
        return this.addedOrEdittedNftEntities.length;
    }
}
