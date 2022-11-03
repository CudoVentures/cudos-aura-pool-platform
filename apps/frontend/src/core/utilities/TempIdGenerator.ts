export default class TempIdGenerator {

    lastId: number;

    constructor() {
        this.lastId = 0;
    }

    generateNewId(): string {
        this.lastId -= 1;

        return this.lastId.toString();
    }

}
