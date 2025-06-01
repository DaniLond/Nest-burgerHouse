import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, MaxLength } from 'class-validator';
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

  @ApiProperty({
    description: 'Updated delivery address for the order',
    example: 'Calle 456 #78-90, Barrio Norte, Santiago de Cali, Valle del Cauca, Colombia',
    maxLength: 500,
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;
}

