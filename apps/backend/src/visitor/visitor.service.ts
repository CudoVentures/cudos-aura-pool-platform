import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import sequelize, { LOCK, Transaction } from 'sequelize';
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

    async signalVisitFarm(miningFarmId: number, visitorUuid: string, dbTx: Transaction) {
        const visitorEntity = VisitorEntity.newInstanceForMiningFarm(miningFarmId, visitorUuid);
        await this.credit(visitorEntity, dbTx);
    }

    async signalVisitNft(nftId: string, visitorUuid: string, dbTx: Transaction) {
        const visitorEntity = VisitorEntity.newInstanceForNft(nftId, visitorUuid);
        await this.credit(visitorEntity, dbTx);
    }

    async fetchMiningFarmVisitsCount(miningFarmIds: number[], dbTx: Transaction, dbLock: LOCK = undefined): Promise < Map < number, number > > {
        const visitorMap = new Map < number, number >();
        const sqlFetchCounts = await this.fetchCounts(RefType.MINING_FARM, miningFarmIds.map((i) => i.toString()), dbTx);

        sqlFetchCounts.forEach((sqlFetchCount) => {
            visitorMap.set(parseInt(sqlFetchCount.refId), sqlFetchCount.count);
        });

        return visitorMap;
    }

    async fetchNftsVisitsCountAsMap(nftIds: string[], dbTx: Transaction, dbLock: LOCK = undefined): Promise < Map < string, number > > {
        const visitorMap = new Map < string, number >();
        const sqlFetchCounts = await this.fetchCounts(RefType.NFT, nftIds, dbTx);

        sqlFetchCounts.forEach((sqlFetchCount) => {
            visitorMap.set(sqlFetchCount.refId, sqlFetchCount.count);
        });

        return visitorMap;
    }

    async fetchCounts(refType: RefType, refIds: string[], dbTx: Transaction, dbLock: LOCK = undefined): Promise < SqlFetchCounts[] > {
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
            transaction: dbTx,
            lock: dbLock,
        });

        return sqlRows.map((sqlRow) => {
            return new SqlFetchCounts(sqlRow);
        });
    }

    private async credit(visitorEntity: VisitorEntity, dbTx: Transaction, dbLock: LOCK = undefined) {
        const visitorRepo = VisitorEntity.toRepo(visitorEntity);
        await this.visitorRepo.findOrCreate({
            where: AppRepo.toJsonWhere(visitorRepo),
            transaction: dbTx,
            lock: dbLock,
        });
    }

}
