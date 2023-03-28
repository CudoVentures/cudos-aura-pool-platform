import PurchaseTransactionEntity from '../../../nft/entities/PurchaseTransactionEntity';
import PurchaseTransactionsFilterModel from '../../../nft/entities/PurchaseTransactionsFilterModel';
import NftEntity from '../../../nft/entities/NftEntity';
import EarningsPerDayEntity from '../../entities/EarningsPerDayEntity';
import EarningsPerDayFilterEntity from '../../entities/EarningsPerDayFilterEntity';
import MegaWalletEventEntity from '../../entities/MegaWalletEventEntity';
import MegaWalletEventFilterModel from '../../entities/MegaWalletEventFilterModel';
import MiningFarmMaintenanceFeeEntity from '../../entities/MiningFarmMaintenanceFeeEntity';
import MiningFarmTotalEarningsBtcEntity from '../../entities/MiningFarmTotalEarningsBtcEntity';
import MiningFarmTotalEarningsCudosEntity from '../../entities/MiningFarmTotalEarningsCudosEntity';
import NftEarningsEntity from '../../entities/NftEarningsEntity';
import NftEventEntity from '../../entities/NftEventEntity';
import NftEventFilterModel from '../../entities/NftEventFilterModel';
import PlatformMaintenanceFeeEntity from '../../entities/PlatformMaintenanceFeeEntity';
import PlatformTotalEarningsBtcEntity from '../../entities/PlatformTotalEarningsBtcEntity';
import PlatformTotalEarningsCudosEntity from '../../entities/PlatformTotalEarningsCudosEntity';
import UserEarningsEntity from '../../entities/UserEarningsEntity';

export default interface StatisticsRepo {

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void);
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void);

    fetchNftEvents(nftEventFilterModel: NftEventFilterModel): Promise < { nftEventEntities: NftEventEntity[], nftEntities: NftEntity[], total: number } >;
    fetchMegaWalletEventEntities(megaWalletEventFilterModel: MegaWalletEventFilterModel): Promise < { megaWalletEventEntities: MegaWalletEventEntity[], nftEntities: NftEntity[], total: number } >;
    fetchNftEarningsBySessionAccount(timestampFrom: number, timestampTo: number): Promise < UserEarningsEntity >;
    fetchNftEarningsByNftId(nftId: string, timestampFrom: number, timestampTo: number): Promise < NftEarningsEntity >;
    fetchEarningsPerDay(earningsPerDayFilterEntity: EarningsPerDayFilterEntity): Promise < EarningsPerDayEntity >;
    fetchMiningFarmMaintenanceFee(miningFarmId: string, collectionId: string): Promise < MiningFarmMaintenanceFeeEntity >;
    fetchMiningFarmTotalEarningsBtc(miningFarmId: string, collectionId: string): Promise < MiningFarmTotalEarningsBtcEntity >;
    fetchMiningFarmTotalEarningsCudos(miningFarmId: string, collectionId: string): Promise < MiningFarmTotalEarningsCudosEntity >;
    fetchPlatformMaintenanceFee(): Promise < PlatformMaintenanceFeeEntity >;
    fetchPlatformTotalEarningsBtc(): Promise < PlatformTotalEarningsBtcEntity >;
    fetchPlatformTotalEarningsCudos(): Promise < PlatformTotalEarningsCudosEntity >;
}
