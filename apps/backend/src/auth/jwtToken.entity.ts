import AccountEntity from '../account/entities/account.entity';
import { NOT_EXISTS_INT } from '../common/utils';

export default class JwtToken {

    id: number;

    constructor() {
        this.id = NOT_EXISTS_INT;
    }

    static newInstance(accountEntity: AccountEntity) {
        const entity = new JwtToken();

        entity.id = accountEntity.accountId;

        return entity;
    }

    static toJson(entity: JwtToken) {
        return {
            'id': entity.id,
        }
    }

    static fromJson(json: any) {
        if (json === null) {
            return null;
        }

        const entity = new JwtToken();

        entity.id = parseInt(json.id ?? entity.id);

        return entity;
    }

}
