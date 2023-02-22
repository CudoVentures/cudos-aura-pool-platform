import AllowlistEntity from '../../entities/AllowlistEntity';
import AllowlistUserEntity from '../../entities/AllowlistUserEntity';

export class ResFetchTotalListedUsers {

    allowlistEntity: AllowlistEntity;

    constructor(axiosData: any) {
        this.allowlistEntity = AllowlistEntity.fromJson(axiosData.allowlistEntity);
    }
}

export class ResFetchAllowlistUserBySessionAccount {

    allowlistUserEntity: AllowlistUserEntity;

    constructor(axiosData: any) {
        this.allowlistUserEntity = AllowlistUserEntity.fromJson(axiosData.allowlistUserEntity);
    }
}
