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
import { AccountType } from '../account/account.types';
import RoleGuard from '../auth/guards/role.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IsUserGuard } from './guards/is-user.guard'
import { User } from './user.model';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

  @Get(':email')
    async findOne(@Param('email') email: string): Promise<Partial<User>> {
        const user = await this.userService.findOne(email);
        const { salt, hashed_pass, ...rest } = user.toJSON()

        return rest
    }

  @ApiBearerAuth('access-token')
  @UseGuards(RoleGuard([AccountType.SUPER_ADMIN]))
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
      return this.userService.createFarmAdmin(createUserDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(RoleGuard([AccountType.SUPER_ADMIN, AccountType.ADMIN]), IsUserGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
      return this.userService.updateOne(id, updateUserDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(RoleGuard([AccountType.SUPER_ADMIN, AccountType.ADMIN]), IsUserGuard)
  @Patch(':id/password')
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<User> {
      return this.userService.changePassword(id, changePasswordDto.old_password, changePasswordDto.password);
  }

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
