import BigNumber from 'bignumber.js';
import S from '../../../core/utilities/Main';
import ProjectUtils from '../../../core/utilities/ProjectUtils';

export default class CollectionDetailsEntity {

    collectionId: string;
    floorPrice: BigNumber;
    volume: BigNumber;
    owners: number;
    cudosAddress: string;

    constructor() {
        this.collectionId = S.Strings.NOT_EXISTS;
        this.floorPrice = null;
        this.volume = null;
        this.owners = 0;
        this.cudosAddress = '';
    }

    formatFloorPriceInCudos(): string {
        return `${this.floorPrice?.dividedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER).toFixed(0) ?? '0'} CUDOS`;
    }

    formatVolumeInCudos(): string {
        return `${this.volume?.dividedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER).toFixed(0) ?? '0'} CUDOS`;
    }

    static toJson(entity: CollectionDetailsEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'collectionId': entity.collectionId,
            'floorPrice': entity.floorPrice.toString(),
            'volume': entity.volume.toString(),
            'owners': entity.owners,
            'cudosAddress': entity.cudosAddress,
        }
    }

    static fromJson(json: any): CollectionDetailsEntity {
        if (json === null) {
            return null;
        }

        const entity = new CollectionDetailsEntity();

        entity.collectionId = (json.collectionId ?? entity.collectionId).toString();
        entity.floorPrice = new BigNumber(json.floorPrice ?? entity.floorPrice);
        entity.volume = new BigNumber(json.volume ?? entity.volume);
        entity.owners = parseInt(json.owners ?? entity.owners);
        entity.cudosAddress = json.cudosAddress ?? entity.cudosAddress;

        return entity;
    }

}
