export default class AllowlistUserEntity {

    constructor() {
    }

    static fromJson(json): AllowlistUserEntity {
        if (json === null) {
            return null;
        }

        const model = new AllowlistUserEntity();

        return model;
    }

}
