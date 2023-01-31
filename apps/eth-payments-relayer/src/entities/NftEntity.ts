import BigNumber from 'bignumber.js';

export enum NftStatus {
    QUEUED = 'queued',
    MINTED = 'minted',
    REMOVED = 'removed',
}

export default class NftEntity {
    id: string;
    priceInAcudos: BigNumber;
    priceInEth: BigNumber;
    priceValidUntil: number;
    status: NftStatus;

    constructor() {
        this.id = '';
        this.priceInAcudos = null;
        this.priceInEth = null;
        this.priceValidUntil = null;
        this.status = null;
    }

    isBasicValid(): boolean {
        return this.id !== ''
            && this.priceInAcudos !== null
            && this.priceInEth !== null
            && this.priceValidUntil !== null
            && this.status !== null;
    }

    isPriceValidNow(): boolean {
        return this.priceValidUntil >= Date.now();
    }

    isStatusQueued(): boolean {
        return this.status === NftStatus.QUEUED;
    }

    static fromJson(json): NftEntity {
        const entity = new NftEntity();

        entity.id = json.id ?? entity.id;
        entity.priceInAcudos = json.priceInAcudos ?? entity.priceInAcudos;
        entity.priceInEth = json.priceInEth ?? entity.priceInEth;
        entity.priceValidUntil = json.priceAcudosValidUntil ?? entity.priceValidUntil;
        entity.status = json.status ?? entity.status;

        return entity;
    }
}
