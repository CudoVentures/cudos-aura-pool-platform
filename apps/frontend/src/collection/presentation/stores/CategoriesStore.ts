import CategoryEntity from '../../entities/CategoryEntity';
import CollectionRepo from '../repos/CollectionRepo';

export default class CategoriesStore {

    collectionRepo: CollectionRepo

    inited: boolean;
    categoryEntities: CategoryEntity[];

    constructor(collectionRepo: CollectionRepo) {
        this.collectionRepo = collectionRepo;

        this.inited = false;
        this.categoryEntities = null;
    }

    async init() {
        if (this.inited === true) {
            return;
        }

        this.inited = true;
        this.categoryEntities = await this.collectionRepo.fetchCategories();
    }

}
