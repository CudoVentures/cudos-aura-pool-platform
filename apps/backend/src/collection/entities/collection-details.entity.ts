import { NOT_EXISTS_INT, NOT_EXISTS_STRING } from '../../common/utils';

export class CollectionDetailsEntity {
    id: number;
    floorPriceInAcudos: string;
    volumeInAcudos: string;
    owners: number;
    cudosAddress: string;
    remainingHashPowerInTH: number;

    constructor() {
        this.id = NOT_EXISTS_INT;
        this.floorPriceInAcudos = NOT_EXISTS_STRING;
        this.volumeInAcudos = NOT_EXISTS_STRING;
        this.owners = NOT_EXISTS_INT;
        this.cudosAddress = '';
        this.remainingHashPowerInTH = NOT_EXISTS_INT;
    }

    static toJson(entity: CollectionDetailsEntity): any {
        return {
            'id': entity.id,
            'floorPriceInAcudos': entity.floorPriceInAcudos,
            'volumeInAcudos': entity.volumeInAcudos,
            'owners': entity.owners,
            'cudosAddress': entity.cudosAddress,
            'remainingHashPowerInTH': entity.remainingHashPowerInTH,
        }
    }
}
