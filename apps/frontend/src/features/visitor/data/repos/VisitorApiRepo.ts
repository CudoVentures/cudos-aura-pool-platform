import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import NftEntity from '../../../nft/entities/NftEntity';
import VisitorRepo from '../../presentation/repos/VisitorRepo';
import VisitorApi from '../data-sources/VisitorApi';

export default class VisitorApiRepo implements VisitorRepo {

    visitorApi: VisitorApi;
    enableActions: () => void;
    disableActions: () => void;
    showAlert: (msg: string, positiveListener?: null | (() => boolean | void), negativeListener?: null | (() => boolean | void)) => void;

    constructor() {
        this.visitorApi = new VisitorApi();
        this.enableActions = null;
        this.disableActions = null;
        this.showAlert = null;
    }

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void) {
        this.enableActions = enableActions;
        this.disableActions = disableActions;
    }

    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener: null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void) {
        this.showAlert = showAlert;
    }

    async signalVisitMiningFarm(miningFarmEntity: MiningFarmEntity): Promise < void > {
        return this.visitorApi.signalVisitMiningFarm(miningFarmEntity);
    }

    async signalVisitNft(nftEntity: NftEntity): Promise < void > {
        return this.visitorApi.signalVisitNft(nftEntity);
    }

}
