import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import NftEntity from '../../../nft/entities/NftEntity';
import axios from '../../../core/utilities/AxiosWrapper';
import { ReqSignalVisitMiningFarm, ReqSignalVisitNft } from '../dto/Requests';

const VISITOR_ENDPOINT = '/api/v1/visitor';

export default class VisitorApi {

    async signalVisitMiningFarm(miningFarmEntity: MiningFarmEntity): Promise < void > {
        return axios.put(`${VISITOR_ENDPOINT}/signalVisitMiningFarm`, new ReqSignalVisitMiningFarm(miningFarmEntity));
    }

    async signalVisitNft(nftEntity: NftEntity): Promise < void > {
        return axios.put(`${VISITOR_ENDPOINT}/signalVisitNft`, new ReqSignalVisitNft(nftEntity));
    }

}
