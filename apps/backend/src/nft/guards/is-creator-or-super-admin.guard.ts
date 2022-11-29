import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithSessionAccounts } from '../../auth/interfaces/request.interface';
import { NFTDto } from '../dto/nft.dto';
import { NFT } from '../nft.model';
import { NFTService } from '../nft.service';

@Injectable()
export class IsCreatorOrSuperAdminGuard extends JwtAuthGuard implements CanActivate {
    constructor(private nftService: NFTService) {
        super();
    }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
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

        return this.nftService
            .findOne(nftDto.id)
            .then((nft: NFT) => nft.creator_id === sessionAdminEntity.accountId);
    }
}
