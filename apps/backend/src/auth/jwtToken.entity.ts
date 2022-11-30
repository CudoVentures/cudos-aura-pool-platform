import AccountEntity from '../account/entities/account.entity';
import { NOT_EXISTS_INT } from '../common/utils';
import { pbkdf2, createSign, createVerify, pbkdf2Sync } from 'node:crypto';

export default class JwtToken {

    id: number;
    derivedKey: string;

    constructor() {
        this.id = NOT_EXISTS_INT;
        this.derivedKey = '';
    }

    static newInstance(accountEntity: AccountEntity) {

        const derivedKey = pbkdf2Sync(accountEntity.hashedPass.substring(0, 10), 'salt', 100000, 64, 'sha512');

        const entity = new JwtToken();

        entity.id = accountEntity.accountId;
        entity.derivedKey = derivedKey.toString('hex');

        return entity;
    }

    static toJson(entity: JwtToken) {
        return {
            'id': entity.id,
            'derivedKey': entity.derivedKey,
        }
    }

    static fromJson(json: any) {
        if (json === null) {
            return null;
        }

        const entity = new JwtToken();

        entity.id = parseInt(json.id ?? entity.id);
        entity.derivedKey = json.derivedKey ?? entity.derivedKey;

        return entity;
    }

}
