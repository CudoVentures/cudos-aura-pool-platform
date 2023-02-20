import AllowlistUserEntity from '../entities/allowlist-user.entity';
import AllowlistEntity from '../entities/allowlist.entity';

export class ResFetchAllowlistUser {

    allowlistUserEntity: any;

    constructor(allowlistUserEntity: AllowlistUserEntity) {
        this.allowlistUserEntity = AllowlistUserEntity.toJson(allowlistUserEntity);
    }
}

export class ResFetchAllowlistEntity {

    allowlistEntity: any;

    constructor(allowlistEntity: AllowlistEntity) {
        this.allowlistEntity = AllowlistEntity.toJson(allowlistEntity);
    }
}
