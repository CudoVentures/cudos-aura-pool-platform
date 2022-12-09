import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { RequestWithSessionAccounts } from '../../common/commont.types';
import NftEntity from '../entities/nft.entity';
import { NFTService } from '../nft.service';

@Injectable()
export class IsCreatorOrSuperAdminGuard implements CanActivate {

    // eslint-disable-next-line no-empty-function
    constructor(private nftService: NFTService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithSessionAccounts>();
        const {
            sessionAdminEntity,
            sessionSuperAdminEntity,
            body,
        } = request;

        const nftEntity = NftEntity.fromJson(body);

        // super admin can do anything
        if (sessionSuperAdminEntity !== null) {
            return true;
        }

        // not super admin, so is it farm admin
        if (sessionAdminEntity === null) {
            return false;
        }

        // it is farm admin, so he can always create a new nft
        if (nftEntity.isNew()) {
            return true
        }

        const nft = await this.nftService.findOne(nftEntity.id.toString());

        if (!nft) {
            throw new UnauthorizedException(
                `NFT with id ${nftEntity.id} is not found`,
            );
        }

        return nft.creatorId === sessionAdminEntity.accountId;
    }
}
