import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductTopping } from './product-topping.entity';

@Entity('toppings')
export class Topping {
  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    description: 'Topping ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Extra Cheese',
    description: 'Topping name',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  name: string;

  @ApiProperty({
    example: 2000,
    description: 'Topping price',
  })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({
    example: 5,
    description: 'Maximum amount allowed for this topping',
  })
  @Column('integer')
  maximumAmount: number;

  @ApiProperty({
    example: true,
    description: 'Indicates whether the topping is active',
  })
  @Column('bool', { default: true })
  isActive: boolean;

  @OneToMany(() => ProductTopping, (productTopping) => productTopping.topping)
  productToppings: ProductTopping[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.name = this.name.trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
