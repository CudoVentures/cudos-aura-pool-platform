import BigNumber from 'bignumber.js';
import S from '../../../core/utilities/Main';
import ProjectUtils from '../../../core/utilities/ProjectUtils';

export default class CollectionDetailsEntity {

    collectionId: string;
    floorPriceInAcudos: BigNumber;
    volumeInAcudos: BigNumber;
    owners: number;
    cudosAddress: string;
    remainingHashPowerInTH: number;

    constructor() {
        this.collectionId = S.Strings.NOT_EXISTS;
        this.floorPriceInAcudos = new BigNumber(0);
        this.volumeInAcudos = new BigNumber(0);
        this.owners = 0;
        this.cudosAddress = '';
        this.remainingHashPowerInTH = 0;
    }

    formatFloorPriceInCudos(): string {
        return `${this.floorPriceInAcudos?.dividedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER).toFixed(0) ?? '0'} CUDOS`;
    }

    formatVolumeInCudos(): string {
        return `${this.volumeInAcudos?.dividedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER).toFixed(0) ?? '0'} CUDOS`;
    }

    static toJson(entity: CollectionDetailsEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'id': entity.collectionId,
            'floorPriceInAcudos': entity.floorPriceInAcudos.toString(),
            'volumeInAcudos': entity.volumeInAcudos.toString(),
            'owners': entity.owners,
            'cudosAddress': entity.cudosAddress,
            'remainingHashPowerInTH': entity.remainingHashPowerInTH,
        }
    }

    static fromJson(json: any): CollectionDetailsEntity {
        if (json === null) {
            return null;
        }

        const entity = new CollectionDetailsEntity();

        entity.collectionId = (json.id ?? entity.collectionId).toString();
        entity.floorPriceInAcudos = new BigNumber(json.floorPriceInAcudos ?? entity.floorPriceInAcudos);
        entity.volumeInAcudos = new BigNumber(json.volumeInAcudos ?? entity.volumeInAcudos);
        entity.owners = parseInt(json.owners ?? entity.owners);
        entity.cudosAddress = json.cudosAddress ?? entity.cudosAddress;
        entity.remainingHashPowerInTH = parseInt(json.remainingHashPowerInTH ?? entity.remainingHashPowerInTH);

        return entity;
    }

}
