import { makeAutoObservable } from 'mobx';
import S from '../../core/utilities/Main';

export enum PictureType {
    FARM_PROFILE = '1',
    FARM_COVER = '2',
    FARM_PHOTO = '3',
    COLLECTION_PROFILE = '4',
    COLLECTION_COVER = '5',
    USER_COVER = '6',
    USER_PROFILE = '7'
}

export default class ImageEntity {

    id: string;
    type: string;
    sizeBytes: number;
    base64: string;

    constructor() {
        this.id = S.Strings.NOT_EXISTS;
        this.type = S.Strings.EMPTY;
        this.sizeBytes = S.NOT_EXISTS;
        this.base64 = S.Strings.EMPTY;

        makeAutoObservable(this, {
            'type': false,
        });
    }

    static new(base64File: string, pictureType: PictureType): ImageEntity {
        const imageEntity = new ImageEntity();
        // TODO upload or generate good id

        imageEntity.id = Date.now().toString();
        imageEntity.base64 = base64File;
        imageEntity.sizeBytes = base64File.length;
        imageEntity.type = pictureType;

        return imageEntity;
    }

    isMimeTypeKnown(): boolean {
        return this.type !== S.Strings.EMPTY;
    }

    toJSON(): any {
        return {
            'id': this.id,
            'type': this.type,
            'sizeBytes': this.sizeBytes,
            'base64': this.base64,
        }
    }

    static fromJSON(json): ImageEntity {
        if (json === null) {
            return null;
        }

        const model = new ImageEntity();

        model.id = json.id ?? model.id;
        model.type = json.type ?? model.type;
        model.sizeBytes = Number(json.sizeBytes) ?? model.sizeBytes;
        model.base64 = json.base64 ?? model.base64;

        return model;
    }
}
