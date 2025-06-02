import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinTable,
  CreateDateColumn
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Product } from "../../product/entities/product.entity";
import { OrderState } from "../enums/valid-state.enums";

@Entity('orders')
export class Order {
  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    description: 'Order ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 45.99,
    description: 'Total amount of the order',
  })
  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @ApiProperty({
    example: '2023-05-25T12:00:00Z',
    description: 'Date when the order was created',
  })
  @CreateDateColumn({ type: 'timestamp' })
  date: Date;

  @ApiProperty({
    description: 'User who placed the order',
    type: () => User
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('boolean', { default: false })	
  isActive: boolean;

  @ApiProperty({
    description: 'Current state of the order',
    enum: OrderState,
    example: OrderState.Pending
  })
  @Column({
    type: 'enum',
    enum: OrderState,
    default: OrderState.Pending
  })
  state: OrderState;

  @ApiProperty({
    description: 'Products included in the order',
    type: () => [Product]
  })
  @ManyToMany(() => Product)
  @JoinTable({
    name: 'order_product',
    joinColumn: { name: 'orderId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' }
  })
  products: Product[];

  @ApiProperty({
    example: 'Calle 123 #45-67, Barrio Centro, Santiago de Cali, Valle del Cauca, Colombia',
    description: 'Delivery address for the order',
  })
  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'jsonb', nullable: true }) // <- aquí lo haces opcional
  toppings?: {
    productId: string;
    topping: string;
    price: number;
    quantity: number;
  }[];

  @Column({ type: 'jsonb', nullable: true }) // <- aquí lo haces opcional
  items?: {
    productId: string;
    quantity: number;
  }[];

}