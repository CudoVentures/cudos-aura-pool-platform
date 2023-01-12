import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import NftEntity from '../../../nft/entities/NftEntity';

export default interface VisitorRepo {

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void);
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void);

    signalVisitMiningFarm(miningFarmEntity: MiningFarmEntity): Promise < void >;
    signalVisitNft(nftEntity: NftEntity): Promise < void >;

}
