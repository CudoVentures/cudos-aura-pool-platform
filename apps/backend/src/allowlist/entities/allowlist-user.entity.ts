export default class AllowlistUserEntity {

    static fromJson(json): AllowlistUserEntity {
        const entity = new AllowlistUserEntity();

        if (json === null) {
            return null;
        }

        return entity;
    }

    static toJson(allowlistUserEntity: AllowlistUserEntity): any {
        return {};
    }
}
