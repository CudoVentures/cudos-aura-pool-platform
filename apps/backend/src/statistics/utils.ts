import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export class NFTStatisticsFilters {
  @IsDateString()
  @ApiProperty({ required: true })
  from: Date;

  @IsDateString()
  @ApiProperty({ required: true })
  to: Date;

  @IsString()
  @ApiProperty({ required: true })
  collection_id: number;
}

export class CollectionStatisticsFilters {
  @IsDateString()
  @ApiProperty({ required: true })
  from: Date;

  @IsDateString()
  @ApiProperty({ required: true })
  to: Date;
}
