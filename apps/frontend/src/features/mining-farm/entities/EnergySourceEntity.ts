import S from '../../../core/utilities/Main';

enum EnergySourceId {
    NUCLEAR_FUSION = '1',
    WIND = '2',
    COAL = '3',
}

export default class EnergySourceEntity {
    id: string;
    name: string;

    constructor() {
        this.id = S.Strings.NOT_EXISTS;
        this.name = S.Strings.EMPTY;
    }

    static newInstance(energySourceId: EnergySourceId): EnergySourceEntity {
        const energySource = new EnergySourceEntity();

        energySource.id = energySourceId;
        energySource.name = EnergySourceEntity.getEnergySourceName(energySourceId);

        return energySource;
    }

    static getAllEnergySources(): EnergySourceEntity[] {
        const energySources = [];

        energySources.push(EnergySourceEntity.newInstance(EnergySourceId.NUCLEAR_FUSION));
        energySources.push(EnergySourceEntity.newInstance(EnergySourceId.WIND));
        energySources.push(EnergySourceEntity.newInstance(EnergySourceId.COAL));

        return energySources;
    }

    static toJson(entity: EnergySourceEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'id': entity.id,
            'name': entity.name,
        }
    }

    static fromJson(json): EnergySourceEntity {
        if (json === null) {
            return null;
        }

        const model = new EnergySourceEntity();

        model.id = json.id ?? model.id;
        model.name = json.name ?? model.name;

        return model;
    }

    static getEnergySourceName(energySourceId: EnergySourceId): string {
        switch (energySourceId) {
            case EnergySourceId.NUCLEAR_FUSION:
                return 'Nuclear Fusion';
            case EnergySourceId.COAL:
                return 'Coal';
            case EnergySourceId.WIND:
                return 'Wind';
            default:
                return S.Strings.EMPTY;
        }
    }
}
