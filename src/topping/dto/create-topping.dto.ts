import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  MinLength,
  IsPositive,
  Min,
  Max,
} from 'class-validator';

export class CreateToppingDto {
  @ApiProperty({
    description: 'Topping name',
    example: 'Extra Cheese',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'Topping price',
    example: 5000,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Maximum amount allowed for this topping',
    example: 5,
    minimum: 1,
    maximum: 10,
  })
  @IsNumber()
  @Min(1, { message: 'Maximum amount must be at least 1' })
  @Max(10, { message: 'Maximum amount cannot exceed 10' })
  maximumAmount: number;
}
