import { GeneralRepo, GENERAL_REPO_PK } from '../repos/general.repo';

export default class GeneralEntity {

    lastCheckedBlock: number;
    lastCheckedPaymentRelayerEthBlock: number;
    lastCheckedPaymentRelayerCudosBlock: number;

    constructor() {
        this.lastCheckedBlock = 0;
        this.lastCheckedPaymentRelayerEthBlock = 1;
        this.lastCheckedPaymentRelayerCudosBlock = 1;
    }

    static toRepo(entity: GeneralEntity): any {
        if (entity === null) {
            return null;
        }

        const repoJson = new GeneralRepo();

        repoJson.id = GENERAL_REPO_PK;
        repoJson.lastCheckedBlock = entity.lastCheckedBlock;
        repoJson.lastCheckedPaymentRelayerEthBlock = entity.lastCheckedPaymentRelayerEthBlock;
        repoJson.lastCheckedPaymentRelayerCudosBlock = entity.lastCheckedPaymentRelayerCudosBlock;

        return repoJson;
    }

    static fromRepo(repoJson: GeneralRepo): GeneralEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new GeneralEntity();

        entity.lastCheckedBlock = repoJson.lastCheckedBlock ?? entity.lastCheckedBlock;
        entity.lastCheckedPaymentRelayerEthBlock = repoJson.lastCheckedPaymentRelayerEthBlock ?? entity.lastCheckedPaymentRelayerEthBlock;
        entity.lastCheckedPaymentRelayerCudosBlock = repoJson.lastCheckedPaymentRelayerCudosBlock ?? entity.lastCheckedPaymentRelayerCudosBlock;

        return entity;
    }

}
