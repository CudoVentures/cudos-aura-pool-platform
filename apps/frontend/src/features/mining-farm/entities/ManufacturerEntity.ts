import S from '../../../core/utilities/Main';

enum ManufacturerId {
    AMD = '1',
    INTEL = '2'
}

export default class ManufacturerEntity {
    id: string;
    name: string;

    constructor() {
        this.id = S.Strings.NOT_EXISTS;
        this.name = S.Strings.EMPTY;
    }

    static newInstance(manufacturerId: ManufacturerId): ManufacturerEntity {
        const manufacturer = new ManufacturerEntity();

        manufacturer.id = manufacturerId;
        manufacturer.name = ManufacturerEntity.getManufacturerName(manufacturerId);

        return manufacturer;
    }

    static getAllManufacturers(): ManufacturerEntity[] {
        const manufacturers = [];

        manufacturers.push(ManufacturerEntity.newInstance(ManufacturerId.AMD));
        manufacturers.push(ManufacturerEntity.newInstance(ManufacturerId.INTEL));

        return manufacturers;
    }

    static toJson(entity: ManufacturerEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'id': entity.id,
            'name': entity.name,
        }
    }

    static fromJson(json): ManufacturerEntity {
        if (json === null) {
            return null;
        }

        const model = new ManufacturerEntity();

        model.id = json.id ?? model.id;
        model.name = json.name ?? model.name;

        return model;
    }

    static getManufacturerName(manufacturerId: ManufacturerId): string {
        switch (manufacturerId) {
            case ManufacturerId.AMD:
                return 'AMD';
            case ManufacturerId.INTEL:
                return 'Intel';
            default:
                return S.Strings.EMPTY;
        }
    }
}
