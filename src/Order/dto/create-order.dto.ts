import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsUUID, IsEnum } from 'class-validator';
import { OrderState } from './../enums/valid-state.enums';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Total amount of the order',
    example: 45.99,
    minimum: 0
  })
  @IsNumber()
  @IsPositive()
  total: number;

  @ApiProperty({
    description: 'Date of the order',
    example: '2023-05-25T12:00:00Z'
  })
  @IsDate()
  @IsOptional()
  date?: Date;

  @ApiProperty({
    description: 'User ID',
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8'
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'State of the order',
    example: OrderState.Pending,
    enum: OrderState
  })
  @IsEnum(OrderState)
  @IsOptional()
  state?: OrderState;

  @ApiProperty({
    description: 'Array of product IDs in the order',
    example: ['cd533345-f1f3-48c9-a62e-7dc2da50c8f8', '7dc2da50c8f8-cd533345-f1f3-48c9-a62e']
  })
  @IsUUID('all', { each: true })
  @IsNotEmpty()
  productIds: string[];
}