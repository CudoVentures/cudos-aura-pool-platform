export default class AllowlistEntity {

    addresses: string[];

    constructor() {
        this.addresses = [];
    }

    static fromJson(json): AllowlistEntity {
        if (json === null) {
            return null;
        }

        const entity = new AllowlistEntity();

        entity.addresses = json.addresses ?? entity.addresses;

        return entity;
    }

}
