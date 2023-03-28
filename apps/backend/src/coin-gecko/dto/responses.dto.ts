import BitcoinDataEntity from '../entities/bitcoin-data.entity';
import CudosDataEntity from '../entities/cudos-data.entity';

export class ResFetchBitcoinData {

    bitcoinDataEntity: BitcoinDataEntity;

    constructor(bitcoinDataEntity: BitcoinDataEntity) {
        this.bitcoinDataEntity = BitcoinDataEntity.toJson(bitcoinDataEntity);
    }

}

export class ResFetchCudosData {

    cudosDataEntity: CudosDataEntity;

    constructor(cudosDataEntity: CudosDataEntity) {
        this.cudosDataEntity = CudosDataEntity.toJson(cudosDataEntity);
    }

}
