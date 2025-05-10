import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiProperty({
    description: 'Number of items to return',
    default: 10,
    required: false
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    description: 'Number of items to skip',
    default: 0,
    required: false
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}