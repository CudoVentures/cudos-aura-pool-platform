import { NOT_EXISTS_INT } from '../../common/utils';
import { ManufacturerJsonValidator } from '../farm.types';
import { ManufacturerRepo } from '../repos/manufacturer.repo';

export default class ManufacturerEntity {

    manufacturerId: number;
    name: string;

    constructor() {
        this.manufacturerId = NOT_EXISTS_INT;
        this.name = '';
    }

    isNew(): boolean {
        return this.manufacturerId === NOT_EXISTS_INT;
    }

    static toRepo(entity: ManufacturerEntity): ManufacturerRepo {
        if (entity === null) {
            return null;
        }

        const repoJson = new ManufacturerRepo();

        if (entity.isNew() === false) {
            repoJson.id = entity.manufacturerId;
        }
        repoJson.name = entity.name;

        return repoJson;
    }

    static fromRepo(repoJson: ManufacturerRepo): ManufacturerEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new ManufacturerEntity();

        entity.manufacturerId = repoJson.id ?? entity.manufacturerId;
        entity.name = repoJson.name ?? entity.name;

        return entity;
    }

    static toJson(entity: ManufacturerEntity): ManufacturerJsonValidator {
        if (entity === null) {
            return null;
        }

        return {
            'manufacturerId': entity.manufacturerId.toString(),
            'name': entity.name,
        }
    }

    static fromJson(json: ManufacturerJsonValidator): ManufacturerEntity {
        if (json === null) {
            return null;
        }

        const model = new ManufacturerEntity();

        model.manufacturerId = parseInt(json.manufacturerId ?? model.manufacturerId.toString());
        model.name = json.name ?? model.name;

        return model;
    }

}
