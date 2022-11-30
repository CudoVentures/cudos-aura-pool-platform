import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestWithSessionAccounts } from '../../auth/auth.types';
import { NFTDto } from '../dto/nft.dto';
import { NFT } from '../nft.model';
import { NFTService } from '../nft.service';

@Injectable()
export class IsCreatorOrSuperAdminGuard implements CanActivate {
    constructor(private nftService: NFTService) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithSessionAccounts>();
        const {
            sessionAdminEntity,
            sessionSuperAdminEntity,
            body,
        } = request;

        const nftDto = NFTDto.fromJson(body);

        // super admin can do anything
        if (sessionSuperAdminEntity !== null) {
            return true;
        }

        // not super admin, so is it farm admin
        if (sessionAdminEntity === null) {
            return false;
        }

        // it is farm admin, so he can always create a new nft
        if (nftDto.isNew()) {
            return true
        }

        const nft = await this.nftService.findOne(nftDto.id);

        if (!nft) {
            throw new UnauthorizedException(
                `NFT with id ${nftDto.id} is not found`,
            );
        }

        return nft.creator_id === sessionAdminEntity.accountId;
    }
}
