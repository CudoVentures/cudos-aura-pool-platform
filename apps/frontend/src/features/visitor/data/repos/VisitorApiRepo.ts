import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import NftEntity from '../../../nft/entities/NftEntity';
import VisitorRepo from '../../presentation/repos/VisitorRepo';
import VisitorApi from '../data-sources/VisitorApi';

export default class VisitorApiRepo implements VisitorRepo {

    visitorApi: VisitorApi;

    constructor() {
        this.visitorApi = new VisitorApi();
    }

    async signalVisitMiningFarm(miningFarmEntity: MiningFarmEntity): Promise < void > {
        return this.visitorApi.signalVisitMiningFarm(miningFarmEntity);
    }

    async signalVisitNft(nftEntity: NftEntity): Promise < void > {
        return this.visitorApi.signalVisitNft(nftEntity);
    }

}
