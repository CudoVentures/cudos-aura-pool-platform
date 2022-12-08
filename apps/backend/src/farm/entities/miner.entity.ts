import { NOT_EXISTS_INT } from '../../common/utils';
import { MinerRepo } from '../repos/miner.repo';

export default class MinerEntity {

    minerId: number;
    name: string;

    constructor() {
        this.minerId = NOT_EXISTS_INT;
        this.name = '';
    }

    isNew(): boolean {
        return this.minerId === NOT_EXISTS_INT;
    }

    static toRepo(entity: MinerEntity): MinerRepo {
        if (entity === null) {
            return null;
        }

        const repoJson = new MinerRepo();

        if (entity.isNew() === false) {
            repoJson.id = entity.minerId;
        }
        repoJson.name = entity.name;

        return repoJson;
    }

    static fromRepo(repoJson: MinerRepo): MinerEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new MinerEntity();

        entity.minerId = repoJson.id ?? entity.minerId;
        entity.name = repoJson.name ?? entity.name;

        return entity;
    }

    static toJson(entity: MinerEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'minerId': entity.minerId.toString(),
            'name': entity.name,
        }
    }

    static fromJson(json): MinerEntity {
        if (json === null) {
            return null;
        }

        const model = new MinerEntity();

        model.minerId = parseInt(json.minerId ?? model.minerId.toString());
        model.name = json.name ?? model.name;

        return model;
    }

}
