import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import NftEntity from '../../../nft/entities/NftEntity';
import VisitorRepo from '../repos/VisitorRepo';

export default class VisitorStore {

    visitorRepo: VisitorRepo

    constructor(visitorRepo: VisitorRepo) {
        this.visitorRepo = visitorRepo;
    }

    async signalVisitMiningFarm(miningFarmEntity: MiningFarmEntity) {
        return this.visitorRepo.signalVisitMiningFarm(miningFarmEntity);
    }

    async signalVisitNft(nftEntity: NftEntity) {
        return this.visitorRepo.signalVisitNft(nftEntity);
    }

}
