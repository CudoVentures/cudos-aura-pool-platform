import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import KycRepo from './repo/kyc.repo';
import { Onfido, Region, WorkflowRun } from '@onfido/api';
import AccountEntity from '../account/entities/account.entity';
import KycEntity from './entities/kyc.entity';
import { LOCK, Transaction } from 'sequelize';
import AppRepo from '../common/repo/app.repo';
import { ConfigService } from '@nestjs/config';
import { WorkflowRunParamsEntity, WorkflowRunParamsV1Entity } from './entities/workflow-run-params.entity';
import UserEntity from '../account/entities/user.entity';

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
        kycEntity = await this.invalidateOnfidoWorkflows(kycEntity, tx);
        return kycEntity;
    }

    async fetchKycByAccount(accountEntity: AccountEntity, tx: Transaction = undefined): Promise < KycEntity > {
        let kycEntity = await this.findKycByAccountId(accountEntity.accountId, tx, tx?.LOCK.UPDATE);
        if (kycEntity === null) {
            kycEntity = KycEntity.newInstance(accountEntity.accountId);
        }
        return kycEntity;
    }

    async invalidateOnfidoWorkflows(kycEntity: KycEntity, tx: Transaction): Promise < KycEntity > {
        const runningWorkflowRunIds = kycEntity.getRunningWorkflowRunIds();
        if (runningWorkflowRunIds.length === 0) {
            return kycEntity;
        }

        const workflowRunsMap = new Map < string, WorkflowRun >();
        for (let i = runningWorkflowRunIds.length; i-- > 0;) {
            const workflowRun = await this.onfido.workflowRun.find(runningWorkflowRunIds[i]);
            workflowRunsMap.set(workflowRun.id, workflowRun);
        }

        kycEntity.workflowRunIds.forEach((workflowRunId, i) => {
            const workflowRun = workflowRunsMap.get(workflowRunId);
            if (workflowRun !== undefined) {
                kycEntity.workflowRunStatuses[i] = workflowRun.status;
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

    async createWorkflowRun(userEntity: UserEntity, purchasesInUsdSoFar: number, kycEntity: KycEntity, tx: Transaction): Promise < KycEntity > {
        const workflowId = this.configService.get < string >('APP_ONFIDO_WORKFLOW_ID');
        // if (kycEntity.hasWorkflow(workflowId) === true) {
        //     return kycEntity;
        // }

        const workflorRunParams = WorkflowRunParamsV1Entity.newInstance(userEntity.cudosWalletAddress, purchasesInUsdSoFar);

        const workflowRun: WorkflowRun = await this.onfido.workflowRun.create({
            applicantId: kycEntity.applicantId,
            workflowId,
            customData: workflorRunParams.asCreateWorkflowParams(),
        });

        console.log('creating new workflow run');
        console.log(workflowRun);
        kycEntity.workflowIds.push(workflowId);
        kycEntity.workflowRunIds.push(workflowRun.id);
        kycEntity.workflowRunStatuses.push(workflowRun.status);
        kycEntity.workflowRunParams.push(WorkflowRunParamsEntity.wrap(workflorRunParams));

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
