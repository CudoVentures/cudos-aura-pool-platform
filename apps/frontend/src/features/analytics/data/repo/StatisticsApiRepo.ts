import MiningFarmEarningsEntity from '../../entities/MiningFarmEarningsEntity';
import NftEarningsEntity from '../../entities/NftEarningsEntity';
import NftEventEntity from '../../entities/NftEventEntity';
import NftEventFilterModel from '../../entities/NftEventFilterModel';
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

    async fetchNftEvents(nftEventFilterModel: NftEventFilterModel): Promise < { nftEventEntities: NftEventEntity[], total: number } > {
        try {
            this.disableActions?.();
            return this.statisticsApi.fetchNftEvents(nftEventFilterModel);
        } finally {
            this.enableActions?.();
        }
    }

    async fetchNftEarningsBySessionAccount(timestampFrom: number, timestampTo: number): Promise < UserEarningsEntity > {
        try {
            this.disableActions?.();
            return this.statisticsApi.fetchNftEarningsBySessionAccount(timestampFrom, timestampTo);
        } finally {
            this.enableActions?.();
        }
    }

    async fetchNftEarningsByNftId(nftId: string, timestampFrom: number, timestampTo: number): Promise < NftEarningsEntity > {
        try {
            this.disableActions?.();
            return this.statisticsApi.fetchNftEarningsByNftId(nftId, timestampFrom, timestampTo);
        } finally {
            this.enableActions?.();
        }
    }

    async fetchNftEarningsByMiningFarmId(miningFarmId: string, timestampFrom: number, timestampTo: number): Promise < MiningFarmEarningsEntity > {
        try {
            this.disableActions?.();
            return this.statisticsApi.fetchNftEarningsByMiningFarmId(miningFarmId, timestampFrom, timestampTo);
        } finally {
            this.enableActions?.();
        }
    }

}
