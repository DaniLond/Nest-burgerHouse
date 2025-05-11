import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Topping } from './topping.entity';

@Entity('product_toppings')
export class ProductTopping {
  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    description: 'Product Topping ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    description: 'Product ID',
  })
  @Column('uuid')
  product_id: string;

  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    description: 'Topping ID',
  })
  @Column('uuid')
  topping_id: string;

  @ApiProperty({
    description: 'Quantity of the topping to add',
    example: 2,
  })
  @Column('integer')
  quantity: number;

  @ManyToOne(() => Product, (product) => product.productToppings)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Topping, (topping) => topping.productToppings)
  @JoinColumn({ name: 'topping_id' })
  topping: Topping;
}
