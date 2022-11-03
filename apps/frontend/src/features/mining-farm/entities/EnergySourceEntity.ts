import S from '../../../core/utilities/Main';

export default class EnergySourceEntity {

    energySourceId: string;
    name: string;

    constructor() {
        this.energySourceId = S.Strings.NOT_EXISTS;
        this.name = S.Strings.EMPTY;
    }

    isNew(): boolean {
        return this.energySourceId === S.Strings.NOT_EXISTS;
    }

    static toJson(entity: EnergySourceEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'energySourceId': entity.energySourceId,
            'name': entity.name,
        }
    }

    static fromJson(json): EnergySourceEntity {
        if (json === null) {
            return null;
        }

        const model = new EnergySourceEntity();

        model.energySourceId = (json.energySourceId ?? model.energySourceId).toString();
        model.name = json.name ?? model.name;

        return model;
    }

}
