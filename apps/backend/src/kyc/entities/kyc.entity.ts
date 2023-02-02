import { NOT_EXISTS_INT, IntBoolValue } from '../../common/utils';
import KycRepo from '../repo/kyc.repo';

export default class KycEntity {

    kycId: number;
    accountId: number;
    applicantId: string;
    onfidoPassed1000Check: IntBoolValue;

    constructor() {
        this.kycId = NOT_EXISTS_INT;
        this.accountId = NOT_EXISTS_INT;
        this.applicantId = '';
        this.onfidoPassed1000Check = IntBoolValue.FALSE;
    }

    static newInstance(accountId: number) {
        const entity = new KycEntity();

        entity.accountId = accountId;

        return entity;
    }

    isNew(): boolean {
        return this.kycId === NOT_EXISTS_INT;
    }

    static toRepo(entity: KycEntity): KycRepo {
        if (entity === null) {
            return null;
        }

        const repoJson = new KycRepo();

        if (entity.kycId !== NOT_EXISTS_INT) {
            repoJson.kycId = entity.kycId;
        }
        repoJson.accountId = entity.accountId ?? repoJson.accountId;
        repoJson.applicantId = entity.applicantId ?? repoJson.applicantId;
        repoJson.onfidoPassed1000Check = entity.onfidoPassed1000Check ?? repoJson.onfidoPassed1000Check;

        return repoJson;
    }

    static fromRepo(repoJson: KycRepo): KycEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new KycEntity();

        repoJson = repoJson.toJSON();
        entity.kycId = repoJson.kycId ?? entity.kycId;
        entity.accountId = repoJson.accountId ?? entity.accountId;
        entity.applicantId = repoJson.applicantId ?? entity.applicantId;
        entity.onfidoPassed1000Check = repoJson.onfidoPassed1000Check ?? entity.onfidoPassed1000Check;

        return entity;
    }

}
