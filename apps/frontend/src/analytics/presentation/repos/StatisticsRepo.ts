import NftEntity from '../../../nft/entities/NftEntity';
import EarningsPerDayEntity from '../../entities/EarningsPerDayEntity';
import EarningsPerDayFilterEntity from '../../entities/EarningsPerDayFilterEntity';
import MegaWalletEventEntity from '../../entities/MegaWalletEventEntity';
import MegaWalletEventFilterModel from '../../entities/MegaWalletEventFilterModel';
import MiningFarmEarningsEntity from '../../entities/MiningFarmEarningsEntity';
import MiningFarmMaintenanceFeeEntity from '../../entities/MiningFarmMaintenanceFeeEntity';
import MiningFarmTotalEarningsBtcEntity from '../../entities/MiningFarmTotalEarningsBtcEntity';
import MiningFarmTotalEarningsCudosEntity from '../../entities/MiningFarmTotalEarningsCudosEntity';
import NftEarningsEntity from '../../entities/NftEarningsEntity';
import NftEventEntity from '../../entities/NftEventEntity';
import NftEventFilterModel from '../../entities/NftEventFilterModel';
import PlatformMaintenanceFeeEntity from '../../entities/PlatformMaintenanceFeeEntity';
import PlatformTotalEarningsBtcEntity from '../../entities/PlatformTotalEarningsBtcEntity';
import PlatformTotalEarningsCudosEntity from '../../entities/PlatformTotalEarningsCudosEntity';
import TotalEarningsEntity from '../../entities/TotalEarningsEntity';
import UserEarningsEntity from '../../entities/UserEarningsEntity';

export default interface StatisticsRepo {

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void);
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void);

    fetchNftEvents(nftEventFilterModel: NftEventFilterModel): Promise < { nftEventEntities: NftEventEntity[], nftEntities: NftEntity[], total: number } >;
    fetchMegaWalletEventEntities(megaWalletEventFilterModel: MegaWalletEventFilterModel): Promise < { megaWalletEventEntities: MegaWalletEventEntity[], nftEntities: NftEntity[], total: number } >;
    fetchTotalNftEarnings(timestampFrom: number, timestampTo: number): Promise < TotalEarningsEntity >;
    fetchNftEarningsBySessionAccount(timestampFrom: number, timestampTo: number): Promise < UserEarningsEntity >;
    fetchNftEarningsByNftId(nftId: string, timestampFrom: number, timestampTo: number): Promise < NftEarningsEntity >;
    fetchNftEarningsByMiningFarmId(miningFarmId: string, timestampFrom: number, timestampTo: number): Promise < MiningFarmEarningsEntity >;
    fetchEarningsPerDay(earningsPerDayFilterEntity: EarningsPerDayFilterEntity): Promise < EarningsPerDayEntity >;
    fetchMiningFarmMaintenanceFee(miningFarmId: string): Promise < MiningFarmMaintenanceFeeEntity >;
    fetchMiningFarmTotalEarningsBtc(miningFarmId: string): Promise < MiningFarmTotalEarningsBtcEntity >;
    fetchMiningFarmTotalEarningsCudos(miningFarmId: string): Promise < MiningFarmTotalEarningsCudosEntity >;
    fetchPlatformMaintenanceFee(): Promise < PlatformMaintenanceFeeEntity >;
    fetchPlatformTotalEarningsBtc(): Promise < PlatformTotalEarningsBtcEntity >;
    fetchPlatformTotalEarningsCudos(): Promise < PlatformTotalEarningsCudosEntity >;
}
