import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../../auth/interfaces/request.interface';

@Injectable()
export class IsUserGuard extends JwtAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithUser>();
        const { user, params } = request;

        if (!user || !params) return false;

        const userId = user.id;
        const userToUpdateId = Number(params.id);

        return userId === userToUpdateId;
    }
}
