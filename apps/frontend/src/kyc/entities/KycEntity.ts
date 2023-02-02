import S from '../../core/utilities/Main';

export default class KycEntity {

    kycId: string;
    accountId: string;
    applicantId: string;
    onfidoPassed1000Check: number;

    constructor() {
        this.kycId = S.Strings.NOT_EXISTS;
        this.accountId = S.Strings.NOT_EXISTS;
        this.applicantId = '';
        this.onfidoPassed1000Check = S.INT_TRUE;
    }

    isNew(): boolean {
        return this.kycId === S.Strings.NOT_EXISTS;
    }

    static toJson(entity: KycEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'kycId': entity.kycId,
            'accountId': entity.accountId,
            'applicantId': entity.applicantId,
            'onfidoPassed1000Check': entity.onfidoPassed1000Check,
        }
    }

    static fromJson(json): KycEntity {
        if (json === null) {
            return null;
        }

        const entity = new KycEntity();

        entity.kycId = (json.kycId ?? entity.kycId).toString();
        entity.accountId = (json.accountId ?? entity.accountId).toString();
        entity.applicantId = (json.applicantId ?? entity.applicantId).toString();
        entity.onfidoPassed1000Check = parseInt(json.onfidoPassed1000Check ?? entity.onfidoPassed1000Check);

        return entity;
    }

}
