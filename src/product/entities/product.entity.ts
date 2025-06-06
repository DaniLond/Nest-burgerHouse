import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductCategories } from '../enums/valid-categories.enum';
import { ProductTopping } from '../../topping/entities/product-topping.entity';

export interface Topping {
  topping: string;
  quantity: number;
}


@Entity('products')
export class Product {
  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    description: 'Product ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Classic Burger',
    description: 'Product name',
  })
  @Column('text')
  name: string;

  @ApiProperty({
    example: 'Delicious beef burger with lettuce, tomato, and special sauce',
    description: 'Product description',
  })
  @Column('text')
  description: string;

  @ApiProperty({
    example: 20.0,
    description: 'Product price',
  })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({
    example: true,
    description: 'Indicates whether the product is active',
  })
  @Column('bool', { default: true })
  isActive: boolean;

  @ApiProperty({
    example: ProductCategories.burgers,
    description: 'Product category',
    enum: ProductCategories,
  })
  @Column({
    type: 'enum',
    enum: ProductCategories,
    default: ProductCategories.burgers,
  })
  category: ProductCategories;

  @ApiProperty({
    example: 'https://example.com/images/classic-burger.jpg',
    description: 'Product image URL',
    required: false,
  })
  @Column('text', { nullable: true })
  imageUrl?: string;

  @Column('text', { nullable: true })
  toppings: ProductTopping[];

  @OneToMany(() => ProductTopping, (productTopping) => productTopping.product)
  productToppings: ProductTopping[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.name = this.name.trim();
    if (this.imageUrl) {
      this.imageUrl = this.imageUrl.trim();
    }
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
