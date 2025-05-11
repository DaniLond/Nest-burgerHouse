import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductToppingDto {
  @ApiProperty({
    description: 'Product ID',
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
  })
  @IsUUID()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({
    description: 'Topping ID',
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
  })
  @IsUUID()
  @IsNotEmpty()
  topping_id: string;

  @ApiProperty({
    description: 'Quantity of the topping to add',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  @Type(() => Number)
  quantity: number;
}
