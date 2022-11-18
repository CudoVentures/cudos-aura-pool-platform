import S from '../../../core/utilities/Main';

export default class CategoryEntity {

    categoryId: string;
    categoryName: string;

    constructor() {
        this.categoryId = S.Strings.NOT_EXISTS;
        this.categoryName = '';
    }

    isNew(): boolean {
        return this.categoryId === S.Strings.NOT_EXISTS;
    }

    static toJson(model: CategoryEntity) {
        return {
            'id': parseInt(model.categoryId),
            'categoryName': model.categoryName,
        }
    }

    static fromJson(json: any): CategoryEntity {
        if (json === null) {
            return null;
        }

        const entity = new CategoryEntity();

        entity.categoryId = (json.id ?? entity.categoryId).toString();
        entity.categoryName = json.categoryName ?? entity.categoryName;

        return entity;
    }

}
