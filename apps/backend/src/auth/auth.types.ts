import { Request } from 'express';
import AccountEntity from '../account/entities/account.entity';
import AdminEntity from '../account/entities/admin.entity';
import SuperAdminEntity from '../account/entities/super-admin.entity';
import UserEntity from '../account/entities/user.entity';

export const SIGN_NONCE = -74563;

export interface RequestWithSessionAccounts extends Request {
    sessionAccountEntity: AccountEntity;
    sessionUserEntity: UserEntity;
    sessionAdminEntity: AdminEntity;
    sessionSuperAdminEntity: SuperAdminEntity;
}
