import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import NftEntity from '../../../nft/entities/NftEntity';

export default interface VisitorRepo {

    signalVisitMiningFarm(miningFarmEntity: MiningFarmEntity): Promise < void >;
    signalVisitNft(nftEntity: NftEntity): Promise < void >;

}
