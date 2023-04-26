import S from '../../core/utilities/Main';
import { NftTier, tierPriceMap } from '../../nft/entities/NftEntity';

export class PresaleCollectionEntity {

    name: string;
    description: string;
    royalties: number;
    totalNfts: number;
    expectedTotalHashPower: number;
    denomId: string;
    coverImgUrl: string;
    profileImgUrl: string;
    nfts: PresaleCollectionTrirObj;

    constructor() {
        this.name = '';
        this.description = '';
        this.royalties = S.NOT_EXISTS;
        this.totalNfts = 0;
        this.denomId = '';
        this.coverImgUrl = '';
        this.profileImgUrl = '';
        this.nfts = null;
    }

    static fromJson(json: any): PresaleCollectionEntity {
        if (typeof (json) !== 'object' || json === null) {
            throw Error(`Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.name) !== 'string') {
            throw Error(`Missing name. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.description) !== 'string') {
            throw Error(`Missing description. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.royalties) !== 'number') {
            throw Error(`Missing royalties. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.totalNfts) !== 'number') {
            throw Error(`Missing totalNfts. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.expectedTotalHashPower) !== 'number') {
            throw Error(`Missing expectedTotalHashPower. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.coverImgUrl) !== 'string') {
            throw Error(`Missing coverImgUrl. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.profileImgUrl) !== 'string') {
            throw Error(`Missing profileImgUrl. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (json.coverImgUrl === '') {
            throw Error(`Empty coverImgUrl. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (json.profileImgUrl === '') {
            throw Error(`Empty profileImgUrl. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.nfts) !== 'object') {
            throw Error(`Missing nfts. Invalid JSON ${JSON.stringify(json)}`);
        }

        const entity = new PresaleCollectionEntity();

        entity.name = json.name ?? entity.name
        entity.description = json.description ?? entity.description
        entity.royalties = parseInt(json.royalties ?? entity.royalties.toString());
        entity.totalNfts = parseInt(json.totalNfts ?? entity.totalNfts.toString());
        entity.expectedTotalHashPower = parseInt(json.expectedTotalHashPower ?? entity.expectedTotalHashPower.toString());
        entity.nfts = PresaleCollectionTrirObj.fromJson(json.nfts);
        entity.coverImgUrl = json.coverImgUrl ?? entity.coverImgUrl;
        entity.profileImgUrl = json.profileImgUrl ?? entity.profileImgUrl;
        entity.denomId = entity.name.toLowerCase().replace(/ /g, '');

        return entity;
    }

}

class PresaleCollectionTrirObj {

    opal: PresaleCollectionTier;
    ruby: PresaleCollectionTier;
    emerald: PresaleCollectionTier;
    diamond: PresaleCollectionTier;
    blueDiamond: PresaleCollectionTier;

    constructor() {
        this.opal = null;
        this.ruby = null;
        this.emerald = null;
        this.diamond = null;
        this.blueDiamond = null;
    }

    static fromJson(json: any): PresaleCollectionTrirObj {
        if (typeof (json) !== 'object' || json === null) {
            throw Error(`Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.opal) !== 'object') {
            throw Error(`Missing opal. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.ruby) !== 'object') {
            throw Error(`Missing ruby. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.emerald) !== 'object') {
            throw Error(`Missing emerald. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.diamond) !== 'object') {
            throw Error(`Missing diamond. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.blueDiamond) !== 'object') {
            throw Error(`Missing blueDiamond. Invalid JSON ${JSON.stringify(json)}`);
        }

        const entity = new PresaleCollectionTrirObj();

        entity.opal = PresaleCollectionTier.fromJson(json.opal);
        entity.ruby = PresaleCollectionTier.fromJson(json.ruby);
        entity.emerald = PresaleCollectionTier.fromJson(json.emerald);
        entity.diamond = PresaleCollectionTier.fromJson(json.diamond);
        entity.blueDiamond = PresaleCollectionTier.fromJson(json.blueDiamond);

        return entity;
    }

}

export class PresaleCollectionTier {

    totalCount: number;
    giveawayCount: number;
    privateSaleCount: number;
    presaleCount: number;
    publicSaleCount: number;
    name: string;
    hashPowerInTh: number;
    expirationDateTimestamp: number;
    priceUsd: number;
    artistName: string;
    defaultImgUrl: string;
    uniqueImgUrl: string;

    constructor() {
        this.totalCount = 0;
        this.giveawayCount = 0;
        this.privateSaleCount = 0;
        this.presaleCount = 0;
        this.publicSaleCount = 0;
        this.name = '';
        this.hashPowerInTh = 0;
        this.expirationDateTimestamp = S.NOT_EXISTS;
        this.priceUsd = S.NOT_EXISTS;
        this.artistName = '';
        this.defaultImgUrl = '';
        this.uniqueImgUrl = '';
    }

    populateDataBasedOnName() {
        switch (this.name) {
            case 'Opal':
                this.priceUsd = tierPriceMap.get(NftTier.TIER_1);
                // this.defaultImgUrl = '/assets/presale-nft-images/level1-01.png';
                // this.uniqueImgUrl = '/assets/presale-nft-images/level1-02.png';
                break;
            case 'Ruby':
                this.priceUsd = tierPriceMap.get(NftTier.TIER_2);
                // this.defaultImgUrl = '/assets/presale-nft-images/level2-01.png';
                // this.uniqueImgUrl = '/assets/presale-nft-images/level2-02.png';
                break;
            case 'Emerald':
                this.priceUsd = tierPriceMap.get(NftTier.TIER_3);
                // this.defaultImgUrl = '/assets/presale-nft-images/level3-01.png';
                // this.uniqueImgUrl = '/assets/presale-nft-images/level3-02.png';
                break;
            case 'Diamond':
                this.priceUsd = tierPriceMap.get(NftTier.TIER_4);
                // this.defaultImgUrl = '/assets/presale-nft-images/level4-01.png';
                // this.uniqueImgUrl = '/assets/presale-nft-images/level4-02.png';
                break;
            case 'Blue Diamond':
                this.priceUsd = tierPriceMap.get(NftTier.TIER_5);
                // this.defaultImgUrl = '/assets/presale-nft-images/level5-01.png';
                // this.uniqueImgUrl = '/assets/presale-nft-images/level5-02.png';
                break;
            default:
                throw new Error(`Invalid name. ${this.name}`)
        }
    }

    hasUniqueImgUrl(): boolean {
        return this.uniqueImgUrl !== '';
    }

    static fromJson(json: any): PresaleCollectionTier {
        if (typeof (json) !== 'object' || json === null) {
            throw Error(`Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.totalCount) !== 'number') {
            throw Error(`Missing totalCount. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.giveawayCount) !== 'number') {
            throw Error(`Missing giveawayCount. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.privateSaleCount) !== 'number') {
            throw Error(`Missing privateSaleCount. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.presaleCount) !== 'number') {
            throw Error(`Missing presaleCount. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.publicSaleCount) !== 'number') {
            throw Error(`Missing publicSaleCount. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.name) !== 'string') {
            throw Error(`Missing name. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.hashPowerInTh) !== 'number') {
            throw Error(`Missing hashPowerInTh. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.expirationDateTimestamp) !== 'number') {
            throw Error(`Missing expirationDateTimestamp. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.artistName) !== 'string') {
            throw Error(`Missing artistName. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (typeof (json.defaultImgUrl) !== 'string') {
            throw Error(`Missing defaultImgUrl. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (json.defaultImgUrl === '') {
            throw Error(`Empty defaultImgUrl. Invalid JSON ${JSON.stringify(json)}`);
        }

        if (json.uniqueImgUrl !== undefined) {
            if (typeof (json.uniqueImgUrl) !== 'string') {
                throw Error(`Missing uniqueImgUrl. Invalid JSON ${JSON.stringify(json)}`);
            }

            if (json.uniqueImgUrl === '') {
                throw Error(`Empty uniqueImgUrl. Invalid JSON ${JSON.stringify(json)}`);
            }
        }

        const entity = new PresaleCollectionTier();

        entity.totalCount = parseInt(json.totalCount ?? entity.totalCount.toString());
        entity.giveawayCount = parseInt(json.giveawayCount ?? entity.giveawayCount.toString());
        entity.privateSaleCount = parseInt(json.privateSaleCount ?? entity.privateSaleCount.toString());
        entity.presaleCount = parseInt(json.presaleCount ?? entity.presaleCount.toString());
        entity.publicSaleCount = parseInt(json.publicSaleCount ?? entity.publicSaleCount.toString());
        entity.name = json.name ?? entity.name;
        entity.hashPowerInTh = parseInt(json.hashPowerInTh ?? entity.hashPowerInTh.toString());
        entity.expirationDateTimestamp = parseInt(json.expirationDateTimestamp ?? entity.expirationDateTimestamp.toString());
        entity.artistName = json.artistName ?? entity.artistName;
        entity.defaultImgUrl = json.defaultImgUrl ?? entity.defaultImgUrl;
        entity.uniqueImgUrl = json.uniqueImgUrl ?? entity.uniqueImgUrl;

        entity.populateDataBasedOnName();

        return entity;
    }

}
