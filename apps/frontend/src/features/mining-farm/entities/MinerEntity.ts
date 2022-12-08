import S from '../../../core/utilities/Main';

export default class MinerEntity {
    minerId: string;
    name: string;

    constructor() {
        this.minerId = S.Strings.NOT_EXISTS;
        this.name = '';
    }

    static newInstance(minerId: string, name: string) {
        const entity = new MinerEntity();

        entity.minerId = minerId;
        entity.name = name;

        return entity;
    }

    isNew(): boolean {
        return this.minerId === S.Strings.NOT_EXISTS;
    }

    static toJson(entity: MinerEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'minerId': entity.minerId,
            'name': entity.name,
        }
    }

    static fromJson(json): MinerEntity {
        if (json === null) {
            return null;
        }

        const model = new MinerEntity();

        model.minerId = (json.minerId ?? model.minerId).toString();
        model.name = json.name ?? model.name;

        return model;
    }

}
