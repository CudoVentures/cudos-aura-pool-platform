import { forwardRef, Inject, Injectable } from '@nestjs/common';
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
import NftEntity from '../nft/entities/nft.entity';
import { StatisticsService } from '../statistics/statistics.service';
import CoinGeckoService from '../coin-gecko/coin-gecko.service';
import AddressMintDataEntity from '../nft/entities/address-mint-data.entity';

@Injectable()
export class KycService {

    onfido: Onfido;

    constructor(
        @InjectModel(KycRepo)
        private kycRepo: typeof KycRepo,
        private configService: ConfigService,
        @Inject(forwardRef(() => StatisticsService))
        private statisticsService: StatisticsService,
        private coinGeckoService: CoinGeckoService,
    ) {
        this.onfido = new Onfido({
            apiToken: this.configService.get < string >('APP_ONFIDO_API_TOKEN'),
            region: Region.EU,
        });
    }

    async fetchAndInvalidateKyc(accountEntity: AccountEntity, dbTx: Transaction, dbLock: LOCK = undefined): Promise < KycEntity > {
        let kycEntity = await this.fetchKycByAccount(accountEntity, dbTx, dbLock);
        kycEntity = await this.invalidateOnfidoWorkflows(kycEntity, dbTx);
        return kycEntity;
    }

    async fetchKycByAccount(accountEntity: AccountEntity, dbTx: Transaction, dbLock: LOCK = undefined): Promise < KycEntity > {
        let kycEntity = await this.findKycByAccountId(accountEntity.accountId, dbTx, dbLock);
        if (kycEntity === null) {
            kycEntity = KycEntity.newInstance(accountEntity.accountId);
        }
        return kycEntity;
    }

    async invalidateOnfidoWorkflows(kycEntity: KycEntity, dbTx: Transaction): Promise < KycEntity > {
        const runningWorkflowRunIds = kycEntity.getRunningWorkflowRunIds();
        if (runningWorkflowRunIds.length === 0) {
            return kycEntity;
        }

        const workflowRunsMap = new Map < string, WorkflowRun >();
        for (let i = runningWorkflowRunIds.length; i-- > 0;) {
            try {
                const workflowRun = await this.onfido.workflowRun.find(runningWorkflowRunIds[i]);
                workflowRunsMap.set(workflowRun.id, workflowRun);
            } catch (ex) {
                console.error('There is error fetch workflowRunId so just skip it as it has been submitted');
            }
        }

        kycEntity.workflowRunIds.forEach((workflowRunId, i) => {
            const workflowRun = workflowRunsMap.get(workflowRunId);
            if (workflowRun !== undefined) {
                kycEntity.workflowRunStatuses[i] = workflowRun.status;
            }
        });

        return this.creditKyc(kycEntity, dbTx);
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

    async createWorkflowRun(userEntity: UserEntity, purchasesInUsdSoFar: number, kycEntity: KycEntity, dbTx: Transaction): Promise < KycEntity > {
        const workflowId = this.configService.get < string >('APP_ONFIDO_WORKFLOW_ID');

        const workflorRunParams = WorkflowRunParamsV1Entity.newInstance(userEntity.cudosWalletAddress, purchasesInUsdSoFar);

        const workflowRun: WorkflowRun = await this.onfido.workflowRun.create({
            applicantId: kycEntity.applicantId,
            workflowId,
            customData: workflorRunParams.asCreateWorkflowParams(),
        });

        kycEntity.workflowIds.push(workflowId);
        kycEntity.workflowRunIds.push(workflowRun.id);
        kycEntity.workflowRunStatuses.push(workflowRun.status);
        kycEntity.workflowRunParams.push(WorkflowRunParamsEntity.wrap(workflorRunParams));

        return this.creditKyc(kycEntity, dbTx);
    }

    async generateOnfidoToken(kycEntity: KycEntity): Promise < string > {
        return this.onfido.sdkToken.generate({
            applicantId: kycEntity.applicantId,
        });
    }

    async findKycByAccountId(accountId: number, dbTx: Transaction, dbLock: LOCK = undefined): Promise < KycEntity > {
        const whereKycRepo = new KycRepo();
        whereKycRepo.accountId = accountId;
        const kycRepo = await this.kycRepo.findOne({
            where: AppRepo.toJsonWhere(whereKycRepo),
            transaction: dbTx,
            lock: dbLock,
        });

        return KycEntity.fromRepo(kycRepo);
    }

    async creditKyc(kycEntity: KycEntity, dbTx: Transaction): Promise < KycEntity > {
        let kycRepo = KycEntity.toRepo(kycEntity);
        if (kycEntity.isNew() === true) {
            kycRepo = await this.kycRepo.create(kycRepo.toJSON(), {
                returning: true,
                transaction: dbTx,
            })
        } else {
            const whereKycRepo = new KycRepo();
            whereKycRepo.kycId = kycRepo.kycId;
            const sqlResult = await this.kycRepo.update(kycRepo.toJSON(), {
                where: AppRepo.toJsonWhere(whereKycRepo),
                returning: true,
                transaction: dbTx,
            });
            kycRepo = sqlResult[1].length === 1 ? sqlResult[1][0] : null;
        }

        return KycEntity.fromRepo(kycRepo);
    }

    async canBuyAnNft(accountEntity: AccountEntity, userEntity: UserEntity, nftEntity: NftEntity, dbTx: Transaction, dbLock: LOCK = undefined): Promise < boolean > {
        const kycEntity = await this.fetchKycByAccount(accountEntity, dbTx, dbLock);
        if (kycEntity.isFullVerified() === true) {
            return true;
        }

        const { cudosUsdPrice } = await this.coinGeckoService.fetchCudosPrice();
        const purchasesInUsdSoFar = await this.statisticsService.fetchUsersSpendingOnPlatformInUsd(userEntity, dbTx);
        const nftPriceInUsd = Number(nftEntity.getPriceInCudos().multipliedBy(cudosUsdPrice).toFixed(2));
        if (purchasesInUsdSoFar + nftPriceInUsd < WorkflowRunParamsV1Entity.LIGHT_PARAMS_LIMIT_IN_USD) {
            return kycEntity.isLightVerified();
        }

        return false;
    }

    async creditKycForPresale(accountEntity: AccountEntity, addressMintDataEntity: AddressMintDataEntity, dbTx: Transaction) {
        let kycEntity = await this.fetchKycByAccount(accountEntity, dbTx, dbTx.LOCK.UPDATE);
        kycEntity.firstName = addressMintDataEntity.firstName;
        kycEntity.lastName = addressMintDataEntity.lastName;
        kycEntity.applicantId = addressMintDataEntity.applicantId;

        const hasWorkflowRunId = kycEntity.hasWorkflowRunId(addressMintDataEntity.workflowRunId);
        if (hasWorkflowRunId === false) {
            const workflowId = this.configService.get < string >('APP_ONFIDO_WORKFLOW_ID');
            const workflorRunParams = WorkflowRunParamsV1Entity.newInstance(addressMintDataEntity.cudosAddress, 1001);

            kycEntity.workflowIds.push(workflowId);
            kycEntity.workflowRunIds.push(addressMintDataEntity.workflowRunId);
            kycEntity.workflowRunStatuses.push('processing');
            kycEntity.workflowRunParams.push(WorkflowRunParamsEntity.wrap(workflorRunParams));
        }

        kycEntity = await this.creditKyc(kycEntity, dbTx);
    }

}
