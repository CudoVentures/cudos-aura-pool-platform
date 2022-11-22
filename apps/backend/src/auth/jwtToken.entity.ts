import { User } from '../user/user.model';

export default class JwtToken {

    id: number;

    constructor() {
        this.id = -1;
    }

    static newInstance(user: User) {
        const entity = new JwtToken();

        entity.id = user.id;

        return entity;
    }

    static toJson(entity: JwtToken) {
        return {
            'id': entity.id,
        }
    }

    static fromJson(json: any) {
        if (json === null) {
            return null;
        }

        const entity = new JwtToken();

        entity.id = parseInt(json.id ?? entity.id);

        return entity;
    }

}
