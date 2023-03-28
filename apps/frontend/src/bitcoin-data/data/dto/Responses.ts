import BitcoinDataEntity from '../../entities/BitcoinDataEntity';

export class ResFetchBitcoinData {

    bitcoinDataEntity: BitcoinDataEntity;

    constructor(data) {
        this.bitcoinDataEntity = BitcoinDataEntity.fromJson(data.bitcoinDataEntity);
    }
}
