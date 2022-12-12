import { NOT_EXISTS_INT } from '../../common/utils';
import { EnergySourceJsonValidator } from '../farm.types';
import { EnergySourceRepo } from '../repos/energy-source.repo';

export default class EnergySourceEntity {

    energySourceId: number;
    name: string;

    constructor() {
        this.energySourceId = NOT_EXISTS_INT;
        this.name = '';
    }

    isNew(): boolean {
        return this.energySourceId === NOT_EXISTS_INT;
    }

    static toRepo(entity: EnergySourceEntity): EnergySourceRepo {
        if (entity === null) {
            return null;
        }

        const repoJson = new EnergySourceRepo();

        if (entity.isNew() === false) {
            repoJson.id = entity.energySourceId;
        }
        repoJson.name = entity.name;

        return repoJson;
    }

    static fromRepo(repoJson: EnergySourceRepo): EnergySourceEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new EnergySourceEntity();

        entity.energySourceId = repoJson.id ?? entity.energySourceId;
        entity.name = repoJson.name ?? entity.name;

        return entity;
    }

    static toJson(entity: EnergySourceEntity): EnergySourceJsonValidator {
        if (entity === null) {
            return null;
        }

        return {
            'energySourceId': entity.energySourceId.toString(),
            'name': entity.name,
        }
    }

    static fromJson(json: EnergySourceJsonValidator): EnergySourceEntity {
        if (json === null) {
            return null;
        }

        const model = new EnergySourceEntity();

        model.energySourceId = parseInt(json.energySourceId ?? model.energySourceId.toString());
        model.name = json.name ?? model.name;

        return model;
    }

}
