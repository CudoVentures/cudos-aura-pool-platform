import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import KycRepo from './repo/kyc.repo';
import { Onfido, Region } from '@onfido/api';
import AccountEntity from '../account/entities/account.entity';
import KycEntity from './entities/kyc.entity';
import { LOCK, Transaction } from 'sequelize';
import AppRepo from '../common/repo/app.repo';

@Injectable()
export class KycService {

    onfido: Onfido;

    constructor(
        @InjectModel(KycRepo)
        private kycRepo: typeof KycRepo,
    ) {
        this.onfido = new Onfido({
            apiToken: '',
            region: Region['EU'],
        });
    }

    async registerApplicant(accountEntity: AccountEntity, tx: Transaction) {
        const kycEntity = KycEntity.newInstance(accountEntity.accountId);

        const applicant = await this.onfido.applicant.create(req.body);
        kycEntity.applicantId = applicant.id;

        await this.creditKyc(kycEntity, tx);
    }

    async generateOnfidoToken(accountEntity: AccountEntity, tx: Transaction): Promise < string > {
        const kycEntity = await this.findKycByAccountId(accountEntity.accountId);
        return this.onfido.sdkToken.generate({ applicantId: kycEntity.applicantId });
    }

    async findKycByAccountId(accountId: number, tx: Transaction = undefined, lock: LOCK = undefined): Promise < KycEntity > {
        const whereKycRepo = new KycRepo();
        whereKycRepo.accountId = accountId;
        const kycRepo = await this.kycRepo.findOne({
            where: AppRepo.toJsonWhere(whereKycRepo),
            transaction: tx,
            lock,
        });

        return KycEntity.fromRepo(kycRepo);
    }

    async creditKyc(kycEntity: KycEntity, tx: Transaction = undefined): Promise < KycEntity > {
        let kycRepo = KycEntity.toRepo(kycEntity);
        if (kycEntity.isNew() === true) {
            kycRepo = await this.kycRepo.create(kycRepo.toJSON(), {
                returning: true,
                transaction: tx,
            })
        } else {
            const whereKycRepo = new KycRepo();
            whereKycRepo.kycId = kycRepo.kycId;
            const sqlResult = await this.kycRepo.update(kycRepo.toJSON(), {
                where: AppRepo.toJsonWhere(whereKycRepo),
                returning: true,
                transaction: tx,
            });
            kycRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;
        }

        return KycEntity.fromRepo(kycRepo);
    }

}
