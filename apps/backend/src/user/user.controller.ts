import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

  @ApiBearerAuth('access-token')
  @Get('verify/resend')
    async resendToken(
    @Request() req,
    ): Promise <void> {
        this.userService.sendVerificationEmail(req.user)
    }

  @Get('verify/:token')
  async verifyUser(
    @Param('token') token: string,
  ): Promise <void> {
      this.userService.verifyEmail(token)
  }

}
