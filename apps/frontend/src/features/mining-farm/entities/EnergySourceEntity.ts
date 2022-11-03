import S from '../../../core/utilities/Main';

// enum EnergySourceId {
//     NUCLEAR_FUSION = '1',
//     WIND = '2',
//     COAL = '3',
// }

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

    // static newInstance(energySourceId: EnergySourceId): EnergySourceEntity {
    //     const energySource = new EnergySourceEntity();

    //     energySource.id = energySourceId;
    //     energySource.name = EnergySourceEntity.getEnergySourceName(energySourceId);

    //     return energySource;
    // }

    // static getAllEnergySources(): EnergySourceEntity[] {
    //     const energySources = [];

    //     energySources.push(EnergySourceEntity.newInstance(EnergySourceId.NUCLEAR_FUSION));
    //     energySources.push(EnergySourceEntity.newInstance(EnergySourceId.WIND));
    //     energySources.push(EnergySourceEntity.newInstance(EnergySourceId.COAL));

    //     return energySources;
    // }

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

    // static getEnergySourceName(energySourceId: EnergySourceId): string {
    //     switch (energySourceId) {
    //         case EnergySourceId.NUCLEAR_FUSION:
    //             return 'Nuclear Fusion';
    //         case EnergySourceId.COAL:
    //             return 'Coal';
    //         case EnergySourceId.WIND:
    //             return 'Wind';
    //         default:
    //             return S.Strings.EMPTY;
    //     }
    // }
}
