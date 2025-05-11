import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateToppingDto } from './create-topping.dto';

export class UpdateToppingDto extends PartialType(CreateToppingDto) {
  @ApiProperty({
    description: 'Indicates whether the topping is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
