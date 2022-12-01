import { Model } from 'sequelize';

export default class AppRepo {

    static toJsonWhere(model: Model) {
        const json = {};

        const changed = model.changed();
        if (changed instanceof Array < string >) {
            (changed as Array < string >).forEach((propName) => {
                json[propName] = model[propName];
            })
        }

        return json;
    }

}
