import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
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

    async fetchMiningFarmVisitsCount(miningFarmId: number) {
        const { rows, count } = await this.visitorRepo.findAndCountAll({
            where: {
                refType: RefType.MINING_FARM,
                refId: miningFarmId.toString(),
            },
        })

        return count;
    }

    async fetchNftsVisitsCount(nftId: string) {
        const { rows, count } = await this.visitorRepo.findAndCountAll({
            where: {
                refType: RefType.NFT,
                refId: nftId,
            },
        })

        return count;
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
