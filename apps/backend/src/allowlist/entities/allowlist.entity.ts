export default class AllowlistEntity {

    users: string[];

    constructor() {
        this.users = [];
    }

    static fromJson(json): AllowlistEntity {
        if (json === null) {
            return null;
        }

        const entity = new AllowlistEntity();

        entity.users = json.users ?? entity.users;

        return entity;
    }

    static toJson(allowlistEntity: AllowlistEntity) {
        return {}
    }
}
