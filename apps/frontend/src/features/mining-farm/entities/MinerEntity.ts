import S from '../../../core/utilities/Main';

// enum MinerId {
//     ANTMINER = '1',
//     WHATSMINER = '2'
// }

export default class MinerEntity {
    minerId: string;
    name: string;

    constructor() {
        this.minerId = S.Strings.NOT_EXISTS;
        this.name = S.Strings.EMPTY;
    }

    isNew(): boolean {
        return this.minerId === S.Strings.NOT_EXISTS;
    }

    // static newInstance(minerId: MinerId): MinerEntity {
    //     const miner = new MinerEntity();

    //     miner.id = minerId;
    //     miner.name = MinerEntity.getMinerName(minerId);

    //     return miner;
    // }

    // static getAllMiners(): MinerEntity[] {
    //     const miners = [];

    //     miners.push(MinerEntity.newInstance(MinerId.ANTMINER));
    //     miners.push(MinerEntity.newInstance(MinerId.WHATSMINER));

    //     return miners;
    // }

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

    // static getMinerName(minerId: MinerId): string {
    //     switch (minerId) {
    //         case MinerId.ANTMINER:
    //             return 'Antminer S9K 14TH/s';
    //         case MinerId.WHATSMINER:
    //             return 'Whatsminer M30S++';
    //         default:
    //             return S.Strings.EMPTY;
    //     }
    // }
}
