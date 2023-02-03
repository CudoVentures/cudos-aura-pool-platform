import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import KycRepo from './repo/kyc.repo';
import { Check, Onfido, Region } from '@onfido/api';
import AccountEntity from '../account/entities/account.entity';
import KycEntity from './entities/kyc.entity';
import { LOCK, Transaction } from 'sequelize';
import AppRepo from '../common/repo/app.repo';
import { IntBoolValue } from '../common/utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KycService {

    onfido: Onfido;

    constructor(
        @InjectModel(KycRepo)
        private kycRepo: typeof KycRepo,
        private configService: ConfigService,
    ) {
        this.onfido = new Onfido({
            apiToken: this.configService.get < string >('APP_ONFIDO_API_TOKEN'),
            region: Region.US,
        });
    }

    async fetchAndInvalidateKyc(accountEntity: AccountEntity, tx: Transaction = undefined): Promise < KycEntity > {
        let kycEntity = await this.fetchKycByAccount(accountEntity, tx);
        if (kycEntity.hasRegisteredApplicant() === true) {
            kycEntity = await this.invalidateOnfidoChecks(kycEntity, tx);
        }
        return kycEntity;
    }

    async fetchKycByAccount(accountEntity: AccountEntity, tx: Transaction = undefined): Promise < KycEntity > {
        let kycEntity = await this.findKycByAccountId(accountEntity.accountId, tx, tx?.LOCK.UPDATE);
        if (kycEntity === null) {
            kycEntity = KycEntity.newInstance(accountEntity.accountId);
        }
        return kycEntity;
    }

    async invalidateOnfidoChecks(kycEntity: KycEntity, tx: Transaction): Promise < KycEntity > {
        const checks = await this.onfido.check.list(kycEntity.applicantId);
        const checksMap = new Map < string, Check >();
        checks.forEach((check) => {
            checksMap.set(check.id, check);
        });

        kycEntity.checkIds.forEach((checkId, i) => {
            const check = checksMap.get(checkId);
            if (check !== undefined) {
                kycEntity.checkResults[i] = check.result;
            }
        });

        return this.creditKyc(kycEntity, tx);
    }

    async creditOnfidoApplicant(kycEntity: KycEntity): Promise < void > {
        if (kycEntity.hasRegisteredApplicant() === false) {
            const applicant = await this.onfido.applicant.create({
                firstName: kycEntity.firstName,
                lastName: kycEntity.lastName,
            });
            kycEntity.applicantId = applicant.id;
        } else {
            await this.onfido.applicant.update(kycEntity.applicantId, {
                firstName: kycEntity.firstName,
                lastName: kycEntity.lastName,
            });
        }
    }

    async createOnfidoCheck(kycEntity: KycEntity, tx: Transaction): Promise < KycEntity > {
        if (kycEntity.hasDocumentReport() === true) {
            return kycEntity;
        }

        const reports = ['document'];

        const check = await this.onfido.check.create({
            applicantId: kycEntity.applicantId,
            reportNames: reports,
        });

        kycEntity.reports.push(reports);
        kycEntity.checkIds.push(check.id);
        kycEntity.checkResults.push(check.result);

        return this.creditKyc(kycEntity, tx);
    }

    async generateOnfidoToken(kycEntity: KycEntity): Promise < string > {
        return this.onfido.sdkToken.generate({
            applicantId: kycEntity.applicantId,
        });
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
