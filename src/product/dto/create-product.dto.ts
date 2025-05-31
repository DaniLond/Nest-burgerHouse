import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  MinLength,
  IsPositive,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { ProductCategories } from '../enums/valid-categories.enum';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Classic Burger',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Delicious beef burger with lettuce, tomato, and special sauce',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Product price',
    example: 20.0,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Product category',
    example: ProductCategories.burgers,
    enum: ProductCategories,
  })
  @IsEnum(ProductCategories)
  category: ProductCategories;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/images/classic-burger.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'imageUrl must be a valid URL' })
  imageUrl?: string;
}
