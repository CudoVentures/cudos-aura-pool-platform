import { ApiProperty } from '@nestjs/swagger';

export class GetUserDto {
    @ApiProperty()
        email: string;
        name: string;
        cudosAddress: string;
}
