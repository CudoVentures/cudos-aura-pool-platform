import AllowlistEntity from '../../entities/AllowlistEntity';
import AllowlistUserEntity from '../../entities/AllowlistUserEntity';

export class ResFetchAllowlistUser {

    allowlistUserEntity: AllowlistUserEntity;

    constructor(json: any) {
        this.allowlistUserEntity = AllowlistUserEntity.fromJson(json);
    }
}

export class ResFetchAllowlistEntity {

    allowlistEntity: AllowlistEntity;

    constructor(json: any) {
        this.allowlistEntity = AllowlistEntity.fromJson(json);
    }
}
