import CudosAuraPoolServiceRepo from '../../src/workers/repos/CudosAuraPoolServiceRepo';

export default class ApiMock implements CudosAuraPoolServiceRepo {
    height: number;

    constructor(height) {
        this.height = height;
    }

    async fetchHeartbeat(): Promise<void> {
    }

    async fetchLastCheckedBlock(): Promise<number> {
        return this.height;
    }

    async triggerUpdateCollections(denomIds: string[]): Promise<void> {

    }

    async triggerUpdateNfts(tokenIds: string[]): Promise<void> {
    }

    async updateLastCheckedheight(height: number): Promise<void> {
    }

}
