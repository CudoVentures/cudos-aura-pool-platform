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
import StatisticsRepo from '../../presentation/repos/StatisticsRepo';
import StatisticsApi from '../data-sources/StatisticsApi';

export default class StatisticsApiRepo implements StatisticsRepo {

    statisticsApi: StatisticsApi;
    enableActions: () => void;
    disableActions: () => void;
    showAlert: (msg: string, positiveListener?: null | (() => boolean | void), negativeListener?: null | (() => boolean | void)) => void;

    constructor() {
        this.statisticsApi = new StatisticsApi();
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

    async fetchNftEvents(nftEventFilterModel: NftEventFilterModel): Promise < { nftEventEntities: NftEventEntity[], nftEntities: NftEntity[], total: number } > {
        try {
            this.disableActions?.();
            return await this.statisticsApi.fetchNftEvents(nftEventFilterModel);
        } finally {
            this.enableActions?.();
        }
    }

    async fetchMegaWalletEventEntities(megaWalletEventFilterModel: MegaWalletEventFilterModel): Promise < { megaWalletEventEntities: MegaWalletEventEntity[], nftEntities: NftEntity[], total: number } > {
        try {
            this.disableActions?.();
            return await this.statisticsApi.fetchMegaWalletEventEntities(megaWalletEventFilterModel);
        } finally {
            this.enableActions?.();
        }
    }

    async fetchNftEarningsBySessionAccount(timestampFrom: number, timestampTo: number): Promise < UserEarningsEntity > {
        try {
            this.disableActions?.();
            return await this.statisticsApi.fetchNftEarningsBySessionAccount(timestampFrom, timestampTo);
        } finally {
            this.enableActions?.();
        }
    }

    async fetchNftEarningsByNftId(nftId: string, timestampFrom: number, timestampTo: number): Promise < NftEarningsEntity > {
        try {
            this.disableActions?.();
            return await this.statisticsApi.fetchNftEarningsByNftId(nftId, timestampFrom, timestampTo);
        } finally {
            this.enableActions?.();
        }
    }

    async fetchNftEarningsByMiningFarmId(miningFarmId: string, timestampFrom: number, timestampTo: number): Promise < MiningFarmEarningsEntity > {
        try {
            this.disableActions?.();
            return await this.statisticsApi.fetchNftEarningsByMiningFarmId(miningFarmId, timestampFrom, timestampTo);
        } finally {
            this.enableActions?.();
        }
    }

    async fetchTotalNftEarnings(timestampFrom: number, timestampTo: number): Promise < TotalEarningsEntity > {
        try {
            this.disableActions?.();
            return await this.statisticsApi.fetchTotalNftEarnings(timestampFrom, timestampTo);
        } finally {
            this.enableActions?.();
        }
    }

    async fetchEarningsPerDay(earningsPerDayFilterEntity: EarningsPerDayFilterEntity): Promise < EarningsPerDayEntity > {
        try {
            this.disableActions?.();
            return await this.statisticsApi.fetchEarningsPerDay(earningsPerDayFilterEntity);
        } finally {
            this.enableActions?.();
        }
    }

    async fetchMiningFarmMaintenanceFee(miningFarmId: string, collectionId: string): Promise < MiningFarmMaintenanceFeeEntity > {
        try {
            this.disableActions?.();
            return await this.statisticsApi.fetchMiningFarmMaintenanceFee(miningFarmId, collectionId);
        } finally {
            this.enableActions?.();
        }
    }

    async fetchMiningFarmTotalEarningsBtc(miningFarmId: string, collectionId: string): Promise < MiningFarmTotalEarningsBtcEntity > {
        try {
            this.disableActions?.();
            return await this.statisticsApi.fetchMiningFarmTotalEarningsBtc(miningFarmId, collectionId);
        } finally {
            this.enableActions?.();
        }
    }

    async fetchMiningFarmTotalEarningsCudos(miningFarmId: string, collectionId: string): Promise < MiningFarmTotalEarningsCudosEntity > {
        try {
            this.disableActions?.();
            return await this.statisticsApi.fetchMiningFarmTotalEarningsCudos(miningFarmId, collectionId);
        } finally {
            this.enableActions?.();
        }
    }

    async fetchPlatformMaintenanceFee(): Promise < PlatformMaintenanceFeeEntity > {
        try {
            this.disableActions?.();
            return await this.statisticsApi.fetchPlatformMaintenanceFee();
        } finally {
            this.enableActions?.();
        }
    }

    async fetchPlatformTotalEarningsBtc(): Promise < PlatformTotalEarningsBtcEntity > {
        try {
            this.disableActions?.();
            return await this.statisticsApi.fetchPlatformTotalEarningsBtc();
        } finally {
            this.enableActions?.();
        }
    }

    async fetchPlatformTotalEarningsCudos(): Promise < PlatformTotalEarningsCudosEntity > {
        try {
            this.disableActions?.();
            return await this.statisticsApi.fetchPlatformTotalEarningsCudos();
        } finally {
            this.enableActions?.();
        }
    }

}
