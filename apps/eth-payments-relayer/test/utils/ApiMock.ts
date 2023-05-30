import CudosMarketsServiceRepo from '../../src/workers/repos/CudosMarketsServiceRepo';

export default class ApiMock implements CudosMarketsServiceRepo {
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

    async updateLastCheckedHeight(height: number): Promise<void> {
    }

}
