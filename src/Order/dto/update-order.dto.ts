import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { OrderState } from '../enums/valid-state.enums';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty({
    description: 'New state for the order',
    example: OrderState.Preparing,
    enum: OrderState,
    required: false
  })
  @IsEnum(OrderState)
  @IsOptional()
  state?: OrderState;
}