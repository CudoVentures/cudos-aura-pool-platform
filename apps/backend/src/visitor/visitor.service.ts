import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import sequelize from 'sequelize';
import { RefType, VisitorEntity } from './visitor.entity'

@Injectable()
export class VisitorService {

    constructor(
        @InjectModel(VisitorEntity)
        private visitorRepo: typeof VisitorEntity,
    ) {}

    async signalVisitFarm(miningFarmId: number, visitorUuid: string) {
        const visitorEntity = VisitorEntity.newInstanceForMiningFarm(miningFarmId, visitorUuid);
        await this.credit(visitorEntity);
    }

    async signalVisitNft(nftId: string, visitorUuid: string) {
        const visitorEntity = VisitorEntity.newInstanceForNft(nftId, visitorUuid);
        await this.credit(visitorEntity);
    }

    async fetchMiningFarmVisitsCount(miningFarmIds: number[]): Promise < Map < number, number > > {
        const visitorMap = new Map < number, number >();
        const sqlResult = await this.fetchCounts(RefType.MINING_FARM, miningFarmIds.map((i) => i.toString()));

        sqlResult.forEach((sqlEntry) => {
            visitorMap.set(parseInt(sqlEntry.getDataValue('refId')), parseInt(sqlEntry.getDataValue('count')));
        });

        return visitorMap;
    }

    async fetchNftsVisitsCountAsMap(nftIds: string[]): Promise < Map < string, number > > {
        const visitorMap = new Map < string, number >();
        const sqlResult = await this.fetchCounts(RefType.NFT, nftIds);

        sqlResult.forEach((sqlEntry) => {
            visitorMap.set(sqlEntry.getDataValue('refId'), parseInt(sqlEntry.getDataValue('count')));
        });

        return visitorMap;
    }

    async fetchCounts(refType: RefType, refIds: string[]): Promise < any[] > {
        return this.visitorRepo.findAll({
            where: {
                refType,
                refId: refIds,
            },
            attributes: [
                ['ref_id', 'refId'],
                [sequelize.fn('COUNT', sequelize.col('visitor_uuid')), 'count'],
            ],
            group: 'ref_id',
        });
    }

    private async credit(visitorEntity: VisitorEntity) {
        await this.visitorRepo.findOrCreate({
            where: {
                refType: visitorEntity.refType,
                refId: visitorEntity.refId,
                visitorUuid: visitorEntity.visitorUuid,
            },
        });
    }

}
