import AllowlistUserEntity from '../entities/allowlist-user.entity';
import AllowlistEntity from '../entities/allowlist.entity';

export class ResFetchAllowlist {

    allowlistEntity: any;

    constructor(allowlistEntity: AllowlistEntity) {
        this.allowlistEntity = AllowlistEntity.toJson(allowlistEntity);
    }
}

export class ResFetchAllowlistUserBySessionAccount {

    allowlistUserEntity: any;

    constructor(allowlistUserEntity: AllowlistUserEntity) {
        this.allowlistUserEntity = AllowlistUserEntity.toJson(allowlistUserEntity);
    }
}
