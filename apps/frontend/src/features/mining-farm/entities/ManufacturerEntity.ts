import S from '../../../core/utilities/Main';

export default class ManufacturerEntity {
    manufacturerId: string;
    name: string;

    constructor() {
        this.manufacturerId = S.Strings.NOT_EXISTS;
        this.name = S.Strings.EMPTY;
    }

    isNew(): boolean {
        return this.manufacturerId === S.Strings.NOT_EXISTS;
    }

    static toJson(entity: ManufacturerEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'manufacturerId': entity.manufacturerId,
            'name': entity.name,
        }
    }

    static fromJson(json): ManufacturerEntity {
        if (json === null) {
            return null;
        }

        const model = new ManufacturerEntity();

        model.manufacturerId = (json.manufacturerId ?? model.manufacturerId).toString();
        model.name = json.name ?? model.name;

        return model;
    }

}
