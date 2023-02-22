export default class AllowlistUserEntity {

    static fromJson(json): AllowlistUserEntity {
        if (json === null) {
            return null;
        }

        const entity = new AllowlistUserEntity();

        return entity;
    }

    static toJson(allowlistUserEntity: AllowlistUserEntity): any {
        if (allowlistUserEntity === null) {
            return null;
        }

        return {};
    }
}
