import NftEntity from '../../entities/NftEntity';

export default class NftSessionStorage {
    static KEY = 'nfts'

    updateNftsMap(nfts: NftEntity[]): void {
        try {
            const timestampMap = this.getNftsMap();

            nfts.forEach((nftEntity: NftEntity) => {
                timestampMap.set(nftEntity.id, nftEntity);
            });

            this.saveTimestampMap(timestampMap);
        } catch (e) {
            console.log(e);
        }
    }

    getNftsMap(): Map<string, NftEntity> {
        const mapJson = sessionStorage.getItem(NftSessionStorage.KEY);
        const map = new Map<string, NftEntity>(JSON.parse(mapJson));

        return map
    }

    private saveTimestampMap(map: Map<string, NftEntity>) {
        sessionStorage.setItem(NftSessionStorage.KEY, JSON.stringify(Array.from(map.entries())));
    }
}
