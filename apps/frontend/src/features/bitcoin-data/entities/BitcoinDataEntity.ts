import S from '../../../core/utilities/Main';

export default class BitcoinDataEntity {
    price: number;
    priceChange: number;
    blockReward: string;
    networkDifficulty: string;

    constructor() {
        this.price = S.NOT_EXISTS;
        this.priceChange = S.NOT_EXISTS;
        this.blockReward = S.Strings.EMPTY;
        this.networkDifficulty = S.Strings.EMPTY;
    }

    static toJson(entity: BitcoinDataEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'price': entity.price,
            'priceChange': entity.priceChange,
            'blockReward': entity.blockReward,
            'networkDifficulty': entity.networkDifficulty,
        }
    }

    static fromJson(json): BitcoinDataEntity {
        if (json === null) {
            return null;
        }

        const model = new BitcoinDataEntity();

        model.price = Number(json.price) ?? model.price;
        model.priceChange = Number(json.priceChange) ?? model.priceChange;
        model.blockReward = json.blockReward ?? model.blockReward;
        model.networkDifficulty = json.networkDifficulty ?? model.networkDifficulty;

        return model;
    }

}
