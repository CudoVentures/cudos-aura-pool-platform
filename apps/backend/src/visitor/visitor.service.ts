import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import sequelize, { Transaction } from 'sequelize';
import AppRepo from '../common/repo/app.repo';
import { SqlFetchCounts } from './dto/sql.dto';
import VisitorEntity from './entities/visitor.entity';
import VisitorRepo, { VisitorRepoColumn } from './repo/visitor.repo'
import { RefType } from './visitor.types';

@Injectable()
export class VisitorService {

    constructor(
        @InjectModel(VisitorRepo)
        private visitorRepo: typeof VisitorRepo,
    ) {}

    async signalVisitFarm(miningFarmId: number, visitorUuid: string, tx: Transaction) {
        const visitorEntity = VisitorEntity.newInstanceForMiningFarm(miningFarmId, visitorUuid);
        await this.credit(visitorEntity, tx);
    }

    async signalVisitNft(nftId: string, visitorUuid: string, tx: Transaction) {
        const visitorEntity = VisitorEntity.newInstanceForNft(nftId, visitorUuid);
        await this.credit(visitorEntity, tx);
    }

    async fetchMiningFarmVisitsCount(miningFarmIds: number[]): Promise < Map < number, number > > {
        const visitorMap = new Map < number, number >();
        const sqlFetchCounts = await this.fetchCounts(RefType.MINING_FARM, miningFarmIds.map((i) => i.toString()));

        sqlFetchCounts.forEach((sqlFetchCount) => {
            visitorMap.set(parseInt(sqlFetchCount.refId), sqlFetchCount.count);
        });

        return visitorMap;
    }

    async fetchNftsVisitsCountAsMap(nftIds: string[]): Promise < Map < string, number > > {
        const visitorMap = new Map < string, number >();
        const sqlFetchCounts = await this.fetchCounts(RefType.NFT, nftIds);

        sqlFetchCounts.forEach((sqlFetchCount) => {
            visitorMap.set(sqlFetchCount.refId, sqlFetchCount.count);
        });

        return visitorMap;
    }

    async fetchCounts(refType: RefType, refIds: string[]): Promise < SqlFetchCounts[] > {
        const sqlRows = await this.visitorRepo.findAll({
            where: {
                [VisitorRepoColumn.REF_TYPE]: refType,
                [VisitorRepoColumn.REF_ID]: refIds,
            },
            attributes: [
                VisitorRepoColumn.REF_ID,
                [sequelize.fn('COUNT', sequelize.col(VisitorRepoColumn.VISITOR_UUID)), 'count'],
            ],
            group: VisitorRepoColumn.REF_ID,
        });

        return sqlRows.map((sqlRow) => {
            return new SqlFetchCounts(sqlRow);
        });
    }

    private async credit(visitorEntity: VisitorEntity, tx: Transaction = undefined) {
        const visitorRepo = VisitorEntity.toRepo(visitorEntity);
        await this.visitorRepo.findOrCreate({
            where: AppRepo.toJsonWhere(visitorRepo),
            transaction: tx,
        });
    }

}
