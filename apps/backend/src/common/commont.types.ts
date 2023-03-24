import { Request } from 'express';
import { Transaction } from 'sequelize';
import { Logger } from 'winston';
import AccountEntity from '../account/entities/account.entity';
import AdminEntity from '../account/entities/admin.entity';
import SuperAdminEntity from '../account/entities/super-admin.entity';
import UserEntity from '../account/entities/user.entity';

export interface RequestWithLogger extends Request {
    logger: Logger;
}

export interface RequestWithSessionAccounts extends RequestWithLogger {
    sessionAccountEntity: AccountEntity;
    sessionUserEntity: UserEntity;
    sessionAdminEntity: AdminEntity;
    sessionSuperAdminEntity: SuperAdminEntity;
}

export interface RequestWithTransaction extends RequestWithLogger {
    transaction: Transaction;
}

export type AppRequest = RequestWithSessionAccounts & RequestWithTransaction;
